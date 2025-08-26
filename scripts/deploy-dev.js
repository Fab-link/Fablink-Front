const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 정의
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

// 설정
const config = {
    s3Bucket: 'fablink-dev-website',
    awsRegion: 'ap-northeast-2',
    buildDir: 'out',
    websiteDomain: 'https://fab-link-dev.org'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
    try {
        log(`${description}...`, 'yellow');
        const result = execSync(command, { 
            encoding: 'utf8', 
            stdio: ['inherit', 'pipe', 'pipe'] 
        });
        log(`✅ ${description} 완료`, 'green');
        return result;
    } catch (error) {
        log(`❌ ${description} 실패: ${error.message}`, 'red');
        process.exit(1);
    }
}

function checkFileExists(filePath, description) {
    if (!fs.existsSync(filePath)) {
        log(`❌ ${description}이(가) 존재하지 않습니다: ${filePath}`, 'red');
        process.exit(1);
    }
    log(`✅ ${description} 확인됨`, 'green');
}

function main() {
    log('🚀 Fablink-Front Dev 환경 S3 배포 시작', 'blue');
    log('==================================================', 'blue');

    // 1. 빌드 디렉토리 확인
    checkFileExists(config.buildDir, '빌드 디렉토리');

    // 2. 빌드 결과 요약
    const buildFiles = execSync(`find ${config.buildDir} -type f | wc -l`, { encoding: 'utf8' }).trim();
    const buildSize = execSync(`du -sh ${config.buildDir} | cut -f1`, { encoding: 'utf8' }).trim();
    
    log('📊 빌드 결과:', 'blue');
    log(`   - 빌드 디렉토리: ${config.buildDir}`);
    log(`   - 파일 개수: ${buildFiles}`);
    log(`   - 총 크기: ${buildSize}`);

    // 3. AWS CLI 설치 확인
    try {
        execSync('aws --version', { stdio: 'ignore' });
        log('✅ AWS CLI 확인됨', 'green');
    } catch (error) {
        log('❌ AWS CLI가 설치되지 않았습니다', 'red');
        log('설치 방법: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html');
        process.exit(1);
    }

    // 4. AWS 자격 증명 확인
    try {
        execCommand('aws sts get-caller-identity', 'AWS 자격 증명 확인');
    } catch (error) {
        log('❌ AWS 자격 증명이 설정되지 않았습니다', 'red');
        log('다음 명령어로 설정하세요: aws configure');
        process.exit(1);
    }

    // 5. S3 버킷 접근 확인
    try {
        execCommand(
            `aws s3api head-bucket --bucket ${config.s3Bucket} --region ${config.awsRegion}`,
            `S3 버킷 '${config.s3Bucket}' 접근 확인`
        );
    } catch (error) {
        log(`❌ S3 버킷 '${config.s3Bucket}'에 접근할 수 없습니다`, 'red');
        log('버킷이 존재하는지, 권한이 있는지 확인하세요.');
        process.exit(1);
    }

    // 6. S3에 업로드
    log('📤 S3에 업로드 중...', 'yellow');
    log(`   버킷: s3://${config.s3Bucket}`);
    log(`   리전: ${config.awsRegion}`);

    try {
        execCommand(
            `aws s3 sync ${config.buildDir}/ s3://${config.s3Bucket} --delete --region ${config.awsRegion}`,
            'S3 업로드'
        );
    } catch (error) {
        log('❌ S3 업로드 실패', 'red');
        process.exit(1);
    }

    // 7. 업로드 결과 확인
    try {
        const uploadedFiles = execSync(
            `aws s3 ls s3://${config.s3Bucket} --recursive --region ${config.awsRegion} | wc -l`,
            { encoding: 'utf8' }
        ).trim();
        log(`📊 업로드된 파일 수: ${uploadedFiles}`, 'blue');
    } catch (error) {
        log('⚠️ 업로드 결과 확인 중 오류 발생', 'yellow');
    }

    // 8. 완료 메시지
    const s3WebsiteUrl = `http://${config.s3Bucket}.s3-website.${config.awsRegion}.amazonaws.com`;
    
    log('', 'reset');
    log('==================================================', 'blue');
    log('🎉 Dev 환경 배포 완료!', 'green');
    log('', 'reset');
    log('📍 접속 정보:', 'blue');
    log(`   🌐 커스텀 도메인: ${config.websiteDomain}`);
    log(`   🔗 S3 웹사이트 URL: ${s3WebsiteUrl}`);
    log(`   🔗 API 서버: https://fablink-api-dev.com`);
    log(`   🪣 S3 버킷: s3://${config.s3Bucket}`);
    log('', 'reset');
    log('🔍 배포 확인 방법:', 'yellow');
    log('   1. 브라우저에서 위 URL 접속');
    log('   2. 개발자 도구에서 API 호출 확인');
    log('   3. 모든 페이지 라우팅 테스트');
    log('', 'reset');
    log('📝 다음 단계:', 'blue');
    log('   • 도메인 연결 확인 (fab-link-dev.org)');
    log('   • CloudFront 설정 (HTTPS, 캐싱)');
    log('   • 모니터링 설정');
    log('==================================================', 'blue');
}

// 스크립트 실행
if (require.main === module) {
    main();
}
