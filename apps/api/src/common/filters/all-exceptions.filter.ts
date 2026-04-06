import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: "Internal server error" };

    this.logger.error(
      JSON.stringify({
        requestId: request.requestId,
        method: request.method,
        path: request.url,
        status,
        payload,
      }),
    );

    response.status(status).json({
      requestId: request.requestId ?? null,
      error: payload,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
