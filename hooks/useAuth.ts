"use client"

import { useState, useEffect, useCallback } from 'react';
import { User, AuthState, Tokens, LoginRequest } from '@/types/auth';
import { authApi } from '@/lib/api/auth';
import { debugLog } from '@/lib/config';
import Cookies from 'js-cookie';

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
    debugLog('loadAuthFromStorage 호출됨');
    try {
      const authToken = Cookies.get('authToken');
      const refreshToken = Cookies.get('refreshToken');
      const userJson = localStorage.getItem('userData');

      debugLog('쿠키 및 로컬 스토리지 값:', { authToken: authToken ? '존재함' : '없음', refreshToken: refreshToken ? '존재함' : '없음', userJson: userJson ? '존재함' : '없음' });

      if (authToken && refreshToken && userJson) {
        const tokens: Tokens = { access: authToken, refresh: refreshToken };
        const user: User = JSON.parse(userJson);
        
        debugLog('토큰 및 사용자 데이터 파싱 완료', { user, tokens });

        // 토큰 유효성 검증
        const isValid = await authApi.validateToken();
        debugLog('토큰 유효성 검증 결과:', isValid);
        
        if (isValid) {
          debugLog('토큰 유효함, 인증 상태 설정');
          setAuthState({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          debugLog('토큰 유효하지 않음, 갱신 시도');
          // 토큰이 유효하지 않은 경우 토큰 갱신 시도
          try {
            const newTokens = await authApi.refreshToken();
            debugLog('토큰 갱신 성공:', newTokens);
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
        debugLog('필요한 인증 정보가 부족함, 비인증 상태로 설정');
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
        Cookies.set('authToken', response.tokens.access, { expires: 1 }); // 1일 후 만료
        Cookies.set('refreshToken', response.tokens.refresh, { expires: 7 }); // 7일 후 만료
        localStorage.setItem('userData', JSON.stringify(response.user));

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
      Cookies.remove('authToken');
      Cookies.remove('refreshToken');
      localStorage.removeItem('userData');
      
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
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }
      const newTokens = await authApi.refreshToken(refreshToken);
      Cookies.set('authToken', newTokens.access, { expires: 1 });
      Cookies.set('refreshToken', newTokens.refresh, { expires: 7 });
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
