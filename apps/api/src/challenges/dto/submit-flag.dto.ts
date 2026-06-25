import { IsString, MinLength } from 'class-validator';

export class SubmitFlagDto {
  @IsString()
  @MinLength(1)
  flag!: string;
}