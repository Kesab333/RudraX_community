import { Controller, Get, Param } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import type { RequestUser } from "../../common/types/request-user.type";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.getById(user.id);
  }

  @Get(":id")
  @Public()
  getById(@Param("id") userId: string) {
    return this.usersService.getById(userId);
  }
}
