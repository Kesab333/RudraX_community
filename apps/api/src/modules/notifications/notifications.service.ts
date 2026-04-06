import { Injectable } from "@nestjs/common";
import { resolveLimit } from "../../common/utils/pagination";
import type { RequestUser } from "../../common/types/request-user.type";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: RequestUser, limit?: number) {
    const take = resolveLimit(limit);
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      type: notification.type.toLowerCase(),
      message: notification.message,
      metadata: notification.metadata,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    }));
  }

  async markRead(user: RequestUser, notificationId: string) {
    const notification = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { updated: notification.count === 1 };
  }
}
