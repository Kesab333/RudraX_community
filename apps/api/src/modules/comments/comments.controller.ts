import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Idempotent } from "../../common/decorators/idempotent.decorator";
import { Public } from "../../common/decorators/public.decorator";
import type { RequestUser } from "../../common/types/request-user.type";
import { CreateCommentDto, ListCommentsQueryDto } from "./comments.dto";
import { CommentsService } from "./comments.service";

@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get("post/:postId")
  @Public()
  list(@Param("postId") postId: string, @Query() query: ListCommentsQueryDto) {
    return this.commentsService.list(postId, query);
  }

  @Post()
  @Idempotent("comment:create")
  create(@CurrentUser() user: RequestUser, @Body() body: CreateCommentDto) {
    return this.commentsService.create(user, body);
  }

  @Post(":id/accept")
  accept(@Param("id") commentId: string, @CurrentUser() user: RequestUser) {
    return this.commentsService.acceptAnswer(commentId, user);
  }
}
