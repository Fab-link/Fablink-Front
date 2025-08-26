# Fablink-Front 실행 가이드

의류 디자인 플랫폼 Fablink의 프론트엔드 프로젝트입니다.

## 📁 프로젝트 구조

```
Fablink-Front/
├── app/                    # Next.js App Router
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── manufacturing/     # 제조 관련 페이지
├── components/            # 재사용 가능한 컴포넌트
│   └── ui/               # shadcn/ui 컴포넌트
├── lib/                  # 유틸리티 함수
├── public/               # 정적 파일
├── styles/               # 스타일 파일
├── next.config.mjs       # Next.js 설정
├── tailwind.config.ts    # Tailwind CSS 설정
├── tsconfig.json         # TypeScript 설정
└── package.json          # 의존성 및 스크립트
```

## 🌍 환경별 설정 개요

Fablink-Front는 환경별로 다른 API 서버와 설정을 사용합니다. 각 환경은 자동으로 적절한 환경 변수 파일을 생성하고 관리합니다.

### 지원하는 환경

- **local**: 로컬 개발 환경 (백엔드 서버 localhost:8000)
- **dev**: 개발 서버 환경 (AWS 개발 환경)
- **prod**: 프로덕션 환경 (실제 서비스 환경)

---

## 🚀 프로젝트 실행 방법

### 1. npm run local (로컬 개발)

**사용 시기**: 백엔드를 로컬에서 실행할 때

```bash
npm run local
```

**실행 과정**:

1. 기존 .env 파일들 정리 (.env.example 제외)
2. `.env.local` 파일 생성
3. Next.js 개발 서버 시작 (http://localhost:3000)

**생성되는 환경 변수**:

```bash
# .env.local
NEXT_PUBLIC_ENV=local
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_MOCK_API=true
NEXT_PUBLIC_AWS_REGION=ap-northeast-2
NEXT_PUBLIC_AWS_S3_BUCKET=fablink-local-uploads
NEXTAUTH_URL=http://localhost:3000
```

**특징**:

- 로컬 백엔드 서버 (localhost:8000) 연결
- Mock API 활성화
- 모든 실험적 기능 활성화
- 상세한 디버그 로그
- 실시간 코드 변경 반영

### 2. npm run dev (개발 서버 배포)

**사용 시기**: AWS 개발 환경에 배포할 때

```bash
npm run dev
```

**실행 과정**:

1. 기존 .env 파일들 정리 (.env.example 제외)
2. `.env.development` 파일 생성
3. Next.js 빌드 실행
4. S3에 정적 파일 업로드
5. CloudFront 배포

**생성되는 환경 변수**:

```bash
# .env.development
NEXT_PUBLIC_ENV=dev
NODE_ENV=development
NEXT_PUBLIC_API_URL=https://fablink-api-dev.com
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_MOCK_API=false
NEXT_PUBLIC_AWS_REGION=ap-northeast-2
NEXT_PUBLIC_AWS_S3_BUCKET=fablink-dev-website
NEXTAUTH_URL=https://fab-link-dev.org
```

**특징**:

- AWS 개발 서버 (fablink-api-dev.com) 연결
- 실제 API 호출
- 실험적 기능 활성화
- 디버그 모드 활성화
- S3 + CloudFront 배포

---
