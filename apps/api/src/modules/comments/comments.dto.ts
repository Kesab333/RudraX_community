import { IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class ListCommentsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class CreateCommentDto {
  @IsString()
  postId!: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsString()
  @MinLength(1)
  content!: string;
}
