# pwnable.dyhs.kr

한국 학생을 위한 포너블 올인원 교육 플랫폼 (DreamHack + pwn.college + CTFd)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js, TypeScript, TailwindCSS |
| Backend | NestJS, Prisma ORM |
| Database | PostgreSQL |
| Cache | Redis |
| Storage | MinIO |
| Container | Docker |

## 프로젝트 구조

```
pwnable.dyhs.kr/
├── apps/
│   ├── web/          # Next.js 프론트엔드
│   └── api/          # NestJS 백엔드 API
├── packages/
│   └── database/     # Prisma 스키마 & 클라이언트
└── docker-compose.yml
```

## 시작하기

```bash
docker compose up -d
cp .env.example .env   # 이미 .env 있으면 생략
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:4001/api

## 기본 계정

| 항목 | 값 |
|------|-----|
| ID | NiceTop |
| Role | OWNER |
| 비밀번호 | `.env`의 `OWNER_PASSWORD` (기본: `nicetophappy`) |