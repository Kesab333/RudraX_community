import {
  Body,
  Controller,
  Get,
  Post,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import type { RequestUser } from "../../common/types/request-user.type";
import type { LoginDto, RefreshDto, RegisterDto } from "./auth.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @Public()
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(body);
    this.attachCookies(response, result.accessToken, result.refreshToken);
    return result;
  }

  @Post("login")
  @Public()
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(body);
    this.attachCookies(response, result.accessToken, result.refreshToken);
    return result;
  }

  @Post("refresh")
  @Public()
  async refresh(
    @Body() body: RefreshDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.resolveRefreshToken(body.refreshToken, response);
    const result = await this.authService.refresh(refreshToken);
    this.attachCookies(response, result.accessToken, result.refreshToken);
    return result;
  }

  @Post("logout")
  async logout(
    @Body() body: RefreshDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.resolveRefreshToken(body.refreshToken, response);
    const result = await this.authService.logout(refreshToken);
    response.clearCookie("access_token");
    response.clearCookie("refresh_token");
    return result;
  }

  @Get("me")
  async me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user);
  }

  private attachCookies(response: Response, accessToken: string, refreshToken: string): void {
    response.cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
    response.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
  }

  private resolveRefreshToken(token: string | undefined, response: Response): string {
    return token ?? (response.req as { cookies?: Record<string, string | undefined> }).cookies?.refresh_token ?? "";
  }
}
