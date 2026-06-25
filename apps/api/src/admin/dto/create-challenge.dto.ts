import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ChallengeCategory, Difficulty } from '@prisma/client';

export class CreateChallengeDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsEnum(ChallengeCategory)
  category!: ChallengeCategory;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @IsString()
  @MinLength(1)
  flag!: string;

  @IsOptional()
  @IsString()
  dockerImage?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}