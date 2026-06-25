import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { scoreToLevel } from '../common/utils/level';

const publicProfileSelect = {
  id: true,
  username: true,
  displayName: true,
  role: true,
  score: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
  _count: {
    select: {
      solves: true,
      achievements: true,
      lectureProgress: { where: { completed: true } },
    },
  },
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        ...publicProfileSelect,
        isActive: true,
      },
    });

    if (!user?.isActive) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      score: user.score,
      level: scoreToLevel(user.score),
      createdAt: user.createdAt,
      _count: {
        solves: user._count.solves,
        achievements: user._count.achievements,
        lectureProgress: user._count.lectureProgress,
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...publicProfileSelect,
        isActive: true,
      },
    });

    if (!user?.isActive) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      score: user.score,
      level: scoreToLevel(user.score),
      createdAt: user.createdAt,
      _count: {
        solves: user._count.solves,
        achievements: user._count.achievements,
        lectureProgress: user._count.lectureProgress,
      },
    };
  }

  async getRanking(limit = 50) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { score: 'desc' },
      take: safeLimit,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        score: true,
        _count: {
          select: {
            solves: true,
          },
        },
      },
    });

    return users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      score: user.score,
      level: scoreToLevel(user.score),
      _count: user._count,
    }));
  }
}