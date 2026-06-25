import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { scoreToLevel } from '../common/utils/level';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
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
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      level: scoreToLevel(user.score),
    };
  }

  async getRanking(limit = 50) {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { score: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        displayName: true,
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
      score: user.score,
      level: scoreToLevel(user.score),
      _count: user._count,
    }));
  }
}