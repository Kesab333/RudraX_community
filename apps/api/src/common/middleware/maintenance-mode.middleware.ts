import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { readAppEnv } from "../config/app-env";

@Injectable()
export class MaintenanceModeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const env = readAppEnv();
    const isReadOnlyMethod = ["GET", "HEAD", "OPTIONS"].includes(req.method.toUpperCase());

    if (env.maintenanceMode && !isReadOnlyMethod) {
      res.status(503).json({
        message: "Maintenance mode is enabled. Writes are temporarily unavailable.",
      });
      return;
    }

    next();
  }
}
