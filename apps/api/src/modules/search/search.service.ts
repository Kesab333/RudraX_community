import { Injectable } from "@nestjs/common";
import { SearchSourceType, VisibilityState } from "@prisma/client";
import { decodeCursor, encodeCursor, resolveLimit } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import type { SearchQueryDto } from "./search.dto";

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async query(dto: SearchQueryDto) {
    const limit = resolveLimit(dto.limit);
    const cursor = decodeCursor(dto.cursor);

    const documents = await this.prisma.searchDocument.findMany({
      where: {
        visibility: VisibilityState.PUBLIC,
        deletedAt: null,
        searchableText: {
          contains: dto.query,
          mode: "insensitive",
        },
        ...(dto.kind ? { sourceType: dto.kind.toUpperCase() as SearchSourceType } : {}),
      },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor[1] },
            skip: 1,
          }
        : {}),
    });

    const hasMore = documents.length > limit;
    const items = hasMore ? documents.slice(0, limit) : documents;
    const last = items.at(-1);
    const postIds = items
      .filter((document) => document.sourceType === SearchSourceType.POST)
      .map((document) => document.sourceId);
    const commentIds = items
      .filter((document) => document.sourceType === SearchSourceType.COMMENT)
      .map((document) => document.sourceId);

    const [posts, comments] = await Promise.all([
      postIds.length
        ? this.prisma.post.findMany({
            where: { id: { in: postIds } },
            select: { id: true, slug: true },
          })
        : Promise.resolve([]),
      commentIds.length
        ? this.prisma.comment.findMany({
            where: { id: { in: commentIds } },
            select: { id: true, post: { select: { slug: true } } },
          })
        : Promise.resolve([]),
    ]);

    const postSlugById = new Map(posts.map((post) => [post.id, post.slug]));
    const commentPostSlugById = new Map(
      comments.map((comment) => [comment.id, comment.post.slug]),
    );

    return {
      data: items.map((document) => ({
        id: document.id,
        kind: document.sourceType.toLowerCase(),
        title: document.title,
        excerpt: document.excerpt,
        score: 1,
        url: this.resolveUrl(document.sourceType, document.sourceId, postSlugById, commentPostSlugById),
      })),
      nextCursor: last ? encodeCursor([last.updatedAt.toISOString(), last.id]) : null,
      limit,
    };
  }

  private resolveUrl(
    sourceType: SearchSourceType,
    sourceId: string,
    postSlugById: Map<string, string | null>,
    commentPostSlugById: Map<string, string | null>,
  ) {
    if (sourceType === SearchSourceType.POST) {
      const slug = postSlugById.get(sourceId);
      return slug ? `/community/post/${slug}` : "/community";
    }

    if (sourceType === SearchSourceType.COMMENT) {
      const slug = commentPostSlugById.get(sourceId);
      return slug ? `/community/post/${slug}#comment-${sourceId}` : "/community";
    }

    return "/community";
  }
}
