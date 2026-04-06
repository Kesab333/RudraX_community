import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { RequestUser } from "../types/request-user.type";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestUser | null => {
    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    return request.user ?? null;
  },
);
