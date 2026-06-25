import { PrismaClient, Role, CurriculumTier, BoardType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function purgeContentData() {
  await prisma.ctfSubmission.deleteMany();
  await prisma.ctfChallenge.deleteMany();
  await prisma.ctfParticipant.deleteMany();
  await prisma.ctfTeam.deleteMany();
  await prisma.ctf.deleteMany();
  await prisma.curriculumItem.deleteMany();
  await prisma.submissionLog.deleteMany();
  await prisma.solve.deleteMany();
  await prisma.containerInstance.deleteMany();
  await prisma.challengeAttachment.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.userLectureProgress.deleteMany();
  await prisma.lectureVersion.deleteMany();
  await prisma.lecture.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.notice.deleteMany();

  console.log('Purged content data (lectures, challenges, ctf, posts, notices)');
}

async function main() {
  await purgeContentData();

  const ownerUsername = process.env.OWNER_USERNAME ?? 'NiceTop';
  const ownerPassword = process.env.OWNER_PASSWORD ?? 'nicetophappy';
  const passwordHash = await argon2.hash(ownerPassword);

  const owner = await prisma.user.upsert({
    where: { username: ownerUsername },
    update: {
      passwordHash,
      role: Role.OWNER,
      isActive: true,
      score: 0,
    },
    create: {
      username: ownerUsername,
      displayName: ownerUsername,
      passwordHash,
      role: Role.OWNER,
      score: 0,
    },
  });

  console.log(`Seeded owner: ${owner.username} (${owner.role})`);

  const lectureCategories = [
    { name: '포너블 입문', slug: 'intro', description: '바이너리 익스플로잇의 기초 개념', order: 1 },
    { name: '스택 오버플로우', slug: 'stack-overflow', description: '스택 기반 버퍼 오버플로우', order: 2 },
    { name: '포맷 스트링', slug: 'format-string', description: '포맷 스트링 취약점', order: 3 },
    { name: '힙 익스플로잇', slug: 'heap', description: '힙 메모리 할당자 익스플로잇', order: 4 },
    { name: 'ROP', slug: 'rop', description: 'Return Oriented Programming', order: 5 },
    { name: '셸코딩', slug: 'shellcode', description: '셸코드 작성과 활용', order: 6 },
    { name: '리버스 엔지니어링', slug: 'reverse', description: '바이너리 역공학 기법', order: 7 },
    { name: '리눅스 내부', slug: 'linux-internals', description: '리눅스 커널과 시스템 구조', order: 8 },
    { name: '웹 보안', slug: 'web', description: '웹 애플리케이션 보안', order: 9 },
    { name: '암호학', slug: 'crypto', description: '암호학 기초와 CTF 암호 문제', order: 10 },
    { name: '포렌식', slug: 'forensic', description: '디지털 포렌식과 분석', order: 11 },
    { name: 'ARM 익스플로잇', slug: 'arm', description: 'ARM 아키텍처 익스플로잇', order: 12 },
    { name: '커널 익스플로잇', slug: 'kernel', description: '리눅스 커널 익스플로잇', order: 13 },
    { name: '고급 테크닉', slug: 'advanced', description: '최신 익스플로잇 기법', order: 14 },
  ];

  for (const category of lectureCategories) {
    await prisma.lectureCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log(`Seeded ${lectureCategories.length} lecture categories`);

  const curricula = [
    {
      title: '포너블 기초 과정',
      slug: 'beginner',
      description: '바이너리 익스플로잇을 처음 시작하는 학생을 위한 입문 커리큘럼',
      tier: CurriculumTier.BEGINNER,
      order: 1,
    },
    {
      title: '포너블 중급 과정',
      slug: 'intermediate',
      description: 'ROP, 힙 익스플로잇 등 중급 기법을 학습하는 커리큘럼',
      tier: CurriculumTier.INTERMEDIATE,
      order: 2,
    },
    {
      title: '포너블 고급 과정',
      slug: 'advanced',
      description: '커널, ARM 등 고급 익스플로잇 기법을 다루는 커리큘럼',
      tier: CurriculumTier.ADVANCED,
      order: 3,
    },
  ];

  for (const curriculum of curricula) {
    await prisma.curriculum.upsert({
      where: { slug: curriculum.slug },
      update: curriculum,
      create: curriculum,
    });
  }

  console.log(`Seeded ${curricula.length} curricula`);

  const curriculumTracks = [
    {
      slug: 'beginner',
      steps: [
        { title: 'Linux 기초', slug: 'linux-basics', description: '셸, 권한, 프로세스 이해', categorySlug: 'intro' },
        { title: 'C Language', slug: 'c-language', description: '포인터와 메모리 구조', categorySlug: 'intro' },
        { title: 'Assembly', slug: 'assembly', description: '디스어셈블리와 레지스터', categorySlug: 'intro' },
        { title: 'Memory', slug: 'memory-layout', description: '스택·힙 레이아웃', categorySlug: 'intro' },
      ],
    },
    {
      slug: 'intermediate',
      steps: [
        { title: 'Stack BOF', slug: 'stack-bof', description: '기본 버퍼 오버플로우', categorySlug: 'stack-overflow' },
        { title: 'Shellcode', slug: 'shellcode-basics', description: '직접 쉘코드 작성', categorySlug: 'shellcode' },
        { title: 'Return-to-libc', slug: 'ret2libc', description: 'libc 함수 활용', categorySlug: 'stack-overflow' },
        { title: 'ROP Chain', slug: 'rop-chain', description: '가젯 체인 구성', categorySlug: 'rop' },
      ],
    },
    {
      slug: 'advanced',
      steps: [
        { title: 'Heap Exploitation', slug: 'heap-exploit', description: 'Use-after-free, tcache', categorySlug: 'heap' },
        { title: 'Kernel Pwn', slug: 'kernel-pwn', description: '커널 모듈·드라이버', categorySlug: 'kernel' },
        { title: 'Browser Security', slug: 'browser-pwn', description: 'JIT, sandbox 우회', categorySlug: 'advanced' },
      ],
    },
  ];

  let itemCount = 0;

  for (const track of curriculumTracks) {
    const curriculum = await prisma.curriculum.findUnique({ where: { slug: track.slug } });
    if (!curriculum) continue;

    await prisma.curriculumItem.deleteMany({ where: { curriculumId: curriculum.id } });

    for (let i = 0; i < track.steps.length; i++) {
      const step = track.steps[i];
      const category = await prisma.lectureCategory.findUnique({
        where: { slug: step.categorySlug },
      });
      if (!category) continue;

      const lecture = await prisma.lecture.upsert({
        where: { slug: step.slug },
        update: {
          title: step.title,
          description: step.description,
          categoryId: category.id,
          order: i + 1,
        },
        create: {
          title: step.title,
          slug: step.slug,
          description: step.description,
          categoryId: category.id,
          order: i + 1,
        },
      });

      await prisma.lectureVersion.upsert({
        where: { lectureId_version: { lectureId: lecture.id, version: 1 } },
        update: {
          content: `# ${step.title}\n\n${step.description}\n\n커리큘럼 학습 항목입니다.`,
          isPublished: true,
        },
        create: {
          lectureId: lecture.id,
          version: 1,
          content: `# ${step.title}\n\n${step.description}\n\n커리큘럼 학습 항목입니다.`,
          isPublished: true,
        },
      });

      await prisma.curriculumItem.create({
        data: {
          curriculumId: curriculum.id,
          lectureId: lecture.id,
          order: i + 1,
        },
      });

      itemCount++;
    }
  }

  console.log(`Seeded ${itemCount} curriculum items`);

  await prisma.board.deleteMany({ where: { type: BoardType.NOTICE } });

  const boards = [
    { name: '자유게시판', slug: 'free', type: BoardType.FREE, description: '자유롭게 소통하는 게시판', order: 1 },
    { name: 'Q&A', slug: 'qna', type: BoardType.QNA, description: '질문과 답변 게시판', order: 2 },
    { name: '스터디', slug: 'study', type: BoardType.STUDY, description: '스터디 모집 및 정보 공유', order: 3 },
  ];

  for (const board of boards) {
    await prisma.board.upsert({
      where: { slug: board.slug },
      update: board,
      create: board,
    });
  }

  console.log(`Seeded ${boards.length} boards`);

  const achievements = [
    {
      name: '첫 걸음',
      slug: 'first-step',
      description: '첫 번째 강의를 완료했습니다',
      icon: '🎯',
      condition: 'complete_first_lecture',
    },
    {
      name: '첫 피의',
      slug: 'first-blood',
      description: '첫 번째 챌린지를 해결했습니다',
      icon: '🩸',
      condition: 'solve_first_challenge',
    },
    {
      name: '열정적인 학습자',
      slug: 'dedicated-learner',
      description: '10개의 강의를 완료했습니다',
      icon: '📚',
      condition: 'complete_10_lectures',
    },
    {
      name: 'CTF 참가자',
      slug: 'ctf-participant',
      description: '첫 CTF 대회에 참가했습니다',
      icon: '🏆',
      condition: 'join_first_ctf',
    },
    {
      name: '마스터 해커',
      slug: 'master-hacker',
      description: '1000점 이상을 획득했습니다',
      icon: '⭐',
      condition: 'reach_1000_score',
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`Seeded ${achievements.length} achievements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });