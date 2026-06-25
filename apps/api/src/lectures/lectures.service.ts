import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ensureLecturePages } from './lecture-pages.util';

export type LectureProgressState = {
  progress: number;
  completed: boolean;
  visitedPageSlugs: string[];
  lastPageSlug: string | null;
};

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
        _count: { select: { versions: true, pages: true } },
      },
    });
  }

  private computeProgress(visitedCount: number, totalPages: number) {
    if (totalPages <= 0) return 0;
    const pct = Math.round((visitedCount / totalPages) * 100);
    return Math.min(100, Math.max(0, pct));
  }

  private async getProgressState(
    userId: string,
    lectureId: string,
    totalPages: number,
  ): Promise<LectureProgressState | null> {
    const record = await this.prisma.userLectureProgress.findUnique({
      where: { userId_lectureId: { userId, lectureId } },
    });

    if (!record) return null;

    return {
      progress: record.progress,
      completed: record.completed,
      visitedPageSlugs: record.visitedPageSlugs,
      lastPageSlug: record.lastPageSlug,
    };
  }

  async getLectureBySlug(
    slug: string,
    pageSlug?: string,
    userId?: string,
  ) {
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

    const version = lecture.versions[0];
    const pages = await ensureLecturePages(
      this.prisma,
      lecture.id,
      version.content,
    );

    const activeIndex = pageSlug
      ? pages.findIndex((page) => page.slug === pageSlug)
      : 0;

    if (activeIndex < 0) {
      throw new NotFoundException('Lecture page not found');
    }

    const activePage = pages[activeIndex];
    const { versions, ...rest } = lecture;

    let userProgress: LectureProgressState | null = null;
    if (userId) {
      userProgress = await this.getProgressState(
        userId,
        lecture.id,
        pages.length,
      );
    }

    return {
      ...rest,
      version: version.version,
      versionId: version.id,
      pages: pages.map(({ id, title, slug: pageSlugValue, order }) => ({
        id,
        title,
        slug: pageSlugValue,
        order,
      })),
      page: {
        id: activePage.id,
        title: activePage.title,
        slug: activePage.slug,
        content: activePage.content,
        order: activePage.order,
      },
      userProgress,
    };
  }

  async recordPageProgress(
    userId: string,
    slug: string,
    pageSlug: string,
  ) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { slug },
      include: {
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

    const version = lecture.versions[0];
    const pages = await ensureLecturePages(
      this.prisma,
      lecture.id,
      version.content,
    );

    const page = pages.find((item) => item.slug === pageSlug);
    if (!page) {
      throw new NotFoundException('Lecture page not found');
    }

    const existing = await this.prisma.userLectureProgress.findUnique({
      where: { userId_lectureId: { userId, lectureId: lecture.id } },
    });

    const visited = new Set(existing?.visitedPageSlugs ?? []);
    visited.add(pageSlug);
    const visitedPageSlugs = pages
      .map((item) => item.slug)
      .filter((item) => visited.has(item));
    const progress = this.computeProgress(visitedPageSlugs.length, pages.length);
    const completed = visitedPageSlugs.length >= pages.length;

    const record = await this.prisma.userLectureProgress.upsert({
      where: { userId_lectureId: { userId, lectureId: lecture.id } },
      create: {
        userId,
        lectureId: lecture.id,
        versionId: version.id,
        visitedPageSlugs,
        lastPageSlug: pageSlug,
        progress,
        completed,
        lastAccessedAt: new Date(),
      },
      update: {
        versionId: version.id,
        visitedPageSlugs,
        lastPageSlug: pageSlug,
        progress,
        completed,
        lastAccessedAt: new Date(),
      },
    });

    return {
      lectureId: lecture.id,
      lectureSlug: lecture.slug,
      lectureTitle: lecture.title,
      totalPages: pages.length,
      progress: record.progress,
      completed: record.completed,
      visitedPageSlugs: record.visitedPageSlugs,
      lastPageSlug: record.lastPageSlug,
    };
  }

  async listLearningProgress(userId: string) {
    const records = await this.prisma.userLectureProgress.findMany({
      where: { userId },
      orderBy: [{ lastAccessedAt: 'desc' }, { updatedAt: 'desc' }],
      include: {
        lecture: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: { select: { name: true } },
            versions: {
              where: { isPublished: true },
              orderBy: { version: 'desc' },
              take: 1,
              select: { content: true },
            },
            pages: { select: { slug: true }, orderBy: { order: 'asc' } },
          },
        },
      },
    });

    const mapped = await Promise.all(
      records.map(async (record) => {
        let totalPages = record.lecture.pages.length;
        if (totalPages === 0 && record.lecture.versions[0]) {
          const pages = await ensureLecturePages(
            this.prisma,
            record.lecture.id,
            record.lecture.versions[0].content,
          );
          totalPages = pages.length;
        }

        return {
          lectureId: record.lecture.id,
          title: record.lecture.title,
          slug: record.lecture.slug,
          category: record.lecture.category.name,
          totalPages: Math.max(totalPages, 1),
          progress: record.progress,
          completed: record.completed,
          visitedPageSlugs: record.visitedPageSlugs,
          lastPageSlug: record.lastPageSlug,
          lastAccessedAt: record.lastAccessedAt,
        };
      }),
    );

    return mapped;
  }
}