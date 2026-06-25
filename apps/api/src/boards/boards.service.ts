import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const authorSelect = {
  id: true,
  username: true,
  displayName: true,
} as const;

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

  async getBoardBySlug(boardSlug: string) {
    const board = await this.prisma.board.findUnique({
      where: { slug: boardSlug },
    });

    if (!board || board.type === 'NOTICE') {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async getPosts(boardSlug: string, page = 1, limit = 20) {
    const board = await this.getBoardBySlug(boardSlug);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { boardId: board.id },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          author: { select: authorSelect },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      this.prisma.post.count({ where: { boardId: board.id } }),
    ]);

    return {
      board: {
        id: board.id,
        name: board.name,
        slug: board.slug,
        type: board.type,
        description: board.description,
      },
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPost(boardSlug: string, postId: string, userId?: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        board: { slug: boardSlug },
      },
      include: {
        author: { select: authorSelect },
        board: { select: { name: true, slug: true, type: true } },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: authorSelect },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                author: { select: authorSelect },
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

    let likedByMe = false;
    if (userId) {
      const like = await this.prisma.postLike.findUnique({
        where: {
          postId_userId: { postId: post.id, userId },
        },
      });
      likedByMe = !!like;
    }

    return { ...post, likedByMe };
  }

  async createPost(boardSlug: string, authorId: string, dto: CreatePostDto) {
    const board = await this.getBoardBySlug(boardSlug);

    return this.prisma.post.create({
      data: {
        boardId: board.id,
        authorId,
        title: dto.title,
        content: dto.content,
      },
      include: {
        author: { select: authorSelect },
      },
    });
  }

  async updatePost(
    boardSlug: string,
    postId: string,
    userId: string,
    userRole: string,
    dto: UpdatePostDto,
  ) {
    const post = await this.findOwnedPost(boardSlug, postId, userId, userRole);

    return this.prisma.post.update({
      where: { id: post.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
      },
      include: {
        author: { select: authorSelect },
      },
    });
  }

  async deletePost(
    boardSlug: string,
    postId: string,
    userId: string,
    userRole: string,
  ) {
    const post = await this.findOwnedPost(boardSlug, postId, userId, userRole);

    await this.prisma.post.delete({ where: { id: post.id } });
    return { success: true };
  }

  async toggleLike(boardSlug: string, postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, board: { slug: boardSlug } },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.postLike.delete({ where: { id: existing.id } });
      return { liked: false };
    }

    await this.prisma.postLike.create({
      data: { postId, userId },
    });
    return { liked: true };
  }

  async createComment(
    boardSlug: string,
    postId: string,
    authorId: string,
    dto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, board: { slug: boardSlug } },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (dto.parentId) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: dto.parentId, postId },
      });
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    return this.prisma.comment.create({
      data: {
        postId,
        authorId,
        content: dto.content,
        parentId: dto.parentId,
      },
      include: {
        author: { select: authorSelect },
      },
    });
  }

  async updateComment(
    boardSlug: string,
    postId: string,
    commentId: string,
    userId: string,
    userRole: string,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.findOwnedComment(
      boardSlug,
      postId,
      commentId,
      userId,
      userRole,
    );

    return this.prisma.comment.update({
      where: { id: comment.id },
      data: { content: dto.content },
      include: {
        author: { select: authorSelect },
      },
    });
  }

  async deleteComment(
    boardSlug: string,
    postId: string,
    commentId: string,
    userId: string,
    userRole: string,
  ) {
    const comment = await this.findOwnedComment(
      boardSlug,
      postId,
      commentId,
      userId,
      userRole,
    );

    await this.prisma.comment.delete({ where: { id: comment.id } });
    return { success: true };
  }

  private isModerator(role: string) {
    return role === 'OWNER' || role === 'ADMIN' || role === 'MODERATOR';
  }

  private async findOwnedPost(
    boardSlug: string,
    postId: string,
    userId: string,
    userRole: string,
  ) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, board: { slug: boardSlug } },
      select: { id: true, authorId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId && !this.isModerator(userRole)) {
      throw new ForbiddenException('Not allowed to modify this post');
    }

    return post;
  }

  private async findOwnedComment(
    boardSlug: string,
    postId: string,
    commentId: string,
    userId: string,
    userRole: string,
  ) {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
        post: { board: { slug: boardSlug } },
      },
      select: { id: true, authorId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId && !this.isModerator(userRole)) {
      throw new ForbiddenException('Not allowed to modify this comment');
    }

    return comment;
  }
}