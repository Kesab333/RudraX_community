import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateAttachmentDto {
  @IsOptional()
  @IsString()
  postId?: string;

  @IsString()
  fileName!: string;

  @IsString()
  fileType!: string;

  @IsInt()
  @Min(1)
  @Max(104857600)
  fileSize!: number;
}
