import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCommunityPostDto {
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}