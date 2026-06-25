import {
  Equals,
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { InquiryCategory } from '@prisma/client';

export class CreateInquiryDto {
  @IsEnum(InquiryCategory)
  category!: InquiryCategory;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  name!: string;

  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message!: string;

  @Equals(true, { message: 'Privacy consent is required' })
  consent!: boolean;
}