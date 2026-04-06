import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import { createHash } from "node:crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { fromPrismaUserRole } from "../../common/utils/community-mappers";
import { TokenService } from "../../common/services/token.service";
import type { RequestUser } from "../../common/types/request-user.type";
import type { LoginDto, RegisterDto } from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException("Email is already registered");
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash: await hash(dto.password, 12),
        role: UserRole.USER,
      },
    });

    const tokens = await this.issueTokens({
      id: user.id,
      email: user.email,
      role: fromPrismaUserRole(user.role),
    });

    return {
      user: this.serializeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens({
      id: user.id,
      email: user.email,
      role: fromPrismaUserRole(user.role),
    });

    return {
      user: this.serializeUser(user),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const tokenHash = this.hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.revokedAt || stored.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    return tokens;
  }

  async logout(refreshToken?: string): Promise<{ success: true }> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: {
          tokenHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    return { success: true };
  }

  async me(user: RequestUser) {
    const dbUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    return this.serializeUser(dbUser);
  }

  private async issueTokens(payload: RequestUser) {
    const accessToken = this.tokenService.signAccessToken({
      sub: payload.id,
      email: payload.email,
      role: payload.role,
    });
    const refreshToken = this.tokenService.signRefreshToken({
      sub: payload.id,
      email: payload.email,
      role: payload.role,
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: payload.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private serializeUser(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    xp: number;
    avatarUrl: string | null;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: fromPrismaUserRole(user.role),
      xp: user.xp,
      avatarUrl: user.avatarUrl,
    };
  }
}
