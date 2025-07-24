"use client"

import { useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '@/types/auth';
import { authApi } from '@/lib/api/auth';
import { debugLog } from '@/lib/config';

/**
 * 인증 관련 상태와 함수를 제공하는 커스텀 훅
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * 로컬 스토리지에서 인증 정보 로드
   */
  const loadAuthFromStorage = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userJson = localStorage.getItem('userData');

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        
        // 토큰 유효성 검증 (선택적)
        const isValid = await authApi.validateToken();
        
        if (isValid) {
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // 토큰이 유효하지 않은 경우 로그아웃 처리
          await logout();
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      debugLog('인증 정보 로딩 에러:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: '인증 정보를 불러오는 중 오류가 발생했습니다.',
      }));
    }
  }, []);

  // 초기 로딩 시 로컬 스토리지에서 인증 정보 가져오기
  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);

  /**
   * 로그인 함수
   * @param username 사용자명
   * @param password 비밀번호
   */
  const login = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authApi.login({ username, password });
      
      if (response.success) {
        setAuthState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return response;
      } else {
        throw new Error(response.message || '로그인 실패');
      }
    } catch (error: any) {
      debugLog('로그인 에러:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '로그인 중 오류가 발생했습니다.',
      }));
      throw error;
    }
  };

  /**
   * 로그아웃 함수
   * 로그아웃 후 메인 페이지('/')로 리디렉션
   */
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await authApi.logout();
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      debugLog('로그아웃 에러:', error);
      
      // 에러가 발생해도 로컬에서는 로그아웃 처리
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  /**
   * 에러 초기화 함수
   */
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    login,
    logout,
    clearError,
    refreshAuth: loadAuthFromStorage,
  };
}
