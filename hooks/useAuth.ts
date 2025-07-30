"use client"

import { useState, useEffect, useCallback } from 'react';
import { User, AuthState, Tokens, LoginRequest } from '@/types/auth';
import { authApi } from '@/lib/api/auth';
import { debugLog } from '@/lib/config';

/**
 * 인증 관련 상태와 함수를 제공하는 커스텀 훅
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * 로컬 스토리지에서 인증 정보 로드
   */
  const loadAuthFromStorage = useCallback(async () => {
    try {
      const tokensJson = localStorage.getItem('authTokens');
      const userJson = localStorage.getItem('userData');

      if (tokensJson && userJson) {
        const tokens: Tokens = JSON.parse(tokensJson);
        const user: User = JSON.parse(userJson);
        
        // 토큰 유효성 검증
        const isValid = await authApi.validateToken();
        
        if (isValid) {
          setAuthState({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // 토큰이 유효하지 않은 경우 토큰 갱신 시도
          try {
            const newTokens = await authApi.refreshToken();
            setAuthState({
              user,
              tokens: newTokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (refreshError) {
            debugLog('토큰 갱신 실패:', refreshError);
            // 갱신도 실패하면 로그아웃 처리
            await logout();
          }
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
   * @param user_id 사용자 ID
   * @param password 비밀번호
   * @param user_type 사용자 타입 (선택적)
   */
  const login = async (user_id: string, password: string, user_type?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const loginData: LoginRequest = { user_id, password };
      if (user_type) {
        loginData.user_type = user_type;
      }
      
      const response = await authApi.login(loginData);
      
      if (response.success) {
        setAuthState({
          user: response.user,
          tokens: response.tokens,
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
      
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      // 백엔드에서 오는 에러 메시지 처리
      if (error.message) {
        try {
          // JSON 형태의 에러 메시지인 경우 파싱
          const errorData = JSON.parse(error.message);
          if (errorData.errors) {
            // 필드별 에러 메시지 추출
            const errorMessages = Object.values(errorData.errors).flat();
            errorMessage = errorMessages.join(', ');
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // JSON 파싱 실패 시 원본 메시지 사용
          errorMessage = error.message;
        }
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  /**
   * 로그아웃 함수
   */
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await authApi.logout();
      
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      debugLog('로그아웃 에러:', error);
      
      // 에러가 발생해도 로컬에서는 로그아웃 처리
      setAuthState({
        user: null,
        tokens: null,
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

  /**
   * 토큰 갱신 함수
   */
  const refreshTokens = async () => {
    try {
      const newTokens = await authApi.refreshToken();
      setAuthState(prev => ({
        ...prev,
        tokens: newTokens,
      }));
      return newTokens;
    } catch (error) {
      debugLog('토큰 갱신 실패:', error);
      await logout();
      throw error;
    }
  };

  return {
    ...authState,
    login,
    logout,
    clearError,
    refreshAuth: loadAuthFromStorage,
    refreshTokens,
  };
}
