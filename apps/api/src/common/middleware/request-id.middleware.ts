import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export interface RequestWithId extends Request {
  requestId?: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const requestId = req.header("X-Request-ID") ?? randomUUID();
    req.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);
    next();
  }
}
