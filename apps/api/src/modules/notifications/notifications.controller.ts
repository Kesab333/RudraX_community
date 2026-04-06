import { Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { RequestUser } from "../../common/types/request-user.type";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query("limit") limit?: number) {
    return this.notificationsService.list(user, limit);
  }

  @Post(":id/read")
  markRead(@CurrentUser() user: RequestUser, @Param("id") notificationId: string) {
    return this.notificationsService.markRead(user, notificationId);
  }
}
