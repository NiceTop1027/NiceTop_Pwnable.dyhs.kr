import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BoardsService } from './boards.service';
import { CreatePostDto } from './dto/create-post.dto';

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
  getPost(@Param('slug') slug: string, @Param('postId') postId: string) {
    return this.boardsService.getPost(slug, postId);
  }

  @Post(':slug/posts')
  createPost(
    @Param('slug') slug: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePostDto,
  ) {
    return this.boardsService.createPost(slug, user.id, dto);
  }
}