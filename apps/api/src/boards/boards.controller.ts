import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BoardsService } from './boards.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Public()
  @Get()
  getBoards() {
    return this.boardsService.getBoards();
  }

  @Public()
  @Get(':slug/posts')
  getPosts(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.boardsService.getPosts(
      slug,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Public()
  @Get(':slug/posts/:postId')
  getPost(
    @Param('slug') slug: string,
    @Param('postId') postId: string,
    @CurrentUser() user?: { id: string },
  ) {
    return this.boardsService.getPost(slug, postId, user?.id);
  }

  @Post(':slug/posts')
  createPost(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePostDto,
  ) {
    return this.boardsService.createPost(slug, user.id, dto);
  }

  @Patch(':slug/posts/:postId')
  updatePost(
    @Param('slug') slug: string,
    @Param('postId') postId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpdatePostDto,
  ) {
    return this.boardsService.updatePost(
      slug,
      postId,
      user.id,
      user.role,
      dto,
    );
  }

  @Delete(':slug/posts/:postId')
  deletePost(
    @Param('slug') slug: string,
    @Param('postId') postId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.boardsService.deletePost(slug, postId, user.id, user.role);
  }

  @Post(':slug/posts/:postId/like')
  toggleLike(
    @Param('slug') slug: string,
    @Param('postId') postId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.boardsService.toggleLike(slug, postId, user.id);
  }

  @Post(':slug/posts/:postId/comments')
  createComment(
    @Param('slug') slug: string,
    @Param('postId') postId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCommentDto,
  ) {
    return this.boardsService.createComment(slug, postId, user.id, dto);
  }

  @Patch(':slug/posts/:postId/comments/:commentId')
  updateComment(
    @Param('slug') slug: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpdateCommentDto,
  ) {
    return this.boardsService.updateComment(
      slug,
      postId,
      commentId,
      user.id,
      user.role,
      dto,
    );
  }

  @Delete(':slug/posts/:postId/comments/:commentId')
  deleteComment(
    @Param('slug') slug: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.boardsService.deleteComment(
      slug,
      postId,
      commentId,
      user.id,
      user.role,
    );
  }
}