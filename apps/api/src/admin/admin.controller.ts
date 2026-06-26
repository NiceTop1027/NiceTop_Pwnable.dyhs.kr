import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminRoles } from '../common/decorators/admin-roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { AdminLogService } from './admin-log.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddCurriculumItemDto } from './dto/add-curriculum-item.dto';
import { ReorderCurriculumItemsDto } from './dto/reorder-curriculum-items.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';
import { ContactService } from '../contact/contact.service';
import { UpdateInquiryStatusDto } from '../contact/dto/update-inquiry-status.dto';
import { ChallengeDockerService } from '../challenges/challenge-docker.service';

@AdminRoles()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminLogService: AdminLogService,
    private readonly contactService: ContactService,
    private readonly challengeDockerService: ChallengeDockerService,
  ) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('logs')
  getLogs() {
    return this.adminLogService.getRecent();
  }

  @Get('inquiries')
  listInquiries() {
    return this.contactService.listInquiries();
  }

  @Patch('inquiries/:id/status')
  updateInquiryStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInquiryStatusDto,
  ) {
    return this.contactService.updateStatus(id, dto.status);
  }

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(admin.id, id, dto);
  }

  @Get('lectures/categories')
  listCategories() {
    return this.adminService.listCategories();
  }

  @Get('lectures')
  listLectures() {
    return this.adminService.listLectures();
  }

  @Post('lectures')
  createLecture(
    @CurrentUser() admin: { id: string },
    @Body() dto: CreateLectureDto,
  ) {
    return this.adminService.createLecture(admin.id, dto);
  }

  @Get('lectures/:id')
  getLecture(@Param('id') id: string) {
    return this.adminService.getLecture(id);
  }

  @Patch('lectures/:id')
  updateLecture(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateLectureDto,
  ) {
    return this.adminService.updateLecture(admin.id, id, dto);
  }

  @Delete('lectures/:id')
  deleteLecture(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
  ) {
    return this.adminService.deleteLecture(admin.id, id);
  }

  @Get('challenges')
  listChallenges() {
    return this.adminService.listChallenges();
  }

  @Post('challenges')
  createChallenge(
    @CurrentUser() admin: { id: string },
    @Body() dto: CreateChallengeDto,
  ) {
    return this.adminService.createChallenge(admin.id, dto);
  }

  @Get('challenges/:id')
  getChallenge(@Param('id') id: string) {
    return this.adminService.getChallenge(id);
  }

  @Patch('challenges/:id')
  updateChallenge(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateChallengeDto,
  ) {
    return this.adminService.updateChallenge(admin.id, id, dto);
  }

  @Delete('challenges/:id')
  deleteChallenge(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
  ) {
    return this.adminService.deleteChallenge(admin.id, id);
  }

  @Get('challenges/:id/docker')
  getChallengeDockerStatus(@Param('id') id: string) {
    return this.challengeDockerService.getStatus(id);
  }

  @Post('challenges/:id/docker/upload')
  @UseInterceptors(
    FileInterceptor('archive', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  uploadChallengeDocker(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.challengeDockerService.uploadArchive(id, file);
  }

  @Post('challenges/:id/docker/build')
  rebuildChallengeDocker(@Param('id') id: string) {
    return this.challengeDockerService.buildImage(id);
  }

  @Get('curricula')
  listCurricula() {
    return this.adminService.listCurricula();
  }

  @Post('curricula')
  createCurriculum(
    @CurrentUser() admin: { id: string },
    @Body() dto: CreateCurriculumDto,
  ) {
    return this.adminService.createCurriculum(admin.id, dto);
  }

  @Get('curricula/:id')
  getCurriculum(@Param('id') id: string) {
    return this.adminService.getCurriculum(id);
  }

  @Patch('curricula/:id')
  updateCurriculum(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCurriculumDto,
  ) {
    return this.adminService.updateCurriculum(admin.id, id, dto);
  }

  @Delete('curricula/:id')
  deleteCurriculum(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
  ) {
    return this.adminService.deleteCurriculum(admin.id, id);
  }

  @Post('curricula/:id/items')
  addCurriculumItem(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
    @Body() body: AddCurriculumItemDto,
  ) {
    return this.adminService.addCurriculumItem(admin.id, id, body);
  }

  @Delete('curricula/:id/items/:itemId')
  deleteCurriculumItem(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.adminService.deleteCurriculumItem(admin.id, id, itemId);
  }

  @Patch('curricula/:id/items/reorder')
  reorderCurriculumItems(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
    @Body() body: ReorderCurriculumItemsDto,
  ) {
    return this.adminService.reorderCurriculumItems(admin.id, id, body.itemIds);
  }

  @Get('notices')
  listNotices() {
    return this.adminService.listNotices();
  }

  @Post('notices')
  createNotice(
    @CurrentUser() admin: { id: string },
    @Body() dto: CreateNoticeDto,
  ) {
    return this.adminService.createNotice(admin.id, dto);
  }

  @Get('notices/:id')
  getNotice(@Param('id') id: string) {
    return this.adminService.getNotice(id);
  }

  @Patch('notices/:id')
  updateNotice(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateNoticeDto,
  ) {
    return this.adminService.updateNotice(admin.id, id, dto);
  }

  @Delete('notices/:id')
  deleteNotice(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
  ) {
    return this.adminService.deleteNotice(admin.id, id);
  }

  @Get('community/posts')
  listCommunityPosts() {
    return this.adminService.listCommunityPosts();
  }

  @Patch('community/posts/:id')
  updateCommunityPost(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCommunityPostDto,
  ) {
    return this.adminService.updateCommunityPost(admin.id, id, dto);
  }

  @Delete('community/posts/:id')
  deleteCommunityPost(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
  ) {
    return this.adminService.deleteCommunityPost(admin.id, id);
  }

  @Get('ctf')
  listCtfs() {
    return this.adminService.listCtfs();
  }

  @Post('uploads/content')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadContentImage(
    @CurrentUser() admin: { id: string },
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.adminService.uploadContentImage(admin.id, file);
  }
}