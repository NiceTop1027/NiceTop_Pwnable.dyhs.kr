import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const loginBuckets = new Map<string, { count: number; resetAt: number }>();

const USER_SELECT = {
  id: true,
  username: true,
  email: true,
  displayName: true,
  role: true,
  score: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: dto.username },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Username or email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        displayName: dto.displayName ?? dto.username,
        passwordHash,
      },
      select: USER_SELECT,
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const bucketKey = dto.username;
    const now = Date.now();
    const bucket = loginBuckets.get(bucketKey);

    if (bucket && bucket.resetAt >= now && bucket.count >= 8) {
      throw new UnauthorizedException('Too many login attempts. Try again later');
    }

    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user || !user.isActive) {
      await this.recordFailedLogin(bucketKey, user?.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      await this.recordFailedLogin(bucketKey, user.id);
      await this.prisma.loginLog.create({
        data: { userId: user.id, success: false },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    loginBuckets.delete(bucketKey);

    await this.prisma.loginLog.create({
      data: {
        userId: user.id,
        success: true,
      },
    });

    return this.issueTokens({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      score: user.score,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...USER_SELECT,
        _count: {
          select: {
            solves: true,
            achievements: true,
            lectureProgress: { where: { completed: true } },
          },
        },
      },
    });

    if (!user || !(await this.isUserActive(userId))) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: USER_SELECT,
        },
      },
    });

    if (!stored || stored.expiresAt < new Date() || !stored.user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.issueTokens(stored.user);
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    return { success: true };
  }

  private async issueTokens(user: {
    id: string;
    username: string;
    email: string | null;
    displayName: string | null;
    role: string;
    score: number;
    bio?: string | null;
    avatarUrl?: string | null;
    createdAt: Date;
  }) {
    const accessToken = await this.signAccessToken(
      user.id,
      user.username,
      user.role,
    );
    const refreshToken = await this.createRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  private async signAccessToken(userId: string, username: string, role: string) {
    return this.jwtService.signAsync({
      sub: userId,
      username,
      role,
    });
  }

  private async createRefreshToken(userId: string) {
    const token = randomBytes(48).toString('hex');
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES', '7d');
    const expiresAt = this.parseExpiry(expiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  private parseExpiry(value: string): Date {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + amount * multipliers[unit]);
  }

  private recordFailedLogin(username: string, userId?: string) {
    const now = Date.now();
    const bucket = loginBuckets.get(username);

    if (!bucket || bucket.resetAt < now) {
      loginBuckets.set(username, { count: 1, resetAt: now + 15 * 60_000 });
      return;
    }

    bucket.count += 1;
    if (userId && bucket.count >= 5) {
      // brute-force protection hook point
    }
  }

  private async isUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });
    return user?.isActive ?? false;
  }
}