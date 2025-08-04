# Fablink-Front 설치 및 실행 가이드

의류 디자인 플랫폼 Fablink의 프론트엔드 프로젝트입니다.

## 📋 시스템 요구사항

- **운영체제**: Linux (Ubuntu 18.04+, Debian 10+, CentOS 7+ 등)
- **Node.js**: 18.18.0 이상 (Next.js 15 요구사항)
- **메모리**: 최소 2GB RAM 권장
- **디스크**: 최소 1GB 여유 공간

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

#### CentOS/RHEL/Fedora 계열

**CentOS/RHEL:**
```bash
# NodeSource 저장소 추가
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Node.js 설치
sudo yum install -y nodejs

# 설치 확인
node --version
npm --version
```

**Fedora:**
```bash
# NodeSource 저장소 추가
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Node.js 설치
sudo dnf install -y nodejs

# 설치 확인
node --version
npm --version
```

#### Arch Linux 계열

```bash
# Node.js 및 npm 설치
sudo pacman -S nodejs npm

# 설치 확인
node --version
npm --version
```

### 2. Node Version Manager (NVM) 사용 (고급 사용자)

여러 Node.js 버전을 관리해야 하는 경우:

```bash
# nvm 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 터미널 재시작 또는 설정 파일 다시 로드
source ~/.bashrc

# 최신 LTS 버전 설치
nvm install --lts
nvm use --lts

# 설치 확인
node --version
npm --version
```

### 3. 프로젝트 클론 및 디렉토리 이동

```bash
# Git이 설치되어 있지 않다면 설치
sudo apt install git  # Ubuntu/Debian
# 또는
sudo yum install git   # CentOS/RHEL

# 프로젝트 클론 (실제 저장소 URL로 변경 필요)
git clone [YOUR_REPOSITORY_URL] Fablink-Front

# 프로젝트 디렉토리로 이동
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

**또는**

```bash
# force 플래그로 설치
npm install --force
```

#### npm 설정 영구 변경 (권장)

```bash
# legacy-peer-deps를 기본 설정으로 지정
npm config set legacy-peer-deps true

# 이후 일반적인 방법으로 설치 가능
npm install
```

### 5. 환경 변수 설정 (선택사항)

필요한 환경 변수가 있다면 `.env.local` 파일을 생성:

```bash
# 환경 변수 파일 생성
cp .env.example .env.local  # .env.example이 있는 경우

# 또는 직접 생성
cat > .env.local << EOF
# 개발 환경 설정
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Fablink
EOF
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

## 🔧 문제 해결

### 1. 권한 오류 발생 시

```bash
# npm 글로벌 디렉토리 소유권 변경
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# 또는 sudo 없이 글로벌 패키지를 설치할 수 있도록 설정
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 2. 포트 충돌 시

```bash
# 다른 포트로 개발 서버 실행
npm run dev -- --port 3001

# 또는 환경 변수로 설정
PORT=3001 npm run dev
```

### 3. 메모리 부족 오류 시

```bash
# Node.js 힙 메모리 크기 증가
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

### 4. 패키지 설치 오류 시

```bash
# npm 캐시 정리
npm cache clean --force

# node_modules 완전 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 5. WSL 환경 특수 사항

```bash
# WSL에서 파일 변경 감지가 안될 때
echo "export CHOKIDAR_USEPOLLING=true" >> ~/.bashrc
source ~/.bashrc

# 또는 일회성으로 실행
CHOKIDAR_USEPOLLING=true npm run dev
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

## 🛠️ 개발 환경 설정

### VSCode 확장 프로그램 (권장)

```bash
# VSCode가 설치되어 있다면 다음 확장 설치 권장:
# - ES7+ React/Redux/React-Native snippets
# - Tailwind CSS IntelliSense
# - TypeScript Importer
# - Auto Rename Tag
# - Prettier - Code formatter
```

### Git 설정

```bash
# Git 사용자 정보 설정 (최초 1회)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
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