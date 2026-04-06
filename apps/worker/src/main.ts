import "dotenv/config";
import { PrismaClient, SearchSourceType, SearchIndexingState, VisibilityState, AttachmentStatus } from "@prisma/client";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { slugifyTitle } from "@rudrax/shared";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const databaseUrl = process.env.DATABASE_URL ?? "";
const retentionDays = Number(process.env.SOFT_DELETE_RETENTION_DAYS ?? 30);
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});
const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl },
  },
});

function log(event: string, payload: object) {
  console.log(
    JSON.stringify({
      service: "worker",
      event,
      ...payload,
    }),
  );
}

async function indexSource(sourceType: string, sourceId: string) {
  if (sourceType === "post") {
    const post = await prisma.post.findUnique({
      where: { id: sourceId },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!post) {
      return;
    }

    await prisma.searchDocument.upsert({
      where: {
        sourceType_sourceId: {
          sourceType: SearchSourceType.POST,
          sourceId: post.id,
        },
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        searchableText: `${post.title}\n${post.excerpt}\n${post.content}\n${post.tags
          .map((item) => item.tag.slug)
          .join(" ")}`,
        category: post.category,
        visibility: post.visibility,
        indexingState: SearchIndexingState.INDEXED,
        publishedAt: post.publishedAt,
        deletedAt: post.deletedAt,
      },
      create: {
        sourceType: SearchSourceType.POST,
        sourceId: post.id,
        title: post.title,
        excerpt: post.excerpt,
        searchableText: `${post.title}\n${post.excerpt}\n${post.content}\n${post.tags
          .map((item) => item.tag.slug)
          .join(" ")}`,
        category: post.category,
        visibility: post.visibility,
        indexingState: SearchIndexingState.INDEXED,
        publishedAt: post.publishedAt,
        deletedAt: post.deletedAt,
      },
    });

    return;
  }

  if (sourceType === "comment") {
    const comment = await prisma.comment.findUnique({
      where: { id: sourceId },
    });

    if (!comment) {
      return;
    }

    await prisma.searchDocument.upsert({
      where: {
        sourceType_sourceId: {
          sourceType: SearchSourceType.COMMENT,
          sourceId: comment.id,
        },
      },
      update: {
        title: slugifyTitle(comment.content).replace(/-/g, " "),
        excerpt: comment.content.slice(0, 240),
        searchableText: comment.content,
        visibility: VisibilityState.PUBLIC,
        indexingState: SearchIndexingState.INDEXED,
        deletedAt: comment.deletedAt,
      },
      create: {
        sourceType: SearchSourceType.COMMENT,
        sourceId: comment.id,
        title: slugifyTitle(comment.content).replace(/-/g, " "),
        excerpt: comment.content.slice(0, 240),
        searchableText: comment.content,
        visibility: VisibilityState.PUBLIC,
        indexingState: SearchIndexingState.INDEXED,
        deletedAt: comment.deletedAt,
      },
    });
  }
}

async function scanAttachment(attachmentId: string) {
  await prisma.attachment.update({
    where: { id: attachmentId },
    data: {
      status: AttachmentStatus.SCAN_PASSED,
      scanCompletedAt: new Date(),
    },
  });
}

async function fanoutNotification(notificationId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    return;
  }

  log("notification.fanout", {
    notificationId,
    userId: notification.userId,
    type: notification.type,
  });
}

async function purgeRetentionWindow() {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  await prisma.comment.deleteMany({
    where: {
      deletedAt: {
        lt: cutoff,
      },
    },
  });

  await prisma.post.deleteMany({
    where: {
      deletedAt: {
        lt: cutoff,
      },
    },
  });

  await prisma.attachment.deleteMany({
    where: {
      deletedAt: {
        lt: cutoff,
      },
    },
  });

  await prisma.idempotencyRecord.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

function startWorker(
  queueName: string,
  processor: (payload: any) => Promise<void>,
) {
  const worker = new Worker(
    queueName,
    async (job) => {
      await processor(job.data);
      log("job.completed", { queueName, jobId: job.id });
    },
    {
      connection,
      concurrency: Number(process.env.WORKER_CONCURRENCY ?? 5),
    },
  );

  worker.on("failed", (job, error) => {
    log("job.failed", {
      queueName,
      jobId: job?.id ?? null,
      message: error.message,
    });
  });

  return worker;
}

const workers = [
  startWorker("search-index", (payload) => indexSource(payload.sourceType, payload.sourceId)),
  startWorker("attachment-scan", (payload) => scanAttachment(payload.attachmentId)),
  startWorker("notification-fanout", (payload) => fanoutNotification(payload.notificationId)),
  startWorker("retention-purge", () => purgeRetentionWindow()),
];

async function shutdown(signal: string) {
  log("shutdown", { signal });
  await Promise.all(workers.map((worker) => worker.close()));
  await prisma.$disconnect();
  await connection.quit();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

log("startup", { queues: workers.length });
