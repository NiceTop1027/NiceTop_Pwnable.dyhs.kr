import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class AddCurriculumItemDto {
  @ValidateIf((dto: AddCurriculumItemDto) => !dto.challengeId)
  @IsString()
  lectureId?: string;

  @ValidateIf((dto: AddCurriculumItemDto) => !dto.lectureId)
  @IsString()
  challengeId?: string;
}