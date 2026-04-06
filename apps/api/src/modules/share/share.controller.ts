import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Idempotent } from "../../common/decorators/idempotent.decorator";
import { Public } from "../../common/decorators/public.decorator";
import type { RequestUser } from "../../common/types/request-user.type";
import { CreateShareDraftDto } from "./share.dto";
import { ShareService } from "./share.service";

@Controller("integrations/share")
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post("drafts")
  @Idempotent("share:draft")
  create(@CurrentUser() user: RequestUser, @Body() body: CreateShareDraftDto) {
    return this.shareService.create(user, body);
  }

  @Get(":token")
  @Public()
  get(@Param("token") token: string) {
    return this.shareService.get(token);
  }
}
