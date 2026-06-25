import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLogService } from './admin-log.service';
import { slugify } from '../common/utils/slug';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminLog: AdminLogService,
  ) {}

  async getStats() {
    const [
      users,
      lectures,
      challenges,
      solves,
      notices,
      curricula,
      ctfs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.lecture.count(),
      this.prisma.challenge.count({ where: { isPublished: true } }),
      this.prisma.solve.count(),
      this.prisma.notice.count(),
      this.prisma.curriculum.count(),
      this.prisma.ctf.count(),
    ]);

    return { users, lectures, challenges, solves, notices, curricula, ctfs };
  }

  async listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        role: true,
        score: true,
        isActive: true,
        createdAt: true,
        _count: { select: { solves: true } },
      },
    });
  }

  async updateUser(adminId: string, userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.role === Role.OWNER && dto.role && dto.role !== Role.OWNER) {
      throw new ConflictException('Cannot demote owner account');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    await this.adminLog.log(adminId, 'user.update', 'user', userId, { ...dto });
    return updated;
  }

  async listLectures() {
    return this.prisma.lecture.findMany({
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
        versions: { orderBy: { version: 'desc' }, take: 1 },
        _count: { select: { versions: true } },
      },
    });
  }

  async listCategories() {
    return this.prisma.lectureCategory.findMany({
      orderBy: { order: 'asc' },
    });
  }

  private async uniqueLectureSlug(base: string): Promise<string> {
    let slug = base;
    let suffix = 2;

    while (await this.prisma.lecture.findUnique({ where: { slug } })) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  async createLecture(adminId: string, dto: CreateLectureDto) {
    const slug = await this.uniqueLectureSlug(dto.slug ?? slugify(dto.title));
    const lecture = await this.prisma.lecture.create({
      data: {
        categoryId: dto.categoryId,
        title: dto.title,
        slug,
        description: dto.description,
        versions: {
          create: {
            version: 1,
            content: dto.content ?? '',
            isPublished: dto.isPublished ?? false,
          },
        },
      },
      include: {
        category: true,
        versions: true,
      },
    });

    await this.adminLog.log(adminId, 'lecture.create', 'lecture', lecture.id, {
      title: lecture.title,
    });
    return this.getLecture(lecture.id);
  }

  async getLecture(id: string) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        versions: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    const version = lecture.versions[0];

    return {
      id: lecture.id,
      title: lecture.title,
      slug: lecture.slug,
      description: lecture.description,
      categoryId: lecture.categoryId,
      category: lecture.category,
      content: version?.content ?? '',
      isPublished: version?.isPublished ?? false,
      version: version?.version ?? 0,
      updatedAt: lecture.updatedAt,
    };
  }

  async updateLecture(adminId: string, id: string, dto: UpdateLectureDto) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    if (dto.slug && dto.slug !== lecture.slug) {
      const conflict = await this.prisma.lecture.findUnique({
        where: { slug: dto.slug },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException('Slug already in use');
      }
    }

    await this.prisma.lecture.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
      },
    });

    const latest = lecture.versions[0];
    const content = dto.content ?? latest?.content ?? '';
    const isPublished = dto.isPublished ?? latest?.isPublished ?? false;

    if (latest) {
      await this.prisma.lectureVersion.update({
        where: { id: latest.id },
        data: {
          content,
          isPublished,
        },
      });
    } else {
      await this.prisma.lectureVersion.create({
        data: {
          lectureId: id,
          version: 1,
          content,
          isPublished,
        },
      });
    }

    await this.adminLog.log(adminId, 'lecture.update', 'lecture', id, {
      title: dto.title ?? lecture.title,
    });

    return this.getLecture(id);
  }

  async deleteLecture(adminId: string, id: string) {
    await this.prisma.lecture.delete({ where: { id } });
    await this.adminLog.log(adminId, 'lecture.delete', 'lecture', id);
    return { success: true };
  }

  async listChallenges() {
    return this.prisma.challenge.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        difficulty: true,
        points: true,
        isPublished: true,
        dockerImage: true,
        createdAt: true,
        _count: { select: { solves: true } },
      },
    });
  }

  async createChallenge(adminId: string, dto: CreateChallengeDto) {
    const slug = dto.slug ?? slugify(dto.title);
    const flagHash = await argon2.hash(dto.flag);

    const challenge = await this.prisma.challenge.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        category: dto.category,
        difficulty: dto.difficulty,
        points: dto.points ?? 100,
        flagHash,
        dockerImage: dto.dockerImage,
        isPublished: dto.isPublished ?? false,
        authorId: adminId,
      },
    });

    await this.adminLog.log(
      adminId,
      'challenge.create',
      'challenge',
      challenge.id,
      { title: challenge.title, slug: challenge.slug },
    );
    return this.getChallenge(challenge.id);
  }

  async getChallenge(id: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        difficulty: true,
        points: true,
        dockerImage: true,
        isPublished: true,
        updatedAt: true,
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return challenge;
  }

  async updateChallenge(
    adminId: string,
    id: string,
    dto: UpdateChallengeDto,
  ) {
    const data: Record<string, unknown> = { ...dto };
    delete data.flag;

    if (dto.flag) {
      data.flagHash = await argon2.hash(dto.flag);
    }

    const challenge = await this.prisma.challenge.update({
      where: { id },
      data,
    });

    await this.adminLog.log(
      adminId,
      'challenge.update',
      'challenge',
      id,
      { ...dto, flag: dto.flag ? '[redacted]' : undefined },
    );
    return this.getChallenge(id);
  }

  async deleteChallenge(adminId: string, id: string) {
    await this.prisma.challenge.delete({ where: { id } });
    await this.adminLog.log(adminId, 'challenge.delete', 'challenge', id);
    return { success: true };
  }

  async listCurricula() {
    return this.prisma.curriculum.findMany({
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            lecture: { select: { id: true, title: true, slug: true } },
            challenge: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });
  }

  async createCurriculum(adminId: string, dto: CreateCurriculumDto) {
    const slug = dto.slug ?? slugify(dto.title);
    const maxOrder = await this.prisma.curriculum.aggregate({
      _max: { order: true },
    });

    const curriculum = await this.prisma.curriculum.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        content: dto.content
          ? (dto.content as Prisma.InputJsonValue)
          : undefined,
        tier: dto.tier,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    await this.adminLog.log(
      adminId,
      'curriculum.create',
      'curriculum',
      curriculum.id,
      { title: curriculum.title },
    );
    return curriculum;
  }

  async addCurriculumItem(
    adminId: string,
    curriculumId: string,
    data: { lectureId?: string; challengeId?: string },
  ) {
    const maxOrder = await this.prisma.curriculumItem.aggregate({
      where: { curriculumId },
      _max: { order: true },
    });

    const item = await this.prisma.curriculumItem.create({
      data: {
        curriculumId,
        lectureId: data.lectureId,
        challengeId: data.challengeId,
        order: (maxOrder._max.order ?? 0) + 1,
      },
      include: {
        lecture: { select: { id: true, title: true, slug: true } },
        challenge: { select: { id: true, title: true, slug: true } },
      },
    });

    await this.adminLog.log(
      adminId,
      'curriculum.item.add',
      'curriculumItem',
      item.id,
      data,
    );
    return item;
  }

  async getCurriculum(id: string) {
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            lecture: { select: { id: true, title: true, slug: true } },
            challenge: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });
    if (!curriculum) throw new NotFoundException('Curriculum not found');
    return curriculum;
  }

  async updateCurriculum(adminId: string, id: string, dto: UpdateCurriculumDto) {
    const existing = await this.prisma.curriculum.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Curriculum not found');

    const curriculum = await this.prisma.curriculum.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        content:
          dto.content === undefined
            ? undefined
            : (dto.content as Prisma.InputJsonValue),
        tier: dto.tier,
      },
    });

    await this.adminLog.log(
      adminId,
      'curriculum.update',
      'curriculum',
      curriculum.id,
      { title: curriculum.title },
    );
    return curriculum;
  }

  async deleteCurriculum(adminId: string, id: string) {
    await this.prisma.curriculum.delete({ where: { id } });
    await this.adminLog.log(adminId, 'curriculum.delete', 'curriculum', id);
    return { success: true };
  }

  async listNotices() {
    return this.prisma.notice.findMany({
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { username: true, displayName: true } },
      },
    });
  }

  async createNotice(adminId: string, dto: CreateNoticeDto) {
    const notice = await this.prisma.notice.create({
      data: {
        title: dto.title,
        content: dto.content,
        isPinned: dto.isPinned ?? false,
        authorId: adminId,
      },
    });

    await this.adminLog.log(adminId, 'notice.create', 'notice', notice.id, {
      title: notice.title,
    });
    return notice;
  }

  async getNotice(id: string) {
    const notice = await this.prisma.notice.findUnique({
      where: { id },
      include: {
        author: { select: { username: true, displayName: true } },
      },
    });

    if (!notice) {
      throw new NotFoundException('Notice not found');
    }

    return notice;
  }

  async updateNotice(adminId: string, id: string, dto: UpdateNoticeDto) {
    const existing = await this.prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Notice not found');
    }

    const notice = await this.prisma.notice.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
      },
      include: {
        author: { select: { username: true, displayName: true } },
      },
    });

    await this.adminLog.log(adminId, 'notice.update', 'notice', id, {
      title: notice.title,
    });
    return notice;
  }

  async deleteNotice(adminId: string, id: string) {
    await this.prisma.notice.delete({ where: { id } });
    await this.adminLog.log(adminId, 'notice.delete', 'notice', id);
    return { success: true };
  }

  async listCtfs() {
    return this.prisma.ctf.findMany({
      orderBy: { startAt: 'desc' },
      include: { _count: { select: { challenges: true, participants: true } } },
    });
  }

  async uploadContentImage(adminId: string, file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No file uploaded');
    }

    const extByMime: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    const ext = extByMime[file.mimetype];
    if (!ext) {
      throw new BadRequestException('Only JPEG, PNG, WebP, and GIF are allowed');
    }

    const dir = join(process.cwd(), 'uploads', 'content');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const filename = `${randomBytes(16).toString('hex')}${ext}`;
    writeFileSync(join(dir, filename), file.buffer);

    const url = `/api/uploads/content/${filename}`;

    await this.adminLog.log(adminId, 'content.upload', 'asset', filename, {
      url,
    });

    return { url };
  }
}