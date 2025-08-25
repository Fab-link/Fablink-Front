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
   * 세션 스토리지에서 인증 정보 로드
   */
  const loadAuthFromStorage = useCallback(async () => {
    debugLog('loadAuthFromStorage 호출됨');
    try {
      // 서버 사이드 렌더링 환경에서는 sessionStorage에 접근할 수 없음
      if (typeof window === 'undefined') {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: false }));
        return;
      }
      
      // 1차: sessionStorage (탭 생명주기)
      let authToken = sessionStorage.getItem('authToken');
      let refreshToken = sessionStorage.getItem('refreshToken');
      let userJson = sessionStorage.getItem('userData');

      // 새로고침(탭 재시작) 후 sessionStorage 비어있을 수 있으므로 localStorage fallback
      if (!authToken || !refreshToken) {
        try {
          const lsTokensRaw = localStorage.getItem('authTokens');
          if (lsTokensRaw) {
            const lsTokens = JSON.parse(lsTokensRaw);
            if (lsTokens?.access && lsTokens?.refresh) {
              authToken = authToken || lsTokens.access;
              refreshToken = refreshToken || lsTokens.refresh;
              // sessionStorage에 다시 채워 넣어 기존 로직과 동기화
              sessionStorage.setItem('authToken', lsTokens.access);
              sessionStorage.setItem('refreshToken', lsTokens.refresh);
            }
          }
          // userData도 복원
          if (!userJson) {
            const lsUserRaw = localStorage.getItem('userData');
            if (lsUserRaw) {
              userJson = lsUserRaw;
              sessionStorage.setItem('userData', lsUserRaw);
            }
          }
        } catch (e) {
          debugLog('localStorage fallback 복원 실패', e);
        }
      }

      debugLog('세션 스토리지 값:', { authToken: authToken ? '존재함' : '없음', refreshToken: refreshToken ? '존재함' : '없음', userJson: userJson ? '존재함' : '없음' });

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
      } else if (authToken && refreshToken && !userJson) {
        // 토큰은 있으나 userData가 없는 경우(드문 케이스) 백엔드로부터 사용자 정보 재조회
        try {
          debugLog('userData 누락 → user_info 재요청');
          const info = await authApi.getCurrentUser();
          if (info?.success && info?.user) {
            const userInfo: User = {
              id: (info.user as any).id,
              userId: (info.user as any).userId,
              name: (info.user as any).name,
              userType: (info.user as any).userType,
              contact: (info.user as any).contact || '',
              address: (info.user as any).address || ''
            } as User;
            sessionStorage.setItem('userData', JSON.stringify(userInfo));
            setAuthState({
              user: userInfo,
              tokens: { access: authToken, refresh: refreshToken },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
        } catch (e) {
          debugLog('user_info 재조회 실패', e);
        }
        // 실패 시 비인증 처리
  setAuthState((prev: AuthState) => ({ ...prev, isLoading: false }));
      } else {
        debugLog('필요한 인증 정보가 부족함, 비인증 상태로 설정');
  setAuthState((prev: AuthState) => ({
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
  setAuthState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
      
      const loginData: LoginRequest = { user_id, password };
      if (user_type) {
        loginData.user_type = user_type;
      }
      
      const response = await authApi.login(loginData);
      
      if (response.success) {
        debugLog('백엔드 응답 전체:', response);
        
        // 사용자 데이터 추출 (camelCase 변환된 필드명 사용)
  const userTypeCamel = (response as any).userType || (response as any).user_type;
  const userData = userTypeCamel === 'designer' ? (response as any).designer : (response as any).factory;
        
  debugLog('추출된 사용자 데이터:', { userType: userTypeCamel, userData });
        
        if (!userData) {
          debugLog('사용자 데이터 없음:', { response });
          throw new Error('사용자 데이터를 찾을 수 없습니다.');
        }
        
        const userInfo = {
          id: userData.id,
          userId: userData.userId,
          name: userData.name,
          userType: userTypeCamel,
          contact: userData.contact || '',
          address: userData.address || ''
        };
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('authToken', response.tokens.access);
          sessionStorage.setItem('refreshToken', response.tokens.refresh);
          sessionStorage.setItem('userData', JSON.stringify(userInfo));
        }

        setAuthState({
          user: userInfo,
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
      
      setAuthState((prev: AuthState) => ({
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
  setAuthState((prev: AuthState) => ({ ...prev, isLoading: true }));
      
      await authApi.logout();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('userData');
      }
      
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
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('userData');
      }
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
  setAuthState((prev: AuthState) => ({ ...prev, error: null }));
  };

  /**
   * 토큰 갱신 함수
   */
  const refreshTokens = async () => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Cannot access sessionStorage on server side');
      }
      
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }
  const newTokens = await authApi.refreshToken();
      sessionStorage.setItem('authToken', newTokens.access);
      sessionStorage.setItem('refreshToken', newTokens.refresh);
  setAuthState((prev: AuthState) => ({
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
