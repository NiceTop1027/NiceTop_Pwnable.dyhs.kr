import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { ContactService } from './contact.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @RateLimit(5, 3_600_000)
  @UseGuards(RateLimitGuard)
  @Post('inquiries')
  createInquiry(
    @Body() dto: CreateInquiryDto,
    @CurrentUser() user?: { id: string },
  ) {
    return this.contactService.createInquiry(dto, user?.id);
  }
}