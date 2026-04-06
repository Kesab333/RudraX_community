import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      xp: user.xp,
      avatarUrl: user.avatarUrl,
      badges: user.badges,
      mutedUntil: user.mutedUntil?.toISOString() ?? null,
      bannedAt: user.bannedAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
