import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import Docker from 'dockerode';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ChallengeDockerService } from './challenge-docker.service';

@Injectable()
export class ContainerService {
  private readonly logger = new Logger(ContainerService.name);
  private docker = new Docker();
  private readonly PORT_RANGE_START = 10000;
  private readonly PORT_RANGE_END = 20000;
  private readonly INSTANCE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
  private readonly host: string;
  private readonly PENDING_INSTANCE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private challengeDockerService: ChallengeDockerService,
  ) {
    this.host = this.configService.get<string>(
      'CHALLENGE_HOST',
      this.configService.get<string>('DOCKER_HOST_IP', '112.220.212.226'),
    );
  }

  /**
   * 사용자를 위한 새로운 문제 인스턴스 생성
   * 1. 기존 인스턴스 확인 (있으면 반환)
   * 2. 빈 포트 할당
   * 3. Docker 컨테이너 생성
   * 4. DB에 저장
   */
  async startInstance(userId: string, challengeId: string) {
    // 1. 이미 유효한 인스턴스가 있는지 확인
    const existing = await this.prisma.containerInstance.findFirst({
      where: {
        userId,
        challengeId,
        status: { in: ['RUNNING', 'PENDING'] },
        expiresAt: { gt: new Date() },
      },
    });

    if (existing) {
      // 생성 중인 인스턴스가 이미 있다면, 사용자에게 잠시 기다리도록 안내
      if (existing.status === 'PENDING') {
        throw new BadRequestException(
          '인스턴스가 생성 중입니다. 잠시 후 다시 시도해주세요.',
        );
      }
      // 이미 실행 중인 인스턴스 정보를 반환
      return {
        id: existing.id,
        host: existing.host || this.host,
        port: existing.port,
        expiresAt: existing.expiresAt,
      };
    }

    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });
    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (!challenge.dockerImage) {
      throw new BadRequestException(
        '이 문제는 아직 Docker 이미지가 준비되지 않았습니다. 관리자에게 문의하세요.',
      );
    }

    const imageReady = await this.challengeDockerService
      .getStatus(challengeId)
      .then((status) => status.buildStatus === 'ready')
      .catch(() => false);

    if (!imageReady) {
      throw new BadRequestException(
        'Docker 이미지가 아직 빌드되지 않았습니다. 잠시 후 다시 시도해 주세요.',
      );
    }

    // 2. 트랜잭션 내에서 포트를 할당하고 PENDING 상태로 인스턴스를 생성
    const pendingInstance = await this.prisma.$transaction(async (tx) => {
      const port = await this.findAvailablePort(tx);
      return tx.containerInstance.create({
        data: {
          userId,
          challengeId,
          status: 'PENDING',
          host: this.host,
          port,
          expiresAt: new Date(Date.now() + this.INSTANCE_TIMEOUT_MS),
        },
      });
    });

    if (!pendingInstance.port) {
      this.logger.error(
        `Failed to start container for instance ${pendingInstance.id}: port is null after creation.`,
      );
      await this.prisma.containerInstance.delete({
        where: { id: pendingInstance.id },
      });
      throw new BadRequestException('인스턴스 생성 중 포트 할당에 실패했습니다.');
    }

    let containerId: string | null = null;
    try {
      // 3. Docker 컨테이너 생성 및 시작
      const containerPort =
        await this.challengeDockerService.getContainerPort(challengeId);
      containerId = await this.createContainer(
        challenge.dockerImage,
        pendingInstance.port,
        containerPort,
      );
      await this.docker.getContainer(containerId).start();

      // 4. 인스턴스 상태를 RUNNING으로 업데이트
      const runningInstance = await this.prisma.containerInstance.update({
        where: { id: pendingInstance.id },
        data: {
          containerId,
          status: 'RUNNING',
        },
      });

      this.logger.log(
        `Started container for user ${userId}, challenge ${challengeId}: ${containerId}:${runningInstance.port}`,
      );

      return {
        id: runningInstance.id,
        host: runningInstance.host,
        port: runningInstance.port,
        expiresAt: runningInstance.expiresAt,
      };
    } catch (error) {
      // 5. 실패 시 생성된 리소스 정리
      this.logger.error(`Failed to start container for instance ${pendingInstance.id}`, error);
      if (containerId) {
        try {
          await this.docker.getContainer(containerId).remove({ force: true });
        } catch (e) {
          this.logger.error(`Failed to clean up container ${containerId} during error recovery`, e);
        }
      }
      // DB에서 PENDING 상태의 인스턴스 삭제
      await this.prisma.containerInstance.delete({ where: { id: pendingInstance.id } });

      throw new BadRequestException('인스턴스 시작에 실패했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * 인스턴스 정지 및 정리
   */
  async stopInstance(instanceId: string, userId: string) {
    const instance = await this.prisma.containerInstance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new NotFoundException('Instance not found');
    }

    if (instance.userId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    // Docker 컨테이너 삭제
    if (instance.containerId) {
      try {
        await this.docker.getContainer(instance.containerId).remove({ force: true });
      } catch (error) {
        this.logger.warn(`Failed to remove container ${instance.containerId}:`, error);
      }
    }

    // DB 업데이트
    await this.prisma.containerInstance.update({
      where: { id: instanceId },
      data: { status: 'STOPPED' },
    });

    this.logger.log(`Stopped instance ${instanceId}`);
  }

  /**
   * 인스턴스 상태 조회
   */
  async getInstance(instanceId: string) {
    const instance = await this.prisma.containerInstance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new NotFoundException('Instance not found');
    }

    return {
      id: instance.id,
      status: instance.status,
      host: instance.host,
      port: instance.port,
      expiresAt: instance.expiresAt,
    };
  }

  /**
   * 만료된 인스턴스 자동 정리 (매 5분)
   */
  @Cron('0 */5 * * * *') // 매 5분마다 실행
  async cleanupExpiredInstances() {
    const now = new Date();
    const pendingThreshold = new Date(now.getTime() - this.PENDING_INSTANCE_TIMEOUT_MS);

    const expired = await this.prisma.containerInstance.findMany({
      where: {
        OR: [
          // 만료된 실행 중인 인스턴스
          {
            status: 'RUNNING',
            expiresAt: { lt: now },
          },
          // 오랫동안 PENDING 상태에 머물러 있는 인스턴스 (생성 실패로 간주)
          {
            status: 'PENDING',
            createdAt: { lt: pendingThreshold },
          },
        ],
      },
    });

    for (const instance of expired) {
      this.logger.log(`Cleaning up stale/expired instance ${instance.id} with status ${instance.status}`);
      try {
        if (instance.containerId) {
          await this.docker.getContainer(instance.containerId).remove({ force: true });
        }
        await this.prisma.containerInstance.update({
          where: { id: instance.id },
          data: { status: 'EXPIRED' },
        });
      } catch (error) {
        this.logger.error(`Failed to clean up instance ${instance.id}:`, error);
      }
    }
  }

  /**
   * 빈 포트 찾기
   * @dev 참고: 동시성(Concurrency)이 높은 환경에서는 Race Condition이 발생할 수 있습니다.
   * 두 요청이 동시에 사용 중인 포트 목록을 가져와 같은 포트를 사용하려고 시도할 수 있습니다.
   * 이상적인 해결책은 데이터베이스의 `port` 컬럼에 (활성 상태에 대한) Unique 제약 조건을 추가하고,
   * 제약 조건 위반 오류 발생 시 재시도하는 로직을 구현하는 것입니다.
   */
  private async findAvailablePort(
    prismaClient: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<number> {
    const used = await prismaClient.containerInstance.findMany({
      where: {
        status: { in: ['RUNNING', 'PENDING'] }, // PENDING 상태도 사용 중인 포트로 간주
        port: { not: null },
      },
      select: { port: true },
    });

    const usedPorts = new Set(
      used.map((i) => i.port).filter((p): p is number => p !== null),
    );

    const available: number[] = [];
    for (let port = this.PORT_RANGE_START; port <= this.PORT_RANGE_END; port++) {
      if (!usedPorts.has(port)) available.push(port);
    }

    if (available.length === 0) {
      throw new BadRequestException('No available ports');
    }

    const index = Math.floor(Math.random() * available.length);
    return available[index];
  }

  /**
   * Docker 컨테이너 생성
   */
  private async createContainer(
    imageName: string,
    hostPort: number,
    containerPort: number,
  ): Promise<string> {
    const container = await this.docker.createContainer({
      Image: imageName,
      HostConfig: {
        PortBindings: {
          [`${containerPort}/tcp`]: [
            { HostIp: '0.0.0.0', HostPort: String(hostPort) },
          ],
        },
        Memory: 512 * 1024 * 1024, // 512MB
        MemorySwap: 1024 * 1024 * 1024, // 1GB
        CpuShares: 512,
        NetworkMode: 'bridge',
      },
    });

    return container.id;
  }
}
