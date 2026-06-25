import { Injectable } from '@nestjs/common';
import { InquiryStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async createInquiry(dto: CreateInquiryDto, userId?: string) {
    return this.prisma.contactInquiry.create({
      data: {
        category: dto.category,
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        subject: dto.subject.trim(),
        message: dto.message.trim(),
        userId,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  }

  async listInquiries() {
    return this.prisma.contactInquiry.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });
  }

  async updateStatus(id: string, status: InquiryStatus) {
    return this.prisma.contactInquiry.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, updatedAt: true },
    });
  }
}