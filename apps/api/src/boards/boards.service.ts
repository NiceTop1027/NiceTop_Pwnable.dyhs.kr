import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBoards() {
    return this.prisma.board.findMany({
      where: { type: { not: 'NOTICE' } },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { posts: true } },
      },
    });
  }

  async getPosts(boardSlug: string, page = 1, limit = 20) {
    const board = await this.prisma.board.findUnique({
      where: { slug: boardSlug },
    });

    if (!board || board.type === 'NOTICE') {
      throw new NotFoundException('Board not found');
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { boardId: board.id },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      this.prisma.post.count({ where: { boardId: board.id } }),
    ]);

    return {
      board: { id: board.id, name: board.name, slug: board.slug },
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPost(boardSlug: string, postId: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        board: { slug: boardSlug },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        board: { select: { name: true, slug: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  async createPost(boardSlug: string, authorId: string, dto: CreatePostDto) {
    const board = await this.prisma.board.findUnique({
      where: { slug: boardSlug },
    });

    if (!board || board.type === 'NOTICE') {
      throw new NotFoundException('Board not found');
    }

    return this.prisma.post.create({
      data: {
        boardId: board.id,
        authorId,
        title: dto.title,
        content: dto.content,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }
}