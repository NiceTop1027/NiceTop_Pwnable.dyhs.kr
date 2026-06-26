import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { sanitizeImageBuffer } from '../common/utils/sanitize-image';
import { hashRefreshToken } from '../common/utils/refresh-token';

const loginBuckets = new Map<string, { count: number; resetAt: number }>();

const AVATAR_DIR = join(process.cwd(), 'uploads', 'avatars');
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
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
      throw new ConflictException('Registration failed');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        displayName: dto.displayName ?? dto.username,
        passwordHash,
        lastNoticeReadAt: new Date(),
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
      const retrySec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      throw new UnauthorizedException(
        `Too many login attempts. Retry in ${retrySec} seconds`,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (user && !user.isActive) {
      throw new UnauthorizedException('Account suspended');
    }

    if (!user) {
      await this.recordFailedLogin(bucketKey);
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

    if (!user.lastNoticeReadAt) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastNoticeReadAt: new Date() },
      });
    }

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

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          NOT: { id: userId },
        },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        email: dto.email === '' ? null : dto.email,
        bio: dto.bio === '' ? null : dto.bio,
      },
      select: USER_SELECT,
    });

    return user;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > AVATAR_MAX_BYTES) {
      throw new BadRequestException('File must be 2MB or smaller');
    }

    const sanitized = await sanitizeImageBuffer(file.buffer, AVATAR_MAX_BYTES);

    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true, isActive: true },
    });

    if (!current?.isActive) {
      throw new UnauthorizedException();
    }

    this.ensureAvatarDir();

    const filename = `${randomBytes(24).toString('hex')}${sanitized.extension}`;
    const filepath = join(AVATAR_DIR, filename);
    writeFileSync(filepath, sanitized.buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: USER_SELECT,
    });

    if (current.avatarUrl) {
      this.deleteAvatarFile(current.avatarUrl);
    }

    return user;
  }

  async deleteAvatar(userId: string) {
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true, isActive: true },
    });

    if (!current?.isActive) {
      throw new UnauthorizedException();
    }

    if (current.avatarUrl) {
      this.deleteAvatarFile(current.avatarUrl);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: USER_SELECT,
    });

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true, isActive: true },
    });

    if (!user?.isActive) {
      throw new UnauthorizedException();
    }

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
    ]);

    return { success: true };
  }

  async me(userId: string) {
    const user = await this.getUserProfile(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async resolveSession(
    accessToken?: string,
    refreshToken?: string,
  ): Promise<{
    user: Awaited<ReturnType<AuthService['getUserProfile']>>;
    accessToken?: string;
    refreshToken?: string;
    clearCookies?: boolean;
  }> {
    if (accessToken) {
      try {
        const payload = await this.jwtService.verifyAsync<{ sub: string }>(
          accessToken,
        );
        const user = await this.getUserProfile(payload.sub);
        if (user) {
          return { user };
        }
      } catch {
        // Fall through to refresh token.
      }
    }

    if (refreshToken) {
      try {
        const refreshed = await this.refresh(refreshToken);
        return {
          user: await this.getUserProfile(refreshed.user.id),
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
        };
      } catch {
        return { user: null, clearCookies: true };
      }
    }

    return { user: null, clearCookies: !!accessToken };
  }

  private async getUserProfile(userId: string): Promise<{
    id: string;
    username: string;
    email: string | null;
    displayName: string | null;
    role: string;
    score: number;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    _count: {
      solves: number;
      achievements: number;
      lectureProgress: number;
    };
  } | null> {
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
      return null;
    }

    return user;
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: {
        user: {
          select: USER_SELECT,
        },
      },
    });

    if (!stored || stored.expiresAt < new Date() || !stored.user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!(await this.isUserActive(stored.user.id))) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Account suspended');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.issueTokens(stored.user);
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = hashRefreshToken(refreshToken);
      await this.prisma.refreshToken.deleteMany({ where: { token: tokenHash } });
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
    const tokenHash = hashRefreshToken(token);
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES', '7d');
    const expiresAt = this.parseExpiry(expiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: tokenHash,
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

  private ensureAvatarDir() {
    if (!existsSync(AVATAR_DIR)) {
      mkdirSync(AVATAR_DIR, { recursive: true });
    }
  }

  private deleteAvatarFile(avatarUrl: string) {
    const filename = avatarUrl.split('/').pop();
    if (!filename || filename.includes('..')) return;

    const filepath = join(AVATAR_DIR, filename);
    if (existsSync(filepath)) {
      unlinkSync(filepath);
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