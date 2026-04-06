import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { readAppEnv } from "../config/app-env";

const SEARCH_INDEX_QUEUE = "search-index";
const ATTACHMENT_SCAN_QUEUE = "attachment-scan";
const NOTIFICATION_QUEUE = "notification-fanout";
const RETENTION_QUEUE = "retention-purge";

@Injectable()
export class TaskQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(TaskQueueService.name);
  private readonly connection = new IORedis(readAppEnv().redisUrl, {
    maxRetriesPerRequest: null,
  });
  private readonly searchIndexQueue = new Queue(SEARCH_INDEX_QUEUE, {
    connection: this.connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 500,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });
  private readonly attachmentScanQueue = new Queue(ATTACHMENT_SCAN_QUEUE, {
    connection: this.connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 500,
      },
    },
  });
  private readonly notificationQueue = new Queue(NOTIFICATION_QUEUE, {
    connection: this.connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 500,
      },
    },
  });
  private readonly retentionQueue = new Queue(RETENTION_QUEUE, {
    connection: this.connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 500,
      },
    },
  });

  async enqueueSearchIndex(sourceType: string, sourceId: string): Promise<void> {
    try {
      await this.searchIndexQueue.add("search-index", { sourceType, sourceId });
    } catch (error) {
      this.logger.error(`Failed to enqueue search indexing for ${sourceType}:${sourceId}`, error as Error);
    }
  }

  async enqueueAttachmentScan(attachmentId: string): Promise<void> {
    try {
      await this.attachmentScanQueue.add("attachment-scan", { attachmentId });
    } catch (error) {
      this.logger.error(`Failed to enqueue attachment scan for ${attachmentId}`, error as Error);
    }
  }

  async enqueueNotificationFanout(notificationId: string): Promise<void> {
    try {
      await this.notificationQueue.add("notification-fanout", { notificationId });
    } catch (error) {
      this.logger.error(`Failed to enqueue notification fanout for ${notificationId}`, error as Error);
    }
  }

  async enqueueRetentionSweep(): Promise<void> {
    try {
      await this.retentionQueue.add("retention-purge", {
        queuedAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error("Failed to enqueue retention sweep", error as Error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log("Closing queue connections");
    await Promise.all([
      this.searchIndexQueue.close(),
      this.attachmentScanQueue.close(),
      this.notificationQueue.close(),
      this.retentionQueue.close(),
      this.connection.quit(),
    ]);
  }
}
