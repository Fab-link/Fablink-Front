# Fablink-Front 설치 및 실행 가이드

의류 디자인 플랫폼 Fablink의 프론트엔드 프로젝트입니다.

## 🚀 설치 가이드

### 1. Node.js 설치

#### Ubuntu/Debian 계열

**방법 1: NodeSource 저장소 사용 (권장)**
```bash
# NodeSource GPG 키 및 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js 설치
sudo apt-get install -y nodejs

# 설치 확인
node --version    # v20.x.x 이상이어야 함
npm --version     # 자동으로 설치됨
```

**방법 2: Snap 패키지 사용**
```bash
# Node.js 설치
sudo snap install node --classic

# 설치 확인
node --version
npm --version
```

**방법 3: 기본 저장소 사용 (버전이 낮을 수 있음)**
```bash
# 패키지 목록 업데이트
sudo apt update

# Node.js 및 npm 설치
sudo apt install nodejs npm

# 설치 확인
node --version
npm --version
```

### 3. 프로젝트 클론 및 디렉토리 이동
```bash
cd Fablink-Front
```

### 4. 의존성 패키지 설치

#### 일반 설치 시도

```bash
# package.json의 모든 의존성 설치
npm install
```

#### 버전 호환성 오류 발생 시

React 19와 일부 패키지 간 호환성 문제가 발생할 수 있습니다:

```bash
# 기존 설치 파일 정리
rm -rf node_modules package-lock.json

# legacy-peer-deps 플래그로 설치
npm install --legacy-peer-deps
```

## 🎯 프로젝트 실행

### 개발 서버 실행

```bash
# 로컬 모드 
npm run local

# dev 모드
npm run dev

# prod 모드
npm run prod
```

성공적으로 실행되면 다음과 같은 메시지가 표시됩니다:
```
> my-v0-project@0.1.0 dev
> next dev

   ▲ Next.js 15.2.4
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.3s
```

### 웹 브라우저에서 접속

```bash
# 브라우저에서 다음 주소로 접속
http://localhost:3000
```

**WSL 환경에서 접속 시:**
- Windows 브라우저에서 `http://localhost:3000` 접속 가능
- WSL IP 확인이 필요한 경우: `ip addr show eth0`

### 다른 실행 명령어들

```bash
# 프로덕션 빌드 생성
npm run build

# 빌드된 앱을 프로덕션 모드로 실행
npm run start

# 코드 린트 검사
npm run lint
```

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

## 🔗 관련 링크

- **Next.js 문서**: https://nextjs.org/docs
- **Tailwind CSS 문서**: https://tailwindcss.com/docs
- **shadcn/ui 문서**: https://ui.shadcn.com/docs
- **TypeScript 문서**: https://www.typescriptlang.org/docs

## 🚀 성공적인 실행 확인

모든 설정이 완료되면:

1. ✅ `node --version` 명령어로 Node.js 18.18+ 확인
2. ✅ `npm run dev` 실행 시 오류 없이 서버 시작
3. ✅ 브라우저에서 `http://localhost:3000` 정상 접속
4. ✅ 페이지가 올바르게 렌더링됨

**축하합니다! Fablink-Front 개발 환경 설정이 완료되었습니다.** 🎉

이제 코드를 수정하고 실시간으로 변경 사항을 확인할 수 있습니다.
