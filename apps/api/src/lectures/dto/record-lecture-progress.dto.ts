import { IsString, MinLength } from 'class-validator';

export class RecordLectureProgressDto {
  @IsString()
  @MinLength(1)
  pageSlug!: string;
}