import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CurriculumTier } from '@prisma/client';

export class UpdateCurriculumDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  content?: unknown;

  @IsOptional()
  @IsEnum(CurriculumTier)
  tier?: CurriculumTier;
}