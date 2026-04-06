import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Idempotent } from "../../common/decorators/idempotent.decorator";
import { Public } from "../../common/decorators/public.decorator";
import type { RequestUser } from "../../common/types/request-user.type";
import { CreatePostDto, ListPostsQueryDto, PublishPostDto, UpdatePostDto } from "./posts.dto";
import { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @Public()
  list(@Query() query: ListPostsQueryDto) {
    return this.postsService.list(query);
  }

  @Get("slug/:slug")
  @Public()
  getBySlug(@Param("slug") slug: string) {
    return this.postsService.getBySlug(slug);
  }

  @Post()
  @Idempotent("post:create")
  create(@CurrentUser() user: RequestUser, @Body() body: CreatePostDto) {
    return this.postsService.create(user, body);
  }

  @Patch(":id")
  update(
    @Param("id") postId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.update(postId, user, body);
  }

  @Post(":id/publish")
  publish(
    @Param("id") postId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: PublishPostDto,
  ) {
    return this.postsService.publish(postId, user, body);
  }

  @Post(":id/like")
  toggleLike(@Param("id") postId: string, @CurrentUser() user: RequestUser) {
    return this.postsService.toggleLike(postId, user);
  }

  @Post(":id/bookmark")
  toggleBookmark(@Param("id") postId: string, @CurrentUser() user: RequestUser) {
    return this.postsService.toggleBookmark(postId, user);
  }
}
