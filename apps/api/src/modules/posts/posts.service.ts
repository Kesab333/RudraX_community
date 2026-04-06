import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PostLifecycleState, Prisma, VisibilityState } from "@prisma/client";
import { MAX_TAGS_PER_POST, normalizeTag, slugifyTitle } from "@rudrax/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { TaskQueueService } from "../../common/services/task-queue.service";
import { toPrismaCategory, toPrismaPostType, toPrismaVisibility } from "../../common/utils/community-mappers";
import { decodeCursor, encodeCursor, resolveLimit } from "../../common/utils/pagination";
import type { RequestUser } from "../../common/types/request-user.type";
import type { CreatePostDto, ListPostsQueryDto, PublishPostDto, UpdatePostDto } from "./posts.dto";

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasks: TaskQueueService,
  ) {}

  async list(query: ListPostsQueryDto) {
    const limit = resolveLimit(query.limit);
    const cursor = decodeCursor(query.cursor);
    const where: Prisma.PostWhereInput = {
      visibility: VisibilityState.PUBLIC,
      lifecycleState: {
        in: [PostLifecycleState.PUBLISHED, PostLifecycleState.EDITED, PostLifecycleState.LOCKED],
      },
      deletedAt: null,
      ...(query.category ? { category: toPrismaCategory(query.category) } : {}),
      ...(query.type ? { type: toPrismaPostType(query.type) } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { excerpt: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor[1] },
            skip: 1,
          }
        : {}),
      include: {
        author: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const last = items.at(-1);

    return {
      data: items.map((post) => this.serializePost(post)),
      nextCursor: last ? encodeCursor([last.createdAt.toISOString(), last.id]) : null,
      limit,
    };
  }

  async getBySlug(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        slug,
        visibility: VisibilityState.PUBLIC,
        deletedAt: null,
      },
      include: {
        author: true,
        tags: {
          include: {
            tag: true,
          },
        },
        attachments: true,
      },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return this.serializePost(post);
  }

  async create(user: RequestUser, dto: CreatePostDto) {
    const visibility = toPrismaVisibility(dto.visibility ?? "draft");
    const lifecycleState =
      visibility === VisibilityState.DRAFT
        ? PostLifecycleState.DRAFT
        : PostLifecycleState.PUBLISHED;
    const normalizedTags = [...new Set((dto.tags ?? []).map(normalizeTag).filter(Boolean))].slice(
      0,
      MAX_TAGS_PER_POST,
    );
    const slug =
      lifecycleState === PostLifecycleState.PUBLISHED
        ? await this.ensureUniqueSlug(dto.title)
        : null;

    const post = await this.prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          slug,
          title: dto.title,
          excerpt: dto.content.slice(0, 240),
          content: dto.content,
          category: toPrismaCategory(dto.category),
          type: toPrismaPostType(dto.type),
          visibility,
          lifecycleState,
          publishedAt: lifecycleState === PostLifecycleState.PUBLISHED ? new Date() : null,
          authorId: user.id,
        },
        include: {
          author: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      await tx.postVersion.create({
        data: {
          postId: created.id,
          version: 1,
          title: created.title,
          excerpt: created.excerpt,
          content: created.content,
          createdById: user.id,
        },
      });

      await this.syncTags(tx, created.id, normalizedTags);

      if (lifecycleState === PostLifecycleState.PUBLISHED) {
        await tx.xpLedger.create({
          data: {
            userId: user.id,
            eventType: "POST_CREATED",
            delta: 10,
            referenceId: created.id,
          },
        });
        await tx.user.update({
          where: { id: user.id },
          data: { xp: { increment: 10 } },
        });
      }

      return tx.post.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          author: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    if (post.lifecycleState !== PostLifecycleState.DRAFT) {
      await this.tasks.enqueueSearchIndex("post", post.id);
    }

    return this.serializePost(post);
  }

  async update(postId: string, user: RequestUser, dto: UpdatePostDto) {
    const existing = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException("Post not found");
    }

    if (existing.authorId !== user.id) {
      throw new ForbiddenException("Only the author can edit this post");
    }

    const nextTitle = dto.title ?? existing.title;
    const nextContent = dto.content ?? existing.content;
    const nextTags = dto.tags
      ? [...new Set(dto.tags.map(normalizeTag).filter(Boolean))].slice(0, MAX_TAGS_PER_POST)
      : existing.tags.map((item) => item.tag.slug);

    const updated = await this.prisma.$transaction(async (tx) => {
      const versionCount = await tx.postVersion.count({
        where: { postId: existing.id },
      });

      await tx.postVersion.create({
        data: {
          postId: existing.id,
          version: versionCount + 1,
          title: nextTitle,
          excerpt: nextContent.slice(0, 240),
          content: nextContent,
          createdById: user.id,
        },
      });

      await tx.post.update({
        where: { id: existing.id },
        data: {
          title: nextTitle,
          excerpt: nextContent.slice(0, 240),
          content: nextContent,
          category: dto.category ? toPrismaCategory(dto.category) : existing.category,
          type: dto.type ? toPrismaPostType(dto.type) : existing.type,
          visibility: dto.visibility ? toPrismaVisibility(dto.visibility) : existing.visibility,
          lifecycleState:
            existing.lifecycleState === PostLifecycleState.DRAFT
              ? existing.lifecycleState
              : PostLifecycleState.EDITED,
        },
      });

      await this.syncTags(tx, existing.id, nextTags);

      return tx.post.findUniqueOrThrow({
        where: { id: existing.id },
        include: {
          author: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    await this.tasks.enqueueSearchIndex("post", existing.id);
    return this.serializePost(updated);
  }

  async publish(postId: string, user: RequestUser, dto: PublishPostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: true, tags: { include: { tag: true } } },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.authorId !== user.id) {
      throw new ForbiddenException("Only the author can publish this post");
    }

    const slug = post.slug ?? (await this.ensureUniqueSlug(post.title));
    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        slug,
        visibility: toPrismaVisibility(dto.visibility ?? "public"),
        lifecycleState: PostLifecycleState.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        author: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    await this.tasks.enqueueSearchIndex("post", updated.id);
    return this.serializePost(updated);
  }

  async toggleLike(postId: string, user: RequestUser) {
    const existing = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.like.delete({
          where: {
            userId_postId: {
              userId: user.id,
              postId,
            },
          },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);

      return { liked: false };
    }

    await this.prisma.$transaction([
      this.prisma.like.create({
        data: {
          userId: user.id,
          postId,
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    return { liked: true };
  }

  async toggleBookmark(postId: string, user: RequestUser) {
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    if (existing) {
      await this.prisma.bookmark.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId,
          },
        },
      });

      return { bookmarked: false };
    }

    await this.prisma.bookmark.create({
      data: {
        userId: user.id,
        postId,
      },
    });

    return { bookmarked: true };
  }

  private async ensureUniqueSlug(title: string): Promise<string> {
    const base = slugifyTitle(title) || "post";
    let attempt = base;
    let suffix = 1;

    while (await this.prisma.post.findFirst({ where: { slug: attempt } })) {
      suffix += 1;
      attempt = `${base}-${suffix}`;
    }

    return attempt;
  }

  private async syncTags(tx: Prisma.TransactionClient, postId: string, tags: string[]) {
    await tx.postTag.deleteMany({ where: { postId } });

    if (!tags.length) {
      return;
    }

    for (const slug of tags) {
      const tag = await tx.tag.upsert({
        where: { slug },
        update: {
          usageCount: { increment: 1 },
        },
        create: {
          slug,
          label: slug,
          usageCount: 1,
        },
      });

      await tx.postTag.create({
        data: {
          postId,
          tagId: tag.id,
        },
      });
    }
  }

  private serializePost(post: any) {
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category.toLowerCase(),
      type: post.type.toLowerCase().replace(/_/g, "-"),
      visibility: post.visibility.toLowerCase(),
      lifecycleState: post.lifecycleState.toLowerCase(),
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
        role: post.author.role.toLowerCase(),
        xp: post.author.xp,
        avatarUrl: post.author.avatarUrl,
      },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      tags: post.tags?.map((tag) => tag.tag.slug) ?? [],
      isPinned: Boolean(post.pinnedAt),
      isLocked: Boolean(post.lockedAt),
    };
  }
}
