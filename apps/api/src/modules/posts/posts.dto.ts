import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { CATEGORIES, POST_TYPES, VISIBILITY_STATES } from "@rudrax/shared";

export class ListPostsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  @IsIn(CATEGORIES)
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(POST_TYPES)
  type?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class CreatePostDto {
  @IsString()
  @MinLength(4)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(1)
  content!: string;

  @IsString()
  @IsIn(CATEGORIES)
  category!: string;

  @IsString()
  @IsIn(POST_TYPES)
  type!: string;

  @IsOptional()
  @IsString()
  @IsIn(VISIBILITY_STATES)
  visibility?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @IsOptional()
  @IsString()
  @IsIn(CATEGORIES)
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(POST_TYPES)
  type?: string;

  @IsOptional()
  @IsString()
  @IsIn(VISIBILITY_STATES)
  visibility?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class PublishPostDto {
  @IsOptional()
  @IsString()
  @IsIn(["public", "private"])
  visibility?: string;
}
