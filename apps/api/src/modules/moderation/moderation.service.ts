import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ModerationActionType, PostLifecycleState } from "@prisma/client";
import type { RequestUser } from "../../common/types/request-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import type { ModerateActionDto, ReportPostDto } from "./moderation.dto";

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async report(user: RequestUser, dto: ReportPostDto) {
    if (!dto.postId && !dto.commentId) {
      throw new ForbiddenException("A postId or commentId is required");
    }

    return this.prisma.report.create({
      data: {
        postId: dto.postId,
        commentId: dto.commentId,
        reporterId: user.id,
        reason: dto.reason,
      },
    });
  }

  async pin(postId: string, actor: RequestUser, dto: ModerateActionDto) {
    return this.updatePostWithAction(postId, actor, ModerationActionType.PIN, {
      pinnedAt: new Date(),
    }, dto.notes);
  }

  async unpin(postId: string, actor: RequestUser, dto: ModerateActionDto) {
    return this.updatePostWithAction(postId, actor, ModerationActionType.UNPIN, {
      pinnedAt: null,
    }, dto.notes);
  }

  async lock(postId: string, actor: RequestUser, dto: ModerateActionDto) {
    return this.updatePostWithAction(
      postId,
      actor,
      ModerationActionType.LOCK,
      {
        lockedAt: new Date(),
        lifecycleState: PostLifecycleState.LOCKED,
      },
      dto.notes,
    );
  }

  async unlock(postId: string, actor: RequestUser, dto: ModerateActionDto) {
    return this.updatePostWithAction(
      postId,
      actor,
      ModerationActionType.UNLOCK,
      {
        lockedAt: null,
        lifecycleState: PostLifecycleState.EDITED,
      },
      dto.notes,
    );
  }

  async softDelete(postId: string, actor: RequestUser, dto: ModerateActionDto) {
    return this.updatePostWithAction(
      postId,
      actor,
      ModerationActionType.DELETE,
      {
        deletedAt: new Date(),
        lifecycleState: PostLifecycleState.DELETED,
      },
      dto.notes,
    );
  }

  async restore(postId: string, actor: RequestUser, dto: ModerateActionDto) {
    return this.updatePostWithAction(
      postId,
      actor,
      ModerationActionType.RESTORE,
      {
        deletedAt: null,
        lifecycleState: PostLifecycleState.EDITED,
      },
      dto.notes,
    );
  }

  async mute(userId: string, actor: RequestUser, dto: ModerateActionDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        mutedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.moderationAction.create({
      data: {
        actorId: actor.id,
        userId,
        actionType: ModerationActionType.MUTE,
        notes: dto.notes,
      },
    });

    return { userId: updated.id, mutedUntil: updated.mutedUntil?.toISOString() ?? null };
  }

  async ban(userId: string, actor: RequestUser, dto: ModerateActionDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        bannedAt: new Date(),
      },
    });

    await this.prisma.moderationAction.create({
      data: {
        actorId: actor.id,
        userId,
        actionType: ModerationActionType.BAN,
        notes: dto.notes,
      },
    });

    return { userId: updated.id, bannedAt: updated.bannedAt?.toISOString() ?? null };
  }

  private async updatePostWithAction(
    postId: string,
    actor: RequestUser,
    action: ModerationActionType,
    data: Record<string, unknown>,
    notes?: string,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data,
    });

    await this.prisma.moderationAction.create({
      data: {
        actorId: actor.id,
        postId,
        actionType: action,
        notes,
      },
    });

    return {
      id: updated.id,
      action: action.toLowerCase(),
    };
  }
}
