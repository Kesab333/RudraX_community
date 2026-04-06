import { IsArray, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { CATEGORIES, POST_TYPES } from "@rudrax/shared";

export class CreateShareDraftDto {
  @IsString()
  @MinLength(2)
  sourceProduct!: string;

  @IsString()
  @IsIn(CATEGORIES)
  category!: string;

  @IsString()
  @IsIn(POST_TYPES)
  postType!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];
}
