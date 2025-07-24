import { LoginRequest, AuthResponse } from '@/types/auth';
import { apiClient } from './client';
import { debugLog } from '@/lib/config';
import { setCookie, deleteCookie } from '@/lib/utils/cookies';

/**
 * 인증 관련 API 함수 모음
 */
export const authApi = {
  /**
   * 로그인 API 호출 함수
   * @param credentials 로그인 정보 (사용자명, 비밀번호)
   * @returns 인증 응답 데이터
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    debugLog('로그인 시도:', { username: credentials.username });
    try {
      const response = await apiClient.post<AuthResponse>('/accounts/login/', credentials);
      
      // 로그인 성공 시 토큰 저장
      if (response.success && response.token) {
        // localStorage에 저장
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        // 쿠키에도 저장 (미들웨어에서 사용)
        setCookie('authToken', response.token, 7); // 7일 유효
        
        debugLog('토큰 저장 완료:', { token: response.token });
      }
      
      return response;
    } catch (error) {
      debugLog('로그인 실패:', error);
      throw error;
    }
  },

  /**
   * 로그아웃 API 호출 함수
   * @returns 로그아웃 결과
   */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    debugLog('로그아웃 시도');
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/accounts/logout/', {});
      
      // 로그아웃 성공 시 로컬 스토리지 및 쿠키 정리
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      deleteCookie('authToken');
      
      debugLog('로그아웃 성공: 토큰 삭제 완료');
      
      return response;
    } catch (error) {
      debugLog('로그아웃 실패:', error);
      
      // API 호출이 실패해도 로컬 스토리지 및 쿠키는 정리
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      deleteCookie('authToken');
      
      throw error;
    }
  },

  /**
   * 현재 사용자 정보 가져오기
   * @returns 사용자 정보
   */
  getCurrentUser: async () => {
    debugLog('사용자 정보 요청');
    try {
      return await apiClient.get('/accounts/user/');
    } catch (error) {
      debugLog('사용자 정보 요청 실패:', error);
      throw error;
    }
  },

  /**
   * 토큰 유효성 검증
   * @returns 토큰 유효성 결과
   */
  validateToken: async (): Promise<boolean> => {
    try {
      await apiClient.get('/accounts/validate-token/');
      return true;
    } catch (error) {
      debugLog('토큰 유효성 검증 실패:', error);
      return false;
    }
  }
};
