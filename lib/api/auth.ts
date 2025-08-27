import { 
  LoginRequest, 
  AuthResponse, 
  LogoutRequest, 
  LogoutResponse, 
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
      // 사용자 타입에 따라 다른 엔드포인트 사용
      const endpoint = credentials.user_type === 'factory' 
        ? '/accounts/factory/login/' 
        : '/accounts/designer/login/';
      
      const response = await apiClient.post<AuthResponse>(endpoint, {
        user_id: credentials.user_id,
        password: credentials.password
      }, true); // skipAuth = true로 설정
      
      // 로그인 성공 시 토큰 저장
      if (response.success && response.tokens) {
        debugLog('백엔드 응답 전체:', response);
        
        // 사용자 데이터 추출 (camelCase 변환된 필드명 사용)
        const userData = response.userType === 'designer' ? response.designer : response.factory;
        
        debugLog('추출된 사용자 데이터:', { userType: response.userType, userData });
        
        if (!userData) {
          debugLog('사용자 데이터 없음:', { response });
          throw new Error('사용자 데이터를 찾을 수 없습니다.');
        }
        
        const userInfo = {
          id: userData.id,
          userId: userData.userId,
          name: userData.name,
          userType: response.userType,
          contact: userData.contact || '',
          address: userData.address || ''
        };
        
        // localStorage에 저장
        localStorage.setItem('authTokens', JSON.stringify(response.tokens));
        localStorage.setItem('userData', JSON.stringify(userInfo));
        
        // 쿠키에도 저장 (미들웨어에서 사용)
        setCookie('authToken', response.tokens.access, 7); // 7일 유효
        
        debugLog('토큰 저장 완료:', { 
          access: response.tokens.access.substring(0, 20) + '...', 
          refresh: response.tokens.refresh.substring(0, 20) + '...',
          userInfo
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
   * 토큰 유효성 검증 (로컬 스토리지 기반)
   * @returns 토큰 유효성 결과
   */
  validateToken: async (): Promise<boolean> => {
    try {
      const tokensJson = localStorage.getItem('authTokens');
      const userData = localStorage.getItem('userData');
      
      // 로컬 스토리지에 토큰과 사용자 데이터가 있는지 확인
      if (!tokensJson || !userData) {
        return false;
      }
      
      const tokens: Tokens = JSON.parse(tokensJson);
      return !!(tokens.access && tokens.refresh);
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
      // localStorage에서 토큰 가져오기 (통일된 방식)
      const tokensJson = localStorage.getItem('authTokens');
      if (!tokensJson) {
        throw new Error('저장된 토큰이 없습니다');
      }

      const tokens: Tokens = JSON.parse(tokensJson);
      if (!tokens.refresh) {
        throw new Error('Refresh 토큰이 없습니다');
      }

      debugLog('토큰 갱신 요청:', { refresh: tokens.refresh.substring(0, 20) + '...' });

      const response = await apiClient.post<any>('/accounts/token/refresh/', {
        refresh: tokens.refresh
      }, true); // skipAuth = true

      debugLog('토큰 갱신 응답 전체:', response);

      // 응답 구조 확인 및 새 토큰 추출
      let newTokens: Tokens;
      
      if (response.success && response.tokens) {
        // 성공 응답에서 토큰 추출
        newTokens = {
          access: response.tokens.access,
          refresh: response.tokens.refresh
        };
      } else if (response.access && response.refresh) {
        // 직접 토큰이 응답에 있는 경우
        newTokens = {
          access: response.access,
          refresh: response.refresh
        };
      } else if (response.tokens && response.tokens.access && response.tokens.refresh) {
        // 중첩된 tokens 객체에서 추출
        newTokens = {
          access: response.tokens.access,
          refresh: response.tokens.refresh
        };
      } else {
        debugLog('토큰 갱신 응답 구조 오류:', response);
        throw new Error('토큰 갱신 응답 형식이 올바르지 않습니다');
      }

      // 토큰 유효성 검증
      if (!newTokens.access || !newTokens.refresh) {
        debugLog('토큰 갱신 결과 검증 실패:', newTokens);
        throw new Error('갱신된 토큰이 유효하지 않습니다');
      }

      // localStorage에 새로운 토큰 저장 (통일된 방식)
      localStorage.setItem('authTokens', JSON.stringify(newTokens));
      setCookie('authToken', newTokens.access, 7);

      debugLog('토큰 갱신 성공:', {
        access: newTokens.access.substring(0, 20) + '...',
        refresh: newTokens.refresh.substring(0, 20) + '...'
      });
      
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
