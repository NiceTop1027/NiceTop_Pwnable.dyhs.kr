import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CtfService {
  constructor(private readonly prisma: PrismaService) {}

  async getUpcoming() {
    const now = new Date();

    return this.prisma.ctf.findMany({
      where: {
        isPublished: true,
        endAt: { gte: now },
      },
      orderBy: { startAt: 'asc' },
      include: {
        _count: {
          select: {
            participants: true,
            challenges: true,
          },
        },
      },
    });
  }

  async getBySlug(slug: string) {
    const ctf = await this.prisma.ctf.findUnique({
      where: { slug },
      include: {
        challenges: {
          orderBy: { order: 'asc' },
          include: {
            challenge: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                difficulty: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            teams: true,
          },
        },
      },
    });

    if (!ctf || !ctf.isPublished) {
      throw new NotFoundException('CTF not found');
    }

    return ctf;
  }
}