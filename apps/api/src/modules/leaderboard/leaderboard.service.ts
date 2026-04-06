import { Injectable } from "@nestjs/common";
import { resolveLimit } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async list(limit?: number) {
    const take = resolveLimit(limit);
    const users = await this.prisma.user.findMany({
      orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
      take,
    });

    return users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      role: user.role.toLowerCase(),
      xp: user.xp,
      avatarUrl: user.avatarUrl,
    }));
  }
}
