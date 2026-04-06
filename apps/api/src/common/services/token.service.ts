import { Injectable, UnauthorizedException } from "@nestjs/common";
import jwt from "jsonwebtoken";
import type { UserRole } from "@rudrax/shared";
import { readAppEnv } from "../config/app-env";

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class TokenService {
  private readonly env = readAppEnv();

  signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.env.jwtAccessSecret, {
      expiresIn: this.env.jwtAccessTtlSeconds,
      audience: this.env.jwtAudience,
      issuer: this.env.jwtIssuer,
    });
  }

  signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.env.jwtRefreshSecret, {
      expiresIn: this.env.jwtRefreshTtlSeconds,
      audience: this.env.jwtAudience,
      issuer: this.env.jwtIssuer,
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.env.jwtAccessSecret, {
        audience: this.env.jwtAudience,
        issuer: this.env.jwtIssuer,
      }) as TokenPayload;
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.env.jwtRefreshSecret, {
        audience: this.env.jwtAudience,
        issuer: this.env.jwtIssuer,
      }) as TokenPayload;
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
