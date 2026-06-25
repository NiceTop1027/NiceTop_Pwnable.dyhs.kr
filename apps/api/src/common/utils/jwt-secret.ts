import { ConfigService } from '@nestjs/config';

const WEAK_SECRETS = new Set([
  'change-this-to-a-random-secret-in-production',
  'secret',
  'jwt-secret',
]);

export function resolveJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  const isProd = configService.get<string>('NODE_ENV') === 'production';

  if (!secret) {
    if (isProd) {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'change-this-to-a-random-secret-in-production';
  }

  if (isProd && (secret.length < 32 || WEAK_SECRETS.has(secret))) {
    throw new Error('JWT_SECRET must be at least 32 characters and not a default value');
  }

  return secret;
}

const EXPIRES_MULTIPLIERS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3_600,
  d: 86_400,
};

export function resolveJwtExpiresInSeconds(
  configService: ConfigService,
  fallbackSeconds = 900,
): number {
  const raw = configService.get<string>('JWT_ACCESS_EXPIRES');
  if (!raw) return fallbackSeconds;

  const match = raw.trim().match(/^(\d+)([smhd])$/i);
  if (!match) return fallbackSeconds;

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multiplier = EXPIRES_MULTIPLIERS[unit];
  if (!amount || !multiplier) return fallbackSeconds;

  return amount * multiplier;
}