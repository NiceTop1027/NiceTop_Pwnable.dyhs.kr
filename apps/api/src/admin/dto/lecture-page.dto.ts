import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class LecturePageInputDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  content!: string;

  @IsInt()
  @Min(0)
  order!: number;
}

export class SyncLecturePagesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LecturePageInputDto)
  pages!: LecturePageInputDto[];
}