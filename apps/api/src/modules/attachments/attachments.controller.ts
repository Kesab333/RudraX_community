import { Body, Controller, Post } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Idempotent } from "../../common/decorators/idempotent.decorator";
import type { RequestUser } from "../../common/types/request-user.type";
import { AttachmentsService } from "./attachments.service";
import { CreateAttachmentDto } from "./attachments.dto";

@Controller("attachments")
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post("upload-intents")
  @Idempotent("attachment:upload")
  createUploadIntent(@CurrentUser() user: RequestUser, @Body() body: CreateAttachmentDto) {
    return this.attachmentsService.createUploadIntent(user, body);
  }
}
