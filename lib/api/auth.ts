import { 
  LoginRequest, 
  AuthResponse, 
  LogoutRequest, 
  LogoutResponse, 
  UserInfoResponse,
  Tokens 
} from '@/types/auth';
import { apiClient } from './client';
import { debugLog } from '@/lib/config';
import { setCookie, deleteCookie } from '@/lib/utils/cookies';

/**
 * 인증 관련 API 함수 모음
 */
export const authApi = {
  /**
   * 로그인 API 호출 함수
   * @param credentials 로그인 정보 (user_id, password, user_type)
   * @returns 인증 응답 데이터
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    debugLog('로그인 시도:', { user_id: credentials.user_id, user_type: credentials.user_type });
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', credentials);
      
      // 로그인 성공 시 토큰 저장
      if (response.success && response.tokens) {
        // localStorage에 저장
        localStorage.setItem('authTokens', JSON.stringify(response.tokens));
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        // 쿠키에도 저장 (미들웨어에서 사용)
        setCookie('authToken', response.tokens.access, 7); // 7일 유효
        
        debugLog('토큰 저장 완료:', { 
          access: response.tokens.access.substring(0, 20) + '...', 
          refresh: response.tokens.refresh.substring(0, 20) + '...' 
        });
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
  logout: async (): Promise<LogoutResponse> => {
    debugLog('로그아웃 시도');
    try {
      const tokensJson = localStorage.getItem('authTokens');
      let refreshToken = '';
      
      if (tokensJson) {
        try {
          const tokens: Tokens = JSON.parse(tokensJson);
          refreshToken = tokens.refresh;
        } catch (error) {
          debugLog('토큰 파싱 오류:', error);
        }
      }

      const logoutData: LogoutRequest = { refresh: refreshToken };
      const response = await apiClient.post<LogoutResponse>('/accounts/logout/', logoutData);
      
      // 로그아웃 성공 시 로컬 스토리지 및 쿠키 정리
      localStorage.removeItem('authTokens');
      localStorage.removeItem('userData');
      deleteCookie('authToken');
      
      debugLog('로그아웃 성공: 토큰 삭제 완료');
      
      return response;
    } catch (error) {
      debugLog('로그아웃 실패:', error);
      
      // API 호출이 실패해도 로컬 스토리지 및 쿠키는 정리
      localStorage.removeItem('authTokens');
      localStorage.removeItem('userData');
      deleteCookie('authToken');
      
      throw error;
    }
  },

  /**
   * 현재 사용자 정보 가져오기
   * @returns 사용자 정보
   */
  getCurrentUser: async (): Promise<UserInfoResponse> => {
    debugLog('사용자 정보 요청');
    try {
      return await apiClient.get<UserInfoResponse>('/accounts/user_info/');
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
      const response = await apiClient.get<UserInfoResponse>('/accounts/user_info/');
      return response.success;
    } catch (error) {
      debugLog('토큰 유효성 검증 실패:', error);
      return false;
    }
  },

  /**
   * 액세스 토큰 갱신
   * @returns 새로운 토큰들
   */
  refreshToken: async (): Promise<Tokens> => {
    debugLog('토큰 갱신 시도');
    try {
      const tokensJson = localStorage.getItem('authTokens');
      if (!tokensJson) {
        throw new Error('저장된 토큰이 없습니다');
      }

      const tokens: Tokens = JSON.parse(tokensJson);
      const response = await apiClient.post<{ access: string; refresh: string }>('/auth/token/refresh/', {
        refresh: tokens.refresh
      });

      const newTokens: Tokens = {
        access: response.access,
        refresh: response.refresh
      };

      // 새로운 토큰 저장
      localStorage.setItem('authTokens', JSON.stringify(newTokens));
      setCookie('authToken', newTokens.access, 7);

      debugLog('토큰 갱신 성공');
      return newTokens;
    } catch (error) {
      debugLog('토큰 갱신 실패:', error);
      
      // 갱신 실패 시 모든 토큰 정리
      localStorage.removeItem('authTokens');
      localStorage.removeItem('userData');
      deleteCookie('authToken');
      
      throw error;
    }
  }
};
