import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { readAppEnv } from "../common/config/app-env";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly env = readAppEnv();

  constructor() {
    super({
      log: [
        { emit: "event", level: "query" },
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
      ],
      datasources: {
        db: {
          url: readAppEnv().databaseUrl,
        },
      },
    });

    this.$on("query", (event) => {
      if (event.duration >= this.env.slowQueryThresholdMs) {
        this.logger.warn(
          JSON.stringify({
            type: "slow_query",
            durationMs: event.duration,
            query: event.query,
          }),
        );
      }
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
