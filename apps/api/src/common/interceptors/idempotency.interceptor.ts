import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { createHash } from "node:crypto";
import { IDEMPOTENT_SCOPE_KEY } from "../decorators/idempotent.decorator";
import type { RequestUser } from "../types/request-user.type";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const scope = this.reflector.getAllAndOverride<string>(IDEMPOTENT_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!scope) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<{
      headers: Record<string, string | undefined>;
      body?: unknown;
      user?: RequestUser;
    }>();
    const response = http.getResponse<{ statusCode?: number }>();
    const key = request.headers["x-idempotency-key"];

    if (!key) {
      throw new BadRequestException("Missing X-Idempotency-Key header");
    }

    const requestHash = createHash("sha256")
      .update(JSON.stringify(request.body ?? {}))
      .digest("hex");

    const existing = await this.prisma.idempotencyRecord.findUnique({
      where: { key },
    });

    if (existing) {
      if (existing.scope !== scope || existing.requestHash !== requestHash) {
        throw new ConflictException("Idempotency key reuse conflict");
      }

      return of(existing.responseBody);
    }

    return next.handle().pipe(
      tap(async (payload) => {
        await this.prisma.idempotencyRecord.create({
          data: {
            key,
            scope,
            requestHash,
            userId: request.user?.id,
            responseStatus: response.statusCode ?? 200,
            responseBody: payload as object,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      }),
    );
  }
}
