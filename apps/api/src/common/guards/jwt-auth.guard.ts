import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PUBLIC_ROUTE_KEY } from "../decorators/public.decorator";
import type { RequestUser } from "../types/request-user.type";
import { TokenService } from "../services/token.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      cookies?: Record<string, string | undefined>;
      user?: RequestUser;
    }>();

    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;
    const cookieToken = request.cookies?.access_token;
    const token = bearerToken ?? cookieToken;

    if (!token) {
      throw new UnauthorizedException("Authentication required");
    }

    request.user = this.tokenService.verifyAccessToken(token);
    return true;
  }
}
