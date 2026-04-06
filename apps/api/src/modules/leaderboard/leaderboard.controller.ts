import { Controller, Get, Query } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { LeaderboardService } from "./leaderboard.service";

@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @Public()
  list(@Query("limit") limit?: number) {
    return this.leaderboardService.list(limit);
  }
}
