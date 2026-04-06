import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PostType, VisibilityState } from "@prisma/client";
import { COMMENT_MAX_DEPTH } from "@rudrax/shared";
import { TaskQueueService } from "../../common/services/task-queue.service";
import { decodeCursor, encodeCursor, resolveLimit } from "../../common/utils/pagination";
import type { RequestUser } from "../../common/types/request-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateCommentDto, ListCommentsQueryDto } from "./comments.dto";

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasks: TaskQueueService,
  ) {}

  async list(postId: string, query: ListCommentsQueryDto) {
    const limit = resolveLimit(query.limit);
    const cursor = decodeCursor(query.cursor);
    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
        deletedAt: null,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor[1] },
            skip: 1,
          }
        : {}),
      include: {
        author: true,
      },
    });

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;
    const last = items.at(-1);

    return {
      data: items.map((comment) => this.serializeComment(comment)),
      nextCursor: last ? encodeCursor([last.createdAt.toISOString(), last.id]) : null,
      limit,
    };
  }

  async create(user: RequestUser, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: dto.postId },
    });

    if (!post || post.deletedAt || post.visibility === VisibilityState.DRAFT) {
      throw new NotFoundException("Post not found");
    }

    if (post.lockedAt) {
      throw new ForbiddenException("Post is locked");
    }

    let depth = 0;
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent || parent.postId !== dto.postId) {
        throw new NotFoundException("Parent comment not found");
      }

      depth = parent.depth + 1;
    }

    if (depth >= COMMENT_MAX_DEPTH) {
      throw new ForbiddenException(`Comments are limited to ${COMMENT_MAX_DEPTH} levels`);
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: {
          postId: dto.postId,
          authorId: user.id,
          parentId: dto.parentId ?? null,
          depth,
          content: dto.content,
        },
        include: {
          author: true,
        },
      });

      await tx.post.update({
        where: { id: dto.postId },
        data: { commentCount: { increment: 1 } },
      });

      await tx.xpLedger.create({
        data: {
          userId: user.id,
          eventType: "COMMENT_CREATED",
          delta: 5,
          referenceId: created.id,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: 5 },
        },
      });

      return created;
    });

    await this.tasks.enqueueSearchIndex("comment", comment.id);
    return this.serializeComment(comment);
  }

  async acceptAnswer(commentId: string, user: RequestUser) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: true,
      },
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.depth !== 0) {
      throw new ForbiddenException("Only top-level comments can be accepted");
    }

    if (comment.post.type !== PostType.QUESTION) {
      throw new ForbiddenException("Accepted answers are only available for question posts");
    }

    if (comment.post.authorId !== user.id && !["moderator", "admin"].includes(user.role)) {
      throw new ForbiddenException("Only the post author or a moderator can accept an answer");
    }

    await this.prisma.$transaction([
      this.prisma.comment.update({
        where: { id: commentId },
        data: {
          isAcceptedAnswer: true,
        },
      }),
      this.prisma.post.update({
        where: { id: comment.postId },
        data: {
          acceptedCommentId: commentId,
        },
      }),
      this.prisma.xpLedger.create({
        data: {
          userId: comment.authorId,
          eventType: "ANSWER_ACCEPTED",
          delta: 20,
          referenceId: commentId,
        },
      }),
      this.prisma.user.update({
        where: { id: comment.authorId },
        data: {
          xp: { increment: 20 },
        },
      }),
    ]);

    return { accepted: true };
  }

  private serializeComment(comment: any) {
    return {
      id: comment.id,
      postId: comment.postId,
      author: {
        id: comment.author.id,
        name: comment.author.name,
        email: comment.author.email,
        role: comment.author.role.toString().toLowerCase(),
        xp: comment.author.xp,
        avatarUrl: comment.author.avatarUrl,
      },
      content: comment.content,
      parentId: comment.parentId,
      depth: comment.depth,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      deletedAt: comment.deletedAt?.toISOString() ?? null,
      isAcceptedAnswer: comment.isAcceptedAnswer,
    };
  }
}
