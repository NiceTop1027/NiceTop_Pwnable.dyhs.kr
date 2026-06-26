import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Docker from 'dockerode';
import { execFile } from 'child_process';
import { promisify } from 'util';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import {
  listPublicFiles,
  readDescriptionMd,
  readRepositorySpec,
  resolvePublicFilePath,
  validateRepository,
} from './repository-spec';

const execFileAsync = promisify(execFile);

type DockerBuildStatus = 'none' | 'building' | 'ready' | 'failed';

type ChallengeDockerMeta = {
  buildStatus: DockerBuildStatus;
  buildError?: string | null;
  builtAt?: string | null;
  containerPort: number;
  files: string[];
  instanceEnabled?: boolean;
};

const DEFAULT_CONTAINER_PORT = 9999;

const AUTO_DOCKERFILE = `FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \\
    gcc build-essential socat \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN if [ -f Makefile ]; then make; \\
    elif [ -f challenge.c ]; then \\
      gcc -fno-stack-protector -z execstack -no-pie -o challenge challenge.c; \\
    fi

RUN printf '%s\\n' '#!/bin/bash' 'set -euo pipefail' \\
    'exec socat TCP-LISTEN:9999,reuseaddr,fork EXEC:/app/challenge,stderr,pty,setsid,sigint,sane' \\
    > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 9999
CMD ["/entrypoint.sh"]
`;

@Injectable()
export class ChallengeDockerService {
  private readonly logger = new Logger(ChallengeDockerService.name);
  private readonly docker = new Docker();
  private readonly rootDir: string;
  private readonly building = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.rootDir = this.configService.get<string>(
      'CHALLENGE_DOCKER_DIR',
      join(process.cwd(), 'data', 'challenges'),
    );
    mkdirSync(this.rootDir, { recursive: true });
  }

  imageNameForSlug(slug: string) {
    return `pwnable-${slug.toLowerCase()}:latest`;
  }

  private contextDir(slug: string) {
    return join(this.rootDir, slug);
  }

  private metaPath(slug: string) {
    return join(this.contextDir(slug), '.meta.json');
  }

  private readMeta(slug: string): ChallengeDockerMeta {
    const fallback: ChallengeDockerMeta = {
      buildStatus: 'none',
      buildError: null,
      builtAt: null,
      containerPort: DEFAULT_CONTAINER_PORT,
      files: [],
    };

    const path = this.metaPath(slug);
    if (!existsSync(path)) return fallback;

    try {
      const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<ChallengeDockerMeta>;
      return {
        ...fallback,
        ...parsed,
        containerPort: parsed.containerPort ?? DEFAULT_CONTAINER_PORT,
        files: parsed.files ?? [],
      };
    } catch {
      return fallback;
    }
  }

  private writeMeta(slug: string, meta: ChallengeDockerMeta) {
    const dir = this.contextDir(slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(this.metaPath(slug), JSON.stringify(meta, null, 2));
  }

  private listContextFiles(slug: string): string[] {
    const dir = this.contextDir(slug);
    if (!existsSync(dir)) return [];

    const walk = (base: string, prefix = ''): string[] => {
      const entries = readdirSync(base, { withFileTypes: true });
      const files: string[] = [];

      for (const entry of entries) {
        if (entry.name === '.meta.json') continue;
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        const full = join(base, entry.name);
        if (entry.isDirectory()) {
          files.push(...walk(full, rel));
        } else {
          files.push(rel);
        }
      }

      return files.sort();
    };

    return walk(dir);
  }

  private ensureDockerfile(slug: string) {
    const dir = this.contextDir(slug);
    const dockerfilePath = join(dir, 'Dockerfile');
    if (existsSync(dockerfilePath)) return;

    const hasChallengeSource =
      existsSync(join(dir, 'challenge.c')) ||
      existsSync(join(dir, 'Makefile')) ||
      existsSync(join(dir, 'challenge'));

    if (!hasChallengeSource) {
      throw new BadRequestException(
        'Dockerfile이 없습니다. Dockerfile을 포함하거나 challenge.c / Makefile을 업로드해 주세요.',
      );
    }

    writeFileSync(dockerfilePath, AUTO_DOCKERFILE, 'utf8');
    this.logger.log(`Generated default Dockerfile for challenge ${slug}`);
  }

  private detectContainerPort(slug: string): number {
    const dockerfilePath = join(this.contextDir(slug), 'Dockerfile');
    if (!existsSync(dockerfilePath)) return DEFAULT_CONTAINER_PORT;

    const content = readFileSync(dockerfilePath, 'utf8');
    const exposeMatch = content.match(/^\s*EXPOSE\s+(\d+)/im);
    if (exposeMatch) {
      const port = Number.parseInt(exposeMatch[1], 10);
      if (port > 0 && port < 65536) return port;
    }

    return DEFAULT_CONTAINER_PORT;
  }

  private async extractZip(slug: string, zipPath: string) {
    const dir = this.contextDir(slug);
    mkdirSync(dir, { recursive: true });

    await execFileAsync('unzip', ['-oq', zipPath, '-d', dir]);

    const entries = readdirSync(dir, { withFileTypes: true });
    if (entries.length === 1 && entries[0].isDirectory()) {
      const nested = join(dir, entries[0].name);
      for (const item of readdirSync(nested)) {
        rmSync(join(dir, item), { recursive: true, force: true });
        renameSync(join(nested, item), join(dir, item));
      }
      rmSync(nested, { recursive: true, force: true });
    }
  }

  private async imageExists(imageName: string): Promise<boolean> {
    try {
      await this.docker.getImage(imageName).inspect();
      return true;
    } catch {
      return false;
    }
  }

  async getStatus(challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { id: true, slug: true, dockerImage: true, updatedAt: true },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const meta = this.readMeta(challenge.slug);
    const imageName =
      challenge.dockerImage ?? this.imageNameForSlug(challenge.slug);
    const ready = await this.imageExists(imageName);

    let buildStatus = meta.buildStatus;
    if (this.building.has(challenge.id)) {
      buildStatus = 'building';
    } else if (ready) {
      buildStatus = 'ready';
    } else if (buildStatus === 'ready') {
      buildStatus = 'failed';
    }

    return {
      imageName,
      buildStatus,
      buildError: meta.buildError ?? null,
      builtAt: meta.builtAt ?? null,
      containerPort: meta.containerPort,
      files: this.listContextFiles(challenge.slug),
      hasContext: existsSync(this.contextDir(challenge.slug)),
    };
  }

  async uploadArchive(challengeId: string, file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('업로드 파일이 없습니다.');
    }

    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { id: true, slug: true },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const ext = file.originalname.toLowerCase();
    if (!ext.endsWith('.zip')) {
      throw new BadRequestException('ZIP 파일만 업로드할 수 있습니다.');
    }

    const zipPath = join(
      tmpdir(),
      `challenge-${randomBytes(8).toString('hex')}.zip`,
    );
    writeFileSync(zipPath, file.buffer);

    const dir = this.contextDir(challenge.slug);
    if (existsSync(dir)) {
      for (const entry of readdirSync(dir)) {
        if (entry === '.meta.json') continue;
        rmSync(join(dir, entry), { recursive: true, force: true });
      }
    } else {
      mkdirSync(dir, { recursive: true });
    }

    try {
      await this.extractZip(challenge.slug, zipPath);
    } finally {
      rmSync(zipPath, { force: true });
    }

    const validationErrors = validateRepository(dir);
    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors.join(' '));
    }

    const spec = readRepositorySpec(dir);
    await this.applyRepositoryToChallenge(challenge.id, dir, spec);

    const containerPort =
      spec?.containerPort ?? this.detectContainerPort(challenge.slug);
    const instanceEnabled = spec?.vmEnabled ?? false;

    this.writeMeta(challenge.slug, {
      buildStatus: 'none',
      buildError: null,
      builtAt: null,
      containerPort,
      instanceEnabled,
      files: this.listContextFiles(challenge.slug),
    });

    return this.buildImage(challenge.id);
  }

  async buildImage(challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { id: true, slug: true },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (this.building.has(challenge.id)) {
      throw new BadRequestException('이미 빌드가 진행 중입니다.');
    }

    const dir = this.contextDir(challenge.slug);
    if (!existsSync(dir) || this.listContextFiles(challenge.slug).length === 0) {
      throw new BadRequestException(
        '문제 파일이 없습니다. ZIP을 업로드한 뒤 다시 시도해 주세요.',
      );
    }

    this.building.add(challenge.id);
    const imageName = this.imageNameForSlug(challenge.slug);

    this.writeMeta(challenge.slug, {
      ...this.readMeta(challenge.slug),
      buildStatus: 'building',
      buildError: null,
      files: this.listContextFiles(challenge.slug),
    });

    try {
      this.ensureDockerfile(challenge.slug);
      const containerPort = this.detectContainerPort(challenge.slug);

      this.logger.log(`Building Docker image ${imageName} from ${dir}`);
      const stream = await this.docker.buildImage(
        {
          context: dir,
          src: readdirSync(dir).filter((name) => name !== '.meta.json'),
        },
        { t: imageName },
      );

      await new Promise<void>((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const ready = await this.imageExists(imageName);
      if (!ready) {
        throw new Error('Docker image build finished without a local image tag.');
      }

      const meta = this.readMeta(challenge.slug);
      const instanceEnabled = meta.instanceEnabled !== false;

      if (instanceEnabled) {
        await this.prisma.challenge.update({
          where: { id: challenge.id },
          data: { dockerImage: imageName },
        });
      }

      this.writeMeta(challenge.slug, {
        buildStatus: 'ready',
        buildError: null,
        builtAt: new Date().toISOString(),
        containerPort,
        instanceEnabled,
        files: this.listContextFiles(challenge.slug),
      });

      this.logger.log(`Docker image ready: ${imageName}`);
      return this.getStatus(challenge.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Docker build failed';

      this.writeMeta(challenge.slug, {
        ...this.readMeta(challenge.slug),
        buildStatus: 'failed',
        buildError: message,
        files: this.listContextFiles(challenge.slug),
      });

      this.logger.error(`Docker build failed for ${challenge.slug}`, error);
      throw new BadRequestException(`Docker 빌드 실패: ${message}`);
    } finally {
      this.building.delete(challenge.id);
    }
  }

  private async applyRepositoryToChallenge(
    challengeId: string,
    dir: string,
    spec: ReturnType<typeof readRepositorySpec>,
  ) {
    const data: Record<string, unknown> = {};

    if (spec?.title) data.title = spec.title;
    if (spec?.category) data.category = spec.category;
    if (spec?.difficulty) data.difficulty = spec.difficulty;
    if (spec?.points) data.points = spec.points;
    if (spec?.flag) data.flagHash = await argon2.hash(spec.flag);

    const description = readDescriptionMd(dir);
    if (description) data.description = description;

    if (Object.keys(data).length === 0) return;

    await this.prisma.challenge.update({
      where: { id: challengeId },
      data,
    });
  }

  listPublicFilesForSlug(slug: string) {
    return listPublicFiles(this.contextDir(slug));
  }

  readPublicFileForSlug(slug: string, relativePath: string) {
    const target = resolvePublicFilePath(
      this.contextDir(slug),
      relativePath,
    );
    if (!target) {
      throw new NotFoundException('File not found');
    }
    return readFileSync(target);
  }

  async getContainerPort(challengeId: string): Promise<number> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { slug: true },
    });

    if (!challenge) return DEFAULT_CONTAINER_PORT;
    return this.readMeta(challenge.slug).containerPort || DEFAULT_CONTAINER_PORT;
  }
}