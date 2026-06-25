import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug';

export type LecturePageRecord = {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
};

export async function uniquePageSlug(
  prisma: PrismaService,
  lectureId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  let slug = slugify(base);
  let suffix = 2;

  while (true) {
    const conflict = await prisma.lecturePage.findUnique({
      where: { lectureId_slug: { lectureId, slug } },
      select: { id: true },
    });
    if (!conflict || conflict.id === excludeId) return slug;
    slug = `${slugify(base)}-${suffix}`;
    suffix += 1;
  }
}

export async function ensureLecturePages(
  prisma: PrismaService,
  lectureId: string,
  fallbackContent = '',
): Promise<LecturePageRecord[]> {
  const existing = await prisma.lecturePage.findMany({
    where: { lectureId },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      order: true,
    },
  });

  if (existing.length > 0) return existing;

  const created = await prisma.lecturePage.create({
    data: {
      lectureId,
      title: '시작하기',
      slug: 'start',
      content: fallbackContent,
      order: 0,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      order: true,
    },
  });

  return [created];
}