"use client"

import React, { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { debugLog } from '@/lib/config';

export default function LoginPage() {
  const { isAuthenticated, user } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get('from') || '/dashboard';

  useEffect(() => {
    debugLog('로그인 페이지 마운트:', { isAuthenticated, user, fromPath });
    
    // 이미 로그인된 경우 원래 가려던 페이지로 리디렉션
    if (isAuthenticated && user) {
      debugLog('이미 로그인됨, 리디렉션:', { to: fromPath });
      router.push(fromPath);
    }
  }, [isAuthenticated, user, router, fromPath]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Fablink
          </h1>
          <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
            계정에 로그인하세요
          </h2>
        </div>
        
        <LoginForm redirectPath={fromPath} />
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
