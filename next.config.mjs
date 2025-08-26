// 환경별 기본 API URL 반환 함수
function getDefaultApiUrl() {
  const env = process.env.NEXT_PUBLIC_ENV || 'local';
  
  switch (env) {
    case 'local':
      return 'http://localhost:8000';
    case 'dev':
    case 'development':
      return 'https://fablink-api-dev.com';
    case 'prod':
    case 'production':
      return 'https://api.fablink.com';
    default:
      return 'http://localhost:8000';
  }
}

// 환경별 기본 설정 반환 함수
function getEnvironmentDefaults() {
  const env = process.env.NEXT_PUBLIC_ENV || 'local';
  
  const defaults = {
    local: {
      NEXT_PUBLIC_API_URL: 'http://localhost:8000',
      NEXT_PUBLIC_ENV: 'local',
      NEXT_PUBLIC_DEBUG: 'true',
      NEXT_PUBLIC_MOCK_API: 'true',
    },
    dev: {
      NEXT_PUBLIC_API_URL: 'https://fablink-api-dev.com',
      NEXT_PUBLIC_ENV: 'dev', 
      NEXT_PUBLIC_DEBUG: 'true',
      NEXT_PUBLIC_MOCK_API: 'false',
    },
    prod: {
      NEXT_PUBLIC_API_URL: 'https://api.fablink.com',
      NEXT_PUBLIC_ENV: 'prod',
      NEXT_PUBLIC_DEBUG: 'false', 
      NEXT_PUBLIC_MOCK_API: 'false',
    }
  };
  
  return defaults[env] || defaults.local;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 정적 사이트 생성을 위한 설정
  output: 'export',
  trailingSlash: true,
  
  // 정적 export를 위한 추가 설정
  distDir: 'out',
  
  // 이미지 최적화 비활성화 (정적 export에서 필요)
  images: {
    unoptimized: true,
  },
  
  // 환경 변수 설정 - .env 파일 우선, 없으면 환경별 기본값 사용
  env: (() => {
    const envDefaults = getEnvironmentDefaults();
    
    return {
      // .env 파일 값이 있으면 우선 사용, 없으면 환경별 기본값
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || envDefaults.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || envDefaults.NEXT_PUBLIC_ENV,
      NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG || envDefaults.NEXT_PUBLIC_DEBUG,
      NEXT_PUBLIC_MOCK_API: process.env.NEXT_PUBLIC_MOCK_API || envDefaults.NEXT_PUBLIC_MOCK_API,
      
      // 추가 환경 변수들도 유연하게 처리
      NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-2',
      NEXT_PUBLIC_AWS_S3_BUCKET: process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'fablink-dev-website',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://fab-link-dev.org',
    };
  })(),
  
  // 환경별 설정
  ...(process.env.NODE_ENV === 'production' && {
    // 프로덕션에서만 적용
    experimental: {
      missingSuspenseWithCSRBailout: false,
    }
  })
}

// 디버그 정보 출력 (개발 시에만)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Next.js Config Debug Info:');
  console.log('  NEXT_PUBLIC_ENV:', process.env.NEXT_PUBLIC_ENV || 'undefined');
  console.log('  NEXT_PUBLIC_API_URL:', nextConfig.env.NEXT_PUBLIC_API_URL);
  console.log('  Environment defaults applied:', getEnvironmentDefaults());
}

export default nextConfig
