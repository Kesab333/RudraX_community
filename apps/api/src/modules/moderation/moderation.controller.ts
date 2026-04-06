import { Body, Controller, Param, Post } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import type { RequestUser } from "../../common/types/request-user.type";
import { ModerateActionDto, ReportPostDto } from "./moderation.dto";
import { ModerationService } from "./moderation.service";

@Controller("moderation")
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post("reports")
  report(@CurrentUser() user: RequestUser, @Body() body: ReportPostDto) {
    return this.moderationService.report(user, body);
  }

  @Post("posts/:id/pin")
  @Roles("moderator", "admin")
  pin(@Param("id") postId: string, @CurrentUser() user: RequestUser, @Body() body: ModerateActionDto) {
    return this.moderationService.pin(postId, user, body);
  }

  @Post("posts/:id/unpin")
  @Roles("moderator", "admin")
  unpin(@Param("id") postId: string, @CurrentUser() user: RequestUser, @Body() body: ModerateActionDto) {
    return this.moderationService.unpin(postId, user, body);
  }

  @Post("posts/:id/lock")
  @Roles("moderator", "admin")
  lock(@Param("id") postId: string, @CurrentUser() user: RequestUser, @Body() body: ModerateActionDto) {
    return this.moderationService.lock(postId, user, body);
  }

  @Post("posts/:id/unlock")
  @Roles("moderator", "admin")
  unlock(@Param("id") postId: string, @CurrentUser() user: RequestUser, @Body() body: ModerateActionDto) {
    return this.moderationService.unlock(postId, user, body);
  }

  @Post("posts/:id/delete")
  @Roles("moderator", "admin")
  softDelete(@Param("id") postId: string, @CurrentUser() user: RequestUser, @Body() body: ModerateActionDto) {
    return this.moderationService.softDelete(postId, user, body);
  }

  @Post("posts/:id/restore")
  @Roles("moderator", "admin")
  restore(@Param("id") postId: string, @CurrentUser() user: RequestUser, @Body() body: ModerateActionDto) {
    return this.moderationService.restore(postId, user, body);
  }

  @Post("users/:id/mute")
  @Roles("moderator", "admin")
  mute(@Param("id") targetUserId: string, @CurrentUser() user: RequestUser, @Body() body: ModerateActionDto) {
    return this.moderationService.mute(targetUserId, user, body);
  }

  @Post("users/:id/ban")
  @Roles("moderator", "admin")
  ban(@Param("id") targetUserId: string, @CurrentUser() user: RequestUser, @Body() body: ModerateActionDto) {
    return this.moderationService.ban(targetUserId, user, body);
  }
}
