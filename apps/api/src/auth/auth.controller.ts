import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileTypeValidator } from '@nestjs/common/pipes/file/file-type.validator';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../common/constants/auth-cookies';
import {
  clearAuthCookies,
  setAuthCookies,
} from '../common/utils/auth-cookies';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @RateLimit(5, 3_600_000)
  @UseGuards(RateLimitGuard)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    setAuthCookies(
      res,
      this.configService,
      result.accessToken,
      result.refreshToken,
    );
    return { user: result.user };
  }

  @Public()
  @RateLimit(20, 60_000)
  @UseGuards(RateLimitGuard)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    setAuthCookies(
      res,
      this.configService,
      result.accessToken,
      result.refreshToken,
    );
    return { user: result.user };
  }

  @Public()
  @Get('session')
  async session(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.resolveSession(
      req.cookies?.[ACCESS_TOKEN_COOKIE],
      req.cookies?.[REFRESH_TOKEN_COOKIE],
    );

    if (result.clearCookies) {
      clearAuthCookies(res, this.configService);
    }

    if (result.accessToken && result.refreshToken) {
      setAuthCookies(
        res,
        this.configService,
        result.accessToken,
        result.refreshToken,
      );
    }

    return { user: result.user ?? null };
  }

  @Public()
  @RateLimit(30, 60_000)
  @UseGuards(RateLimitGuard)
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      dto.refreshToken ?? req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      clearAuthCookies(res, this.configService);
      return { user: null };
    }

    try {
      const result = await this.authService.refresh(refreshToken);
      setAuthCookies(
        res,
        this.configService,
        result.accessToken,
        result.refreshToken,
      );
      return { user: result.user };
    } catch {
      clearAuthCookies(res, this.configService);
      return { user: null };
    }
  }

  @Public()
  @RateLimit(30, 60_000)
  @UseGuards(RateLimitGuard)
  @Post('logout')
  async logout(
    @Body() dto: LogoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      dto.refreshToken ?? req.cookies?.[REFRESH_TOKEN_COOKIE];
    await this.authService.logout(refreshToken);
    clearAuthCookies(res, this.configService);
    return { success: true };
  }

  @Public()
  @Get('me')
  async me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.resolveSession(
      req.cookies?.[ACCESS_TOKEN_COOKIE],
      req.cookies?.[REFRESH_TOKEN_COOKIE],
    );

    if (result.clearCookies) {
      clearAuthCookies(res, this.configService);
    }

    if (result.accessToken && result.refreshToken) {
      setAuthCookies(
        res,
        this.configService,
        result.accessToken,
        result.refreshToken,
      );
    }

    return result.user ?? null;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.changePassword(user.id, dto);
    clearAuthCookies(res, this.configService);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(
    @CurrentUser() user: { id: string },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.authService.uploadAvatar(user.id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('avatar')
  deleteAvatar(@CurrentUser() user: { id: string }) {
    return this.authService.deleteAvatar(user.id);
  }
}