import { Controller, Get } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { PrismaService } from "../../prisma/prisma.service";

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  @Public()
  health(): { status: string; timestamp: string } {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  @Get("ready")
  @Public()
  async ready(): Promise<{ status: string; timestamp: string; checks: { database: string } }> {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: {
        database: "ok",
      },
    };
  }

  @Get("live")
  @Public()
  live(): { status: string; timestamp: string } {
    return { status: "live", timestamp: new Date().toISOString() };
  }
}
