const fs = require('fs');
const path = require('path');

// 명령행 인수에서 환경 타입 가져오기
const envType = process.argv[2];

if (!envType || !['local', 'dev', 'prod'].includes(envType)) {
    console.error('❌ 사용법: node setup-env.js [local|dev|prod]');
    process.exit(1);
}

// 파일 경로 설정
const examplePath = '.env.example';
const targetEnvPath = `.env.${envType}`;
const localEnvPath = '.env.local';

try {
    // .env.example 파일 존재 확인
    if (!fs.existsSync(examplePath)) {
        console.error('❌ .env.example 파일이 존재하지 않습니다.');
        process.exit(1);
    }

    // .env.example 내용 읽기
    let envContent = fs.readFileSync(examplePath, 'utf8');
    
    console.log(`🔧 ${envType.toUpperCase()} 환경 설정을 준비 중...`);

    // 환경별 설정 적용
    if (envType === 'local') {
        envContent = envContent
            // 환경 타입 설정
            .replace(/NEXT_PUBLIC_ENV=.*/g, 'NEXT_PUBLIC_ENV=local')
            .replace(/NODE_ENV=.*/g, 'NODE_ENV=development')
            
            // API URL 설정 (로컬 개발 서버)
            .replace(/NEXT_PUBLIC_API_URL=.*/g, 'NEXT_PUBLIC_API_URL=http://localhost:8000')
            .replace(/API_URL=.*/g, 'API_URL=http://localhost:8000/api')
            
            // 디버그 모드 활성화
            .replace(/NEXT_PUBLIC_DEBUG=.*/g, 'NEXT_PUBLIC_DEBUG=true')
            .replace(/DEBUG=.*/g, 'DEBUG=true')
            
            // 로컬 개발 환경 설정
            .replace(/LOG_LEVEL=.*/g, 'LOG_LEVEL=debug')
            .replace(/ENABLE_EXPERIMENTAL_FEATURES=.*/g, 'ENABLE_EXPERIMENTAL_FEATURES=true')
            .replace(/MOCK_EXTERNAL_APIS=.*/g, 'MOCK_EXTERNAL_APIS=true')
            
            // 로컬 개발용 인증 설정
            .replace(/NEXTAUTH_URL=.*/g, 'NEXTAUTH_URL=http://localhost:3000')
            
            // AWS 설정 (로컬 개발용)
            .replace(/AWS_REGION=.*/g, 'AWS_REGION=ap-northeast-2')
            .replace(/AWS_S3_BUCKET=.*/g, 'AWS_S3_BUCKET=fablink-local-uploads')
            // 클라이언트에서 참조할 퍼블릭 변수
            .replace(/NEXT_PUBLIC_AWS_REGION=.*/g, 'NEXT_PUBLIC_AWS_REGION=ap-northeast-2')
            .replace(/NEXT_PUBLIC_AWS_S3_BUCKET=.*/g, 'NEXT_PUBLIC_AWS_S3_BUCKET=fablink-local-uploads')
            // 로컬에서는 미들웨어 활성화 허용
            .replace(/NEXT_PUBLIC_ENABLE_MIDDLEWARE=.*/g, 'NEXT_PUBLIC_ENABLE_MIDDLEWARE=true');
            
    } else if (envType === 'dev') {
        envContent = envContent
            // 환경 타입 설정
            .replace(/NEXT_PUBLIC_ENV=.*/g, 'NEXT_PUBLIC_ENV=development')
            .replace(/NODE_ENV=.*/g, 'NODE_ENV=development')
            
            // API URL 설정 (개발 서버)
            .replace(/NEXT_PUBLIC_API_URL=.*/g, 'NEXT_PUBLIC_API_URL=https://dev-api.fablink.com')
            .replace(/API_URL=.*/g, 'API_URL=https://dev-api.fablink.com')
            
            // 디버그 모드 활성화
            .replace(/NEXT_PUBLIC_DEBUG=.*/g, 'NEXT_PUBLIC_DEBUG=true')
            .replace(/DEBUG=.*/g, 'DEBUG=true')
            
            // 개발 환경 설정
            .replace(/LOG_LEVEL=.*/g, 'LOG_LEVEL=info')
            .replace(/ENABLE_EXPERIMENTAL_FEATURES=.*/g, 'ENABLE_EXPERIMENTAL_FEATURES=true')
            .replace(/MOCK_EXTERNAL_APIS=.*/g, 'MOCK_EXTERNAL_APIS=false')
            
            // 개발 서버 인증 설정
            .replace(/NEXTAUTH_URL=.*/g, 'NEXTAUTH_URL=https://dev.fablink.com')
            
            // AWS 설정 (개발 환경용)
            .replace(/AWS_REGION=.*/g, 'AWS_REGION=ap-northeast-2')
            .replace(/AWS_S3_BUCKET=.*/g, 'AWS_S3_BUCKET=fablink-dev-uploads')
            .replace(/NEXT_PUBLIC_AWS_REGION=.*/g, 'NEXT_PUBLIC_AWS_REGION=ap-northeast-2')
            .replace(/NEXT_PUBLIC_AWS_S3_BUCKET=.*/g, 'NEXT_PUBLIC_AWS_S3_BUCKET=fablink-dev-uploads')
            // 정적 호스팅 대비 미들웨어 비활성화
            .replace(/NEXT_PUBLIC_ENABLE_MIDDLEWARE=.*/g, 'NEXT_PUBLIC_ENABLE_MIDDLEWARE=false');
            
    } else if (envType === 'prod') {
        envContent = envContent
            // 환경 타입 설정
            .replace(/NEXT_PUBLIC_ENV=.*/g, 'NEXT_PUBLIC_ENV=production')
            .replace(/NODE_ENV=.*/g, 'NODE_ENV=production')
            
            // API URL 설정 (프로덕션 서버)
            .replace(/NEXT_PUBLIC_API_URL=.*/g, 'NEXT_PUBLIC_API_URL=https://api.fablink.com')
            .replace(/API_URL=.*/g, 'API_URL=https://api.fablink.com')
            
            // 디버그 모드 비활성화
            .replace(/NEXT_PUBLIC_DEBUG=.*/g, 'NEXT_PUBLIC_DEBUG=false')
            .replace(/DEBUG=.*/g, 'DEBUG=false')
            
            // 프로덕션 환경 설정
            .replace(/LOG_LEVEL=.*/g, 'LOG_LEVEL=error')
            .replace(/ENABLE_EXPERIMENTAL_FEATURES=.*/g, 'ENABLE_EXPERIMENTAL_FEATURES=false')
            .replace(/MOCK_EXTERNAL_APIS=.*/g, 'MOCK_EXTERNAL_APIS=false')
            
            // 프로덕션 인증 설정
            .replace(/NEXTAUTH_URL=.*/g, 'NEXTAUTH_URL=https://fablink.com')
            
            // AWS 설정 (프로덕션 환경용)
            .replace(/AWS_REGION=.*/g, 'AWS_REGION=ap-northeast-2')
            .replace(/AWS_S3_BUCKET=.*/g, 'AWS_S3_BUCKET=fablink-prod-uploads')
            .replace(/NEXT_PUBLIC_AWS_REGION=.*/g, 'NEXT_PUBLIC_AWS_REGION=ap-northeast-2')
            .replace(/NEXT_PUBLIC_AWS_S3_BUCKET=.*/g, 'NEXT_PUBLIC_AWS_S3_BUCKET=fablink-prod-uploads')
            // 정적 호스팅 대비 미들웨어 비활성화
            .replace(/NEXT_PUBLIC_ENABLE_MIDDLEWARE=.*/g, 'NEXT_PUBLIC_ENABLE_MIDDLEWARE=false');
    }

    // 환경별 파일 생성/업데이트
    fs.writeFileSync(targetEnvPath, envContent);
    console.log(`✅ ${targetEnvPath} 파일이 생성/업데이트되었습니다.`);

    // .env.local 파일 생성 (Next.js가 읽을 파일)
    fs.writeFileSync(localEnvPath, envContent);
    console.log(`✅ ${localEnvPath} 파일이 업데이트되었습니다.`);

    // 설정 요약 출력
    console.log('\n📋 적용된 주요 설정:');
    const lines = envContent.split('\n');
    const importantVars = [
        'NEXT_PUBLIC_ENV', 
        'NEXT_PUBLIC_API_URL', 
        'NEXT_PUBLIC_DEBUG',
        'NEXTAUTH_URL',
        'AWS_S3_BUCKET',
        'MOCK_EXTERNAL_APIS'
    ];
    
    lines.forEach(line => {
        const [key] = line.split('=');
        if (importantVars.includes(key)) {
            console.log(`   ${line}`);
        }
    });

    // 환경별 특징 안내
    console.log('\n🎯 환경별 특징:');
    if (envType === 'local') {
        console.log('   • 로컬 개발 서버 (localhost:8000)');
        console.log('   • Mock API 활성화');
        console.log('   • 모든 실험적 기능 활성화');
        console.log('   • 상세한 디버그 로그');
    } else if (envType === 'dev') {
        console.log('   • 개발 서버 (dev-api.fablink.com)');
        console.log('   • 실제 API 호출');
        console.log('   • 실험적 기능 활성화');
        console.log('   • 디버그 모드 활성화');
    } else if (envType === 'prod') {
        console.log('   • 프로덕션 서버 (api.fablink.com)');
        console.log('   • 최적화된 성능');
        console.log('   • 디버그 모드 비활성화');
        console.log('   • 에러 로그만 기록');
    }

    console.log(`\n🚀 ${envType.toUpperCase()} 환경이 준비되었습니다!`);

} catch (error) {
    console.error('❌ 환경 설정 중 오류가 발생했습니다:', error.message);
    process.exit(1);
}
