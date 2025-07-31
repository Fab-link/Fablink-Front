"use client"

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { debugLog } from '@/lib/config';

interface LoginFormProps {
  redirectPath?: string;
}

/**
 * 로그인 폼 컴포넌트
 */
export default function LoginForm({ redirectPath = '/dashboard' }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { login, error, isAuthenticated, user } = useAuthContext();
  const router = useRouter();

  // 인증 상태가 변경되면 지정된 경로로 리디렉션
  useEffect(() => {
    if (isAuthenticated && user) {
      debugLog('인증됨, 리디렉션:', { redirectPath });
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router, redirectPath]);

  /**
   * 로그인 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setErrorMessage('사용자명과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      debugLog('로그인 시도:', { username, redirectPath });
      const response = await login(username, password);
      debugLog('로그인 응답:', response);
      
      // 로그인 성공 시 리디렉션은 useEffect에서 처리
    } catch (error: any) {
      debugLog('로그인 에러:', error);
      setErrorMessage(error.message || '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
      
      <form onSubmit={handleSubmit}>
        {/* 에러 메시지 표시 */}
        {(errorMessage || error) && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errorMessage || error}
          </div>
        )}
        
        {/* 사용자명 입력 필드 */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            사용자명
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
            required
          />
        </div>
        
        {/* 비밀번호 입력 필드 */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
            required
          />
        </div>
        
        {/* 로그인 버튼 */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
