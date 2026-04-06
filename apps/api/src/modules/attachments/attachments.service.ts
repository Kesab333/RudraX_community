import {
  ForbiddenException,
  Injectable,
  PayloadTooLargeException,
} from "@nestjs/common";
import { AttachmentStatus } from "@prisma/client";
import { FILE_SIZE_LIMITS_BYTES } from "@rudrax/shared";
import { randomUUID } from "node:crypto";
import { readAppEnv } from "../../common/config/app-env";
import { TaskQueueService } from "../../common/services/task-queue.service";
import type { RequestUser } from "../../common/types/request-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateAttachmentDto } from "./attachments.dto";

@Injectable()
export class AttachmentsService {
  private readonly env = readAppEnv();

  constructor(
    private readonly prisma: PrismaService,
    private readonly tasks: TaskQueueService,
  ) {}

  async createUploadIntent(user: RequestUser, dto: CreateAttachmentDto) {
    const currentUploads = await this.prisma.attachment.count({
      where: {
        uploaderId: user.id,
        status: {
          in: [AttachmentStatus.UPLOADED, AttachmentStatus.SCAN_PENDING],
        },
      },
    });

    if (currentUploads >= this.env.maxUploadsPerUser) {
      throw new ForbiddenException("Upload concurrency limit reached");
    }

    this.assertFileSize(dto.fileType, dto.fileSize);

    const storageKey = `${user.id}/${randomUUID()}-${dto.fileName}`;
    const attachment = await this.prisma.attachment.create({
      data: {
        postId: dto.postId,
        uploaderId: user.id,
        fileName: dto.fileName,
        fileType: dto.fileType,
        fileSize: dto.fileSize,
        storageKey,
        status: AttachmentStatus.SCAN_PENDING,
      },
    });

    await this.tasks.enqueueAttachmentScan(attachment.id);

    return {
      attachmentId: attachment.id,
      storageKey,
      status: attachment.status.toLowerCase(),
      uploadUrl: `${this.env.s3Endpoint}/${this.env.s3Bucket}/${storageKey}`,
      expiresAt: new Date(Date.now() + this.env.fileUploadTimeoutMs).toISOString(),
    };
  }

  private assertFileSize(fileType: string, fileSize: number) {
    const lower = fileType.toLowerCase();
    const limit = lower.startsWith("image/")
      ? FILE_SIZE_LIMITS_BYTES.image
      : lower.startsWith("video/")
        ? FILE_SIZE_LIMITS_BYTES.video
        : lower.includes("zip") || lower.includes("tar") || lower.includes("gzip")
          ? FILE_SIZE_LIMITS_BYTES.archive
          : FILE_SIZE_LIMITS_BYTES.document;

    if (fileSize > limit) {
      throw new PayloadTooLargeException("File exceeds allowed size limit");
    }
  }
}
