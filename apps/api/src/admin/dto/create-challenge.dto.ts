import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
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
  @Matches(/^[a-z0-9_-]+$/, {
    message:
      'Repository name may only contain a-z, 0-9, hyphen (-), and underscore (_)',
  })
  slug?: string;

  @IsString()
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