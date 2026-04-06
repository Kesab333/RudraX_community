import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { normalizeTag } from "@rudrax/shared";
import { toPrismaCategory, toPrismaPostType } from "../../common/utils/community-mappers";
import type { RequestUser } from "../../common/types/request-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateShareDraftDto } from "./share.dto";

@Injectable()
export class ShareService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: RequestUser, dto: CreateShareDraftDto) {
    const token = randomUUID();
    const draft = await this.prisma.shareDraft.create({
      data: {
        token,
        sourceProduct: dto.sourceProduct,
        authorId: user.id,
        category: toPrismaCategory(dto.category),
        postType: toPrismaPostType(dto.postType),
        title: dto.title,
        content: dto.content,
        tags: (dto.tags ?? []).map(normalizeTag),
        attachmentIds: dto.attachmentIds ?? [],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return {
      token: draft.token,
      composerUrl: `/community/compose/share/${draft.token}`,
      expiresAt: draft.expiresAt.toISOString(),
    };
  }

  async get(token: string) {
    const draft = await this.prisma.shareDraft.findUnique({
      where: { token },
    });

    if (!draft || draft.expiresAt.getTime() <= Date.now()) {
      throw new NotFoundException("Share draft not found");
    }

    return {
      token: draft.token,
      sourceProduct: draft.sourceProduct,
      category: draft.category.toLowerCase(),
      postType: draft.postType.toLowerCase().replace(/_/g, "-"),
      title: draft.title,
      content: draft.content,
      tags: draft.tags,
      attachmentIds: draft.attachmentIds,
      expiresAt: draft.expiresAt.toISOString(),
    };
  }
}
