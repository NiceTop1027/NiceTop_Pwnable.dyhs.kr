import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    adminId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    details?: Prisma.InputJsonValue,
  ) {
    return this.prisma.adminLog.create({
      data: { adminId, action, targetType, targetId, details },
    });
  }

  async getRecent(limit = 50) {
    return this.prisma.adminLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });
  }
}