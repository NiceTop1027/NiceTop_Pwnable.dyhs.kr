import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LecturesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.lectureCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { lectures: true } },
      },
    });
  }

  async getLectures(categorySlug?: string) {
    return this.prisma.lecture.findMany({
      where: categorySlug
        ? { category: { slug: categorySlug } }
        : undefined,
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }],
      include: {
        category: { select: { name: true, slug: true } },
        versions: {
          where: { isPublished: true },
          orderBy: { version: 'desc' },
          take: 1,
          select: { id: true, version: true },
        },
        _count: { select: { versions: true } },
      },
    });
  }

  async getLectureBySlug(slug: string) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { slug },
      include: {
        category: true,
        versions: {
          where: { isPublished: true },
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!lecture || lecture.versions.length === 0) {
      throw new NotFoundException('Lecture not found');
    }

    const { versions, ...rest } = lecture;
    return {
      ...rest,
      content: versions[0].content,
      version: versions[0].version,
      versionId: versions[0].id,
    };
  }
}