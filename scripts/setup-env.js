const fs = require("fs");
const path = require("path");

// 명령행 인수에서 환경 타입 가져오기
const envType = process.argv[2];

if (!envType || !["local", "dev", "prod"].includes(envType)) {
  console.error("❌ 사용법: node setup-env.js [local|dev|prod]");
  process.exit(1);
}

// 파일 경로 설정 - Next.js 표준에 맞게
const examplePath = ".env.example";
let targetEnvPath;

if (envType === "local") {
  targetEnvPath = ".env.local";
} else if (envType === "dev") {
  targetEnvPath = ".env.development";  // Next.js가 NODE_ENV=development일 때 읽는 파일
} else if (envType === "prod") {
  targetEnvPath = ".env.production";   // Next.js가 NODE_ENV=production일 때 읽는 파일
}

// 기존 .env 파일들 삭제 함수 (.env.example 제외)
function cleanupEnvFiles() {
  const envFiles = [
    ".env",
    ".env.local", 
    ".env.dev",           // 기존 잘못된 파일명
    ".env.development",   // Next.js 표준
    ".env.prod",          // 기존 잘못된 파일명
    ".env.production",    // Next.js 표준
    ".env.staging",
    ".env.test"
  ];

  console.log("🧹 기존 .env 파일들을 정리 중...");
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`   ✅ ${file} 삭제됨`);
    }
  });
}

try {
  // .env.example 파일 존재 확인
  if (!fs.existsSync(examplePath)) {
    console.error("❌ .env.example 파일이 존재하지 않습니다.");
    process.exit(1);
  }

  // 기존 .env 파일들 삭제 (.env.example 제외)
  cleanupEnvFiles();

  // .env.example 내용 읽기
  let envContent = fs.readFileSync(examplePath, "utf8");

  console.log(`🔧 ${envType.toUpperCase()} 환경 설정을 준비 중...`);

  // 환경별 설정 적용
  if (envType === "local") {
    envContent = envContent
      // 환경 타입 설정
      .replace(/NEXT_PUBLIC_ENV=.*/g, "NEXT_PUBLIC_ENV=local")
      .replace(/NODE_ENV=.*/g, "NODE_ENV=development")

      // API URL 설정 (로컬 개발 서버)
      .replace(
        /NEXT_PUBLIC_API_URL=.*/g,
        "NEXT_PUBLIC_API_URL=http://localhost:8000"
      )
      .replace(/API_URL=.*/g, "API_URL=http://localhost:8000/api")

      // 디버그 모드 활성화
      .replace(/NEXT_PUBLIC_DEBUG=.*/g, "NEXT_PUBLIC_DEBUG=true")
      .replace(/DEBUG=.*/g, "DEBUG=true")

      // 로컬 개발 환경 설정
      .replace(/LOG_LEVEL=.*/g, "LOG_LEVEL=debug")
      .replace(
        /ENABLE_EXPERIMENTAL_FEATURES=.*/g,
        "ENABLE_EXPERIMENTAL_FEATURES=true"
      )
      .replace(/MOCK_EXTERNAL_APIS=.*/g, "MOCK_EXTERNAL_APIS=true")

      // 로컬 개발용 인증 설정
      .replace(/NEXTAUTH_URL=.*/g, "NEXTAUTH_URL=http://localhost:3000")

      // AWS 설정 (로컬 개발용)
      .replace(/AWS_REGION=.*/g, "AWS_REGION=ap-northeast-2")
      .replace(/AWS_S3_BUCKET=.*/g, "AWS_S3_BUCKET=fablink-local-uploads")
      // 클라이언트에서 참조할 퍼블릭 변수
      .replace(
        /NEXT_PUBLIC_AWS_REGION=.*/g,
        "NEXT_PUBLIC_AWS_REGION=ap-northeast-2"
      )
      .replace(
        /NEXT_PUBLIC_AWS_S3_BUCKET=.*/g,
        "NEXT_PUBLIC_AWS_S3_BUCKET=fablink-local-uploads"
      )
      // 로컬에서는 미들웨어 활성화 허용
      .replace(
        /NEXT_PUBLIC_ENABLE_MIDDLEWARE=.*/g,
        "NEXT_PUBLIC_ENABLE_MIDDLEWARE=true"
      );
  } else if (envType === "dev") {
    envContent = envContent
      // 환경 타입 설정
      .replace(/NEXT_PUBLIC_ENV=.*/g, "NEXT_PUBLIC_ENV=dev")
      .replace(/NODE_ENV=.*/g, "NODE_ENV=development")

      // API URL 설정 (개발 서버)
      .replace(
        /NEXT_PUBLIC_API_URL=.*/g,
        "NEXT_PUBLIC_API_URL=https://fablink-api-dev.com"
      )
      .replace(/API_URL=.*/g, "API_URL=https://fablink-api-dev.com")

      // 디버그 모드 활성화
      .replace(/NEXT_PUBLIC_DEBUG=.*/g, "NEXT_PUBLIC_DEBUG=true")
      .replace(/DEBUG=.*/g, "DEBUG=true")

      // 개발 환경 설정
      .replace(/LOG_LEVEL=.*/g, "LOG_LEVEL=info")
      .replace(
        /ENABLE_EXPERIMENTAL_FEATURES=.*/g,
        "ENABLE_EXPERIMENTAL_FEATURES=true"
      )
      .replace(/MOCK_EXTERNAL_APIS=.*/g, "MOCK_EXTERNAL_APIS=false")

      // 개발 서버 인증 설정
      .replace(/NEXTAUTH_URL=.*/g, "NEXTAUTH_URL=https://fab-link-dev.org")

      // AWS 설정 (개발 환경용)
      .replace(/AWS_REGION=.*/g, "AWS_REGION=ap-northeast-2")
      .replace(/AWS_S3_BUCKET=.*/g, "AWS_S3_BUCKET=fablink-dev-website")
      .replace(
        /NEXT_PUBLIC_AWS_REGION=.*/g,
        "NEXT_PUBLIC_AWS_REGION=ap-northeast-2"
      )
      .replace(
        /NEXT_PUBLIC_AWS_S3_BUCKET=.*/g,
        "NEXT_PUBLIC_AWS_S3_BUCKET=fablink-dev-website"
      )
      // 정적 호스팅 대비 미들웨어 비활성화
      .replace(
        /NEXT_PUBLIC_ENABLE_MIDDLEWARE=.*/g,
        "NEXT_PUBLIC_ENABLE_MIDDLEWARE=false"
      );
  } else if (envType === "prod") {
    envContent = envContent
      // 환경 타입 설정
      .replace(/NEXT_PUBLIC_ENV=.*/g, "NEXT_PUBLIC_ENV=prod")
      .replace(/NODE_ENV=.*/g, "NODE_ENV=production")

      // API URL 설정 (프로덕션 서버)
      .replace(
        /NEXT_PUBLIC_API_URL=.*/g,
        "NEXT_PUBLIC_API_URL=https://api.fablink.com"
      )
      .replace(/API_URL=.*/g, "API_URL=https://api.fablink.com")

      // 디버그 모드 비활성화
      .replace(/NEXT_PUBLIC_DEBUG=.*/g, "NEXT_PUBLIC_DEBUG=false")
      .replace(/DEBUG=.*/g, "DEBUG=false")

      // 프로덕션 환경 설정
      .replace(/LOG_LEVEL=.*/g, "LOG_LEVEL=error")
      .replace(
        /ENABLE_EXPERIMENTAL_FEATURES=.*/g,
        "ENABLE_EXPERIMENTAL_FEATURES=false"
      )
      .replace(/MOCK_EXTERNAL_APIS=.*/g, "MOCK_EXTERNAL_APIS=false")

      // 프로덕션 인증 설정
      .replace(/NEXTAUTH_URL=.*/g, "NEXTAUTH_URL=https://fablink.com")

      // AWS 설정 (프로덕션 환경용)
      .replace(/AWS_REGION=.*/g, "AWS_REGION=ap-northeast-2")
      .replace(/AWS_S3_BUCKET=.*/g, "AWS_S3_BUCKET=fablink-prod-uploads")
      .replace(
        /NEXT_PUBLIC_AWS_REGION=.*/g,
        "NEXT_PUBLIC_AWS_REGION=ap-northeast-2"
      )
      .replace(
        /NEXT_PUBLIC_AWS_S3_BUCKET=.*/g,
        "NEXT_PUBLIC_AWS_S3_BUCKET=fablink-prod-uploads"
      )
      // 정적 호스팅 대비 미들웨어 비활성화
      .replace(
        /NEXT_PUBLIC_ENABLE_MIDDLEWARE=.*/g,
        "NEXT_PUBLIC_ENABLE_MIDDLEWARE=false"
      );
  }

  // 환경별 파일 생성
  fs.writeFileSync(targetEnvPath, envContent);
  console.log(`✅ ${targetEnvPath} 파일이 생성되었습니다.`);

  // 설정 요약 출력
  console.log("\n📋 적용된 주요 설정:");
  const lines = envContent.split("\n");
  const importantVars = [
    "NEXT_PUBLIC_ENV",
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_DEBUG",
    "NEXTAUTH_URL",
    "AWS_S3_BUCKET",
    "MOCK_EXTERNAL_APIS",
  ];

  lines.forEach((line) => {
    const [key] = line.split("=");
    if (importantVars.includes(key)) {
      console.log(`   ${line}`);
    }
  });

  // 환경별 특징 안내
  console.log("\n🎯 환경별 특징:");
  if (envType === "local") {
    console.log("   • 로컬 개발 서버 (localhost:8000)");
    console.log("   • Mock API 활성화");
    console.log("   • 모든 실험적 기능 활성화");
    console.log("   • 상세한 디버그 로그");
  } else if (envType === "dev") {
    console.log("   • 개발 서버 (fablink-api-dev.com)");
    console.log("   • 실제 API 호출");
    console.log("   • 실험적 기능 활성화");
    console.log("   • 디버그 모드 활성화");
  } else if (envType === "prod") {
    console.log("   • 프로덕션 서버 (api.fablink.com)");
    console.log("   • 최적화된 성능");
    console.log("   • 디버그 모드 비활성화");
    console.log("   • 에러 로그만 기록");
  }

  console.log(`\n🚀 ${envType.toUpperCase()} 환경이 준비되었습니다!`);
} catch (error) {
  console.error("❌ 환경 설정 중 오류가 발생했습니다:", error.message);
  process.exit(1);
}
