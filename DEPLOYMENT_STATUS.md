# Fablink-Front 배포 상태 문서

## 📋 현재 배포 환경 상태

### 🔧 환경 구성

| 환경 | 상태 | 프론트엔드 URL | 백엔드 API URL | S3 버킷 | 배포 방식 |
|------|------|---------------|---------------|---------|----------|
| **Local** | ✅ 구성완료 | http://localhost:3000 | http://localhost:8000 | fablink-local-uploads | Next.js Dev Server |
| **Dev** | ✅ 구성완료 | https://fab-link-dev.org | https://fablink-api-dev.com | fablink-dev-website | S3 Static Hosting |
| **Prod** | ⏳ 대기중 | https://fablink.com | https://api.fablink.com | fablink-prod-uploads | S3 Static Hosting |

## 🚀 배포 명령어

### 로컬 개발 환경
```bash
# 로컬 개발 서버 실행 (localhost:3000)
npm run local

# 또는 dev 환경 설정으로 로컬 서버 실행
npm run dev-server
```

### Dev 환경 S3 배포
```bash
# Dev 환경으로 빌드하고 S3에 자동 배포
npm run dev

# 실행되는 과정:
# 1. predev: 환경 변수 설정 (dev)
# 2. build: 정적 파일 빌드
# 3. deploy-dev.js: S3 업로드
```

### 수동 배포 (필요시)
```bash
# 환경 설정만
npm run predev

# 빌드만
npm run build

# 배포 스크립트만 실행
node scripts/deploy-dev.js
```

## 🎯 Dev 환경 설정 상세

### 환경 변수 (.env.dev)
```bash
NODE_ENV=development
NEXT_PUBLIC_ENV=development

# API 연동
NEXT_PUBLIC_API_URL=https://fablink-api-dev.com
API_URL=https://fablink-api-dev.com

# 도메인 설정
NEXTAUTH_URL=https://fab-link-dev.org

# AWS S3 설정
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=fablink-dev-website
NEXT_PUBLIC_AWS_REGION=ap-northeast-2
NEXT_PUBLIC_AWS_S3_BUCKET=fablink-dev-website

# 정적 호스팅 최적화
NEXT_PUBLIC_ENABLE_MIDDLEWARE=false

# 디버그 모드
DEBUG=true
NEXT_PUBLIC_DEBUG=true
```

### Next.js 설정 (next.config.mjs)
```javascript
const nextConfig = {
  // 정적 사이트 생성
  output: 'export',
  trailingSlash: true,
  
  // 이미지 최적화 비활성화 (정적 export 필요)
  images: {
    unoptimized: true,
  },
  
  // 빌드 오류 무시 (개발 단계)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}
```

## 🔄 배포 프로세스

### 자동 배포 흐름 (`npm run dev`)

1. **환경 설정** (`predev`)
   - `scripts/setup-env.js dev` 실행
   - `.env.dev` → `.env.local` 복사
   - Dev 환경 변수 적용

2. **정적 빌드** (`build`)
   - `next build` 실행
   - `out/` 디렉토리에 정적 파일 생성
   - 모든 페이지 사전 렌더링

3. **S3 배포** (`deploy-dev.js`)
   - AWS 자격 증명 확인
   - S3 버킷 접근 권한 확인
   - `aws s3 sync` 명령으로 업로드
   - 기존 파일 삭제 (`--delete` 옵션)

### 배포 결과 확인

배포 완료 후 다음 URL들로 접속 가능:
- **커스텀 도메인**: https://fab-link-dev.org
- **S3 직접 URL**: http://fablink-dev-website.s3-website.ap-northeast-2.amazonaws.com

## 🛠️ AWS 리소스 구성

### S3 버킷: `fablink-dev-website`
- **리전**: ap-northeast-2 (서울)
- **용도**: 정적 웹사이트 호스팅
- **설정**: 
  - 정적 웹사이트 호스팅 활성화
  - 인덱스 문서: `index.html`
  - 오류 문서: `404.html`
  - 퍼블릭 읽기 권한 설정

### 도메인: `fab-link-dev.org`
- **연결 방식**: CloudFront 또는 Route 53
- **SSL**: HTTPS 지원
- **CDN**: CloudFront 캐싱 (설정된 경우)

## 📊 빌드 출력 구조

```
out/                          # 정적 빌드 결과물
├── _next/                    # Next.js 정적 자산
│   ├── static/              # CSS, JS 파일
│   │   ├── css/
│   │   └── chunks/
│   └── ...
├── index.html               # 메인 페이지
├── manufacturing/           # 제조 관련 페이지들
│   └── index.html
├── 404.html                 # 에러 페이지
├── favicon.ico              # 파비콘
└── ...                      # 기타 페이지들
```

## 🔍 배포 확인 체크리스트

### ✅ 배포 후 필수 확인사항

- [ ] **기본 접속**: https://fab-link-dev.org 정상 접속
- [ ] **API 연동**: 백엔드 API 호출 정상 작동
- [ ] **페이지 라우팅**: 모든 페이지 경로 정상 작동
- [ ] **정적 자산**: CSS, JS, 이미지 로딩 정상
- [ ] **환경 변수**: 개발자 도구에서 올바른 환경 설정 확인
- [ ] **CORS**: 백엔드 API와 CORS 설정 정상
- [ ] **HTTPS**: SSL 인증서 정상 작동

### 🧪 테스트 명령어

```bash
# API 연결 테스트
curl -X GET https://dev-api.fablink.com/health

# S3 업로드 확인
aws s3 ls s3://fablink-dev-website/

# 도메인 DNS 확인
nslookup fab-link-dev.org

# 웹사이트 응답 확인
curl -I https://fab-link-dev.org
```

## 🚨 알려진 이슈 및 해결방법

### 1. AWS 자격 증명 오류
```bash
# 문제: AWS credentials not configured
# 해결: AWS CLI 설정
aws configure
```

### 2. S3 버킷 접근 권한 오류
```bash
# 문제: Access Denied
# 해결: IAM 정책 확인 또는 버킷 정책 업데이트
aws s3api get-bucket-policy --bucket fablink-dev-website
```

### 3. 빌드 실패
```bash
# 문제: Build failed
# 해결: 의존성 재설치
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 4. API CORS 이슈
- **문제**: 브라우저에서 백엔드 API 호출 시 CORS 에러
- **해결**: 백엔드에서 `https://fab-link-dev.org` 도메인 허용 필요

### 5. 라우팅 404 오류
- **문제**: 직접 URL 접속 시 404 에러
- **해결**: CloudFront에서 모든 404를 `/index.html`로 리다이렉트 설정

## 📈 성능 최적화

### 현재 적용된 최적화
- ✅ 정적 사이트 생성 (`output: 'export'`)
- ✅ 이미지 최적화 비활성화 (정적 호스팅 호환)
- ✅ 트레일링 슬래시 설정 (`trailingSlash: true`)
- ✅ 미들웨어 비활성화 (정적 호스팅 최적화)

### 추가 최적화 권장사항
- 🔄 CloudFront CDN 설정
- 🔄 Gzip 압축 활성화
- 🔄 브라우저 캐싱 헤더 설정
- 🔄 이미지 WebP 변환

## 📞 문제 해결 및 지원

### 배포 관련 문제 발생 시

1. **로그 확인**: 배포 스크립트 실행 시 출력되는 로그 확인
2. **AWS 상태 확인**: AWS 콘솔에서 S3, CloudFront 상태 확인
3. **네트워크 테스트**: `curl` 명령으로 API 및 웹사이트 응답 확인
4. **브라우저 캐시**: 하드 리프레시 (Ctrl+Shift+R) 시도

### 연락처
- **GitHub Issues**: 프로젝트 저장소 이슈 등록
- **개발팀 Slack**: #fablink-frontend 채널

---

**마지막 업데이트**: 2024-08-25  
**배포 환경**: Dev (fablink-dev-website)  
**다음 마일스톤**: 프로덕션 환경 설정
