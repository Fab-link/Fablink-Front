import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 배포(S3 정적 호스팅)에서는 미들웨어가 작동하지 않으므로 비활성화할 수 있게 제어
const ENABLE_MIDDLEWARE = process.env.NEXT_PUBLIC_ENABLE_MIDDLEWARE === 'true';

// 인증이 필요한 경로 목록
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/manufacturing',
  '/design',
  '/factory',
  '/orders',
];

// 인증 없이 접근 가능한 경로 목록
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/',
];

export function middleware(request: NextRequest) {
  if (!ENABLE_MIDDLEWARE) {
    return NextResponse.next();
  }
  const { pathname } = request.nextUrl;
  
  // 정적 파일 요청은 무시
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 토큰 확인
  const token = request.cookies.get('authToken')?.value;
  const isAuthenticated = !!token;

  // 인증이 필요한 경로에 접근하려는 경우
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근하려는 경우
  if (isAuthenticated && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = ENABLE_MIDDLEWARE
  ? {
      matcher: [
        /*
         * 미들웨어가 실행될 경로 패턴 매처
         * '/((?!api|_next/static|_next/image|favicon.ico).*)'
         */
        '/(.*)',
      ],
    }
  : { matcher: [] };
