import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurriculaService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.curriculum.findMany({
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            lecture: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
              },
            },
            challenge: {
              select: {
                id: true,
                title: true,
                slug: true,
                difficulty: true,
                points: true,
              },
            },
          },
        },
        _count: { select: { items: true } },
      },
    });
  }

  async getBySlug(slug: string) {
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { slug },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            lecture: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                tier: true,
              },
            },
            challenge: {
              select: {
                id: true,
                title: true,
                slug: true,
                difficulty: true,
                points: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    return curriculum;
  }
}