import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../constants/auth-cookies';
import { resolveJwtExpiresInSeconds } from './jwt-secret';

function parseRefreshMaxAgeMs(configService: ConfigService): number {
  const raw = configService.get<string>('JWT_REFRESH_EXPIRES', '7d');
  const match = raw.trim().match(/^(\d+)([smhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const amount = Number.parseInt(match[1], 10);
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return amount * (multipliers[match[2].toLowerCase()] ?? 86_400_000);
}

function cookieBaseOptions(configService: ConfigService) {
  const isProd = configService.get<string>('NODE_ENV') === 'production';
  const apiUrl = configService.get<string>('API_URL', '');
  const webUrl = configService.get<string>('WEB_URL', '');
  let sameSite: 'lax' | 'none' = 'lax';

  try {
    const apiOrigin = new URL(apiUrl).origin;
    const webOrigin = new URL(webUrl).origin;
    if (apiOrigin && webOrigin && apiOrigin !== webOrigin) {
      sameSite = 'none';
    }
  } catch {
    // Ignore invalid URL values and keep sameSite as lax.
  }

  const secure = isProd || webUrl.startsWith('https://') || sameSite === 'none';
  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
  };
}

export function setAuthCookies(
  res: Response,
  configService: ConfigService,
  accessToken: string,
  refreshToken: string,
) {
  const base = cookieBaseOptions(configService);
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...base,
    maxAge: resolveJwtExpiresInSeconds(configService) * 1_000,
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...base,
    maxAge: parseRefreshMaxAgeMs(configService),
  });
}

export function clearAuthCookies(res: Response, configService: ConfigService) {
  const base = cookieBaseOptions(configService);
  res.clearCookie(ACCESS_TOKEN_COOKIE, base);
  res.clearCookie(REFRESH_TOKEN_COOKIE, base);
}