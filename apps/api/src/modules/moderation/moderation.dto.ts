import { IsOptional, IsString, MinLength } from "class-validator";

export class ReportPostDto {
  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  commentId?: string;

  @IsString()
  @MinLength(4)
  reason!: string;
}

export class ModerateActionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
