import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class SearchQueryDto {
  @IsString()
  query!: string;

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
  kind?: string;
}
