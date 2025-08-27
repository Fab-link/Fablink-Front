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
   * localStorage에서 인증 정보 로드 (통일된 방식)
   */
  const loadAuthFromStorage = useCallback(async () => {
    debugLog('loadAuthFromStorage 호출됨');
    try {
      // 서버 사이드 렌더링 환경에서는 localStorage에 접근할 수 없음
      if (typeof window === 'undefined') {
        setAuthState((prev: AuthState) => ({ ...prev, isLoading: false }));
        return;
      }
      
      // localStorage에서 토큰과 사용자 정보 가져오기 (통일된 방식)
      const tokensJson = localStorage.getItem('authTokens');
      const userJson = localStorage.getItem('userData');

      debugLog('localStorage 값:', { 
        tokensJson: tokensJson ? '존재함' : '없음', 
        userJson: userJson ? '존재함' : '없음' 
      });

      if (tokensJson && userJson) {
        try {
          const tokens: Tokens = JSON.parse(tokensJson);
          const user: User = JSON.parse(userJson);
          
          debugLog('토큰 및 사용자 데이터 파싱 완료', { user, tokens });

          // 토큰 유효성 검증 (네트워크 오류 시 유효하다고 가정)
          let isValid = true;
          try {
            isValid = await authApi.validateToken();
            debugLog('🔍 토큰 유효성 검증 결과:', isValid);
          } catch (validationError) {
            debugLog('🚨 토큰 유효성 검증 중 오류:', validationError);
            
            // 에러 메시지 안전하게 추출
            const errorMessage = validationError instanceof Error ? validationError.message : String(validationError);
            
            // 네트워크 오류인 경우 토큰을 유효하다고 가정
            if (errorMessage.includes('네트워크') || 
                errorMessage.includes('Failed to fetch') ||
                errorMessage.includes('NetworkError')) {
              debugLog('🔄 네트워크 오류로 인한 검증 실패, 토큰 유효하다고 가정');
              isValid = true;
            } else {
              isValid = false;
            }
          }
          
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
              debugLog('토큰 갱신 성공:', {
                access: newTokens.access ? newTokens.access.substring(0, 20) + '...' : 'undefined',
                refresh: newTokens.refresh ? newTokens.refresh.substring(0, 20) + '...' : 'undefined'
              });
              
              // localStorage에 새 토큰 저장 (통일된 방식)
              if (typeof window !== 'undefined') {
                localStorage.setItem('authTokens', JSON.stringify(newTokens));
              }
              
              setAuthState({
                user,
                tokens: newTokens,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } catch (refreshError) {
              debugLog('🚨 토큰 갱신 실패:', refreshError);
              
              // 에러 메시지 안전하게 추출
              const errorMessage = refreshError instanceof Error ? refreshError.message : String(refreshError);
              
              // 네트워크 오류인 경우 토큰을 유지하고 재시도 가능하도록 함
              if (errorMessage.includes('네트워크') || 
                  errorMessage.includes('Failed to fetch') ||
                  errorMessage.includes('timeout') ||
                  errorMessage.includes('NetworkError')) {
                debugLog('🔄 네트워크 오류로 인한 갱신 실패, 토큰 유지');
                setAuthState((prev: AuthState) => ({ 
                  ...prev, 
                  isLoading: false,
                  error: '네트워크 연결을 확인해주세요. 토큰은 유지됩니다.'
                }));
                return;
              }
              
              // 토큰이 정말 만료된 경우에만 로그아웃
              debugLog('🚨 토큰 만료로 인한 갱신 실패, 로그아웃 처리');
              await logout();
            }
          }
        } catch (parseError) {
          debugLog('🚨 토큰/사용자 데이터 파싱 실패:', parseError);
          debugLog('🚨 파싱 실패한 데이터:', { tokensJson, userJson });
          
          // 파싱 실패가 정말 심각한 경우에만 삭제
          if (tokensJson && tokensJson !== 'null' && tokensJson !== 'undefined') {
            try {
              // 한 번 더 파싱 시도
              const testParse = JSON.parse(tokensJson);
              debugLog('🔄 재파싱 성공:', testParse);
              // 재파싱 성공하면 삭제하지 않음
              setAuthState((prev: AuthState) => ({ ...prev, isLoading: false }));
              return;
            } catch (reparseError) {
              debugLog('🚨 재파싱도 실패, 토큰 삭제:', reparseError);
            }
          }
          
          // 정말 파싱이 불가능한 경우에만 삭제
          localStorage.removeItem('authTokens');
          localStorage.removeItem('userData');
          setAuthState((prev: AuthState) => ({ ...prev, isLoading: false }));
        }
      } else if (tokensJson && !userJson) {
        // 토큰은 있으나 userData가 없는 경우 - 데이터 불일치로 간주하여 로그아웃 처리
        debugLog('userData 누락 → 데이터 불일치로 인한 로그아웃 처리');
        localStorage.removeItem('authTokens');
        localStorage.removeItem('userData');
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
          // localStorage에만 저장 (통일된 방식)
          localStorage.setItem('authTokens', JSON.stringify(response.tokens));
          localStorage.setItem('userData', JSON.stringify(userInfo));
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
    } catch (error) {
      debugLog('로그인 에러:', error);
      
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      // 에러 메시지 안전하게 추출
      const rawErrorMessage = error instanceof Error ? error.message : String(error);
      
      // 백엔드에서 오는 에러 메시지 처리
      if (rawErrorMessage) {
        try {
          // JSON 형태의 에러 메시지인 경우 파싱
          const errorData = JSON.parse(rawErrorMessage);
          if (errorData.errors) {
            // 필드별 에러 메시지 추출
            const errorMessages = Object.values(errorData.errors).flat();
            errorMessage = errorMessages.join(', ');
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // JSON 파싱 실패 시 원본 메시지 사용
          errorMessage = rawErrorMessage;
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
        // localStorage 정리 (통일된 방식)
        localStorage.removeItem('authTokens');
        localStorage.removeItem('userData');
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
        localStorage.removeItem('authTokens');
        localStorage.removeItem('userData');
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
        throw new Error('Cannot access localStorage on server side');
      }
      
      // localStorage에서 토큰 가져오기 (통일된 방식)
      const tokensJson = localStorage.getItem('authTokens');
      if (!tokensJson) {
        throw new Error('Tokens not found');
      }
      
      const tokens: Tokens = JSON.parse(tokensJson);
      if (!tokens.refresh) {
        throw new Error('Refresh token not found');
      }

      const newTokens = await authApi.refreshToken();
      
      // localStorage에 새 토큰 저장 (통일된 방식)
      localStorage.setItem('authTokens', JSON.stringify(newTokens));
      
      setAuthState((prev: AuthState) => ({
        ...prev,
        tokens: newTokens,
      }));
      return newTokens;
    } catch (error) {
      debugLog('토큰 갱신 실패:', error);
      
      // 에러 메시지 안전하게 추출
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // 네트워크 오류인 경우 토큰을 유지
      if (errorMessage.includes('네트워크') || 
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('NetworkError')) {
        debugLog('🔄 네트워크 오류로 인한 토큰 갱신 실패, 토큰 유지');
        throw new Error('네트워크 연결을 확인해주세요.');
      }
      
      // 토큰이 정말 만료된 경우에만 로그아웃
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
