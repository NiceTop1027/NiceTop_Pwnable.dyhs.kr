import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { ChallengeCategory, Difficulty } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { hashFlag } from '../common/utils/hash';
import { calcChallengeXp } from '../common/utils/challenge-xp';

const submitBuckets = new Map<string, { count: number; resetAt: number }>();

@Injectable()
export class ChallengesService {
  constructor(private readonly prisma: PrismaService) {}

  private withXpReward<T extends { points: number; difficulty: Difficulty }>(
    challenge: T,
  ) {
    return {
      ...challenge,
      xpReward: calcChallengeXp(challenge.points, challenge.difficulty),
    };
  }

  async getChallenges(category?: ChallengeCategory) {
    const challenges = await this.prisma.challenge.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
      },
      orderBy: [{ category: 'asc' }, { points: 'asc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        difficulty: true,
        points: true,
        dockerImage: true,
        createdAt: true,
        _count: { select: { solves: true } },
      },
    });

    return challenges.map((c) => this.withXpReward(c));
  }

  async getChallengeBySlug(slug: string, userId?: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { slug },
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
        createdAt: true,
        _count: { select: { solves: true } },
        solves: userId
          ? {
              where: { userId },
              select: { id: true, solvedAt: true, isFirstBlood: true },
              take: 1,
            }
          : false,
      },
    });

    if (!challenge || !challenge.isPublished) {
      throw new NotFoundException('Challenge not found');
    }

    const { solves, ...rest } = challenge;
    return {
      ...this.withXpReward(rest),
      solved: solves?.length ? solves[0] : null,
    };
  }

  private checkSubmitRateLimit(userId: string, challengeId: string) {
    const key = `${userId}:${challengeId}`;
    const now = Date.now();
    const bucket = submitBuckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      submitBuckets.set(key, { count: 1, resetAt: now + 60_000 });
      return;
    }

    if (bucket.count >= 10) {
      throw new BadRequestException('Too many attempts. Wait a minute');
    }

    bucket.count += 1;
  }

  async submitFlag(slug: string, userId: string, flag: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { slug },
    });

    if (!challenge || !challenge.isPublished) {
      throw new NotFoundException('Challenge not found');
    }

    const existing = await this.prisma.solve.findUnique({
      where: {
        userId_challengeId: { userId, challengeId: challenge.id },
      },
    });

    if (existing) {
      throw new ConflictException('Already solved');
    }

    this.checkSubmitRateLimit(userId, challenge.id);
    const flagDigest = hashFlag(flag);

    const valid = await argon2.verify(challenge.flagHash, flag);
    if (!valid) {
      await this.prisma.submissionLog.create({
        data: {
          userId,
          challengeId: challenge.id,
          submittedFlag: flagDigest,
          isCorrect: false,
        },
      });
      throw new BadRequestException('Incorrect flag');
    }

    const xpAwarded = calcChallengeXp(challenge.points, challenge.difficulty);

    const solve = await this.prisma.$transaction(async (tx) => {
      const solveCount = await tx.solve.count({
        where: { challengeId: challenge.id },
      });

      const created = await tx.solve.create({
        data: {
          userId,
          challengeId: challenge.id,
          isFirstBlood: solveCount === 0,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { score: { increment: xpAwarded } },
      });

      await tx.submissionLog.create({
        data: {
          userId,
          challengeId: challenge.id,
          submittedFlag: flagDigest,
          isCorrect: true,
        },
      });

      return created;
    });

    return {
      correct: true,
      isFirstBlood: solve.isFirstBlood,
      points: xpAwarded,
      basePoints: challenge.points,
      difficulty: challenge.difficulty,
    };
  }

  async getCategories() {
    const grouped = await this.prisma.challenge.groupBy({
      by: ['category'],
      where: { isPublished: true },
      _count: { category: true },
    });

    return grouped.map((g) => ({
      category: g.category,
      count: g._count.category,
    }));
  }
}