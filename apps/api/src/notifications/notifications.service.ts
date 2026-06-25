import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getRecentNotices(limit = 8) {
    return this.prisma.notice.findMany({
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
      select: {
        id: true,
        title: true,
        publishedAt: true,
        isPinned: true,
      },
    });
  }

  async getRecentPublic() {
    const items = await this.getRecentNotices();
    return {
      unreadCount: 0,
      items: items.map((item) => ({
        ...item,
        isRead: true,
      })),
    };
  }

  async getForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastNoticeReadAt: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let lastReadAt = user.lastNoticeReadAt;
    if (!lastReadAt) {
      lastReadAt = new Date();
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastNoticeReadAt: lastReadAt },
      });
    }

    const items = await this.getRecentNotices();

    const enriched = items.map((item) => ({
      ...item,
      isRead: item.publishedAt <= lastReadAt!,
    }));

    const unreadCount = await this.prisma.notice.count({
      where: { publishedAt: { gt: lastReadAt } },
    });

    return {
      unreadCount,
      items: enriched,
    };
  }

  async markAllRead(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastNoticeReadAt: new Date() },
    });
    return { success: true };
  }

  async markNoticeRead(userId: string, noticeId: string) {
    const notice = await this.prisma.notice.findUnique({
      where: { id: noticeId },
      select: { publishedAt: true },
    });

    if (!notice) {
      throw new NotFoundException('Notice not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastNoticeReadAt: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.lastNoticeReadAt || notice.publishedAt > user.lastNoticeReadAt) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastNoticeReadAt: notice.publishedAt },
      });
    }

    return { success: true };
  }
}