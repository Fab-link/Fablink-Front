// 인증 관련 타입 정의

// 사용자 정보 타입
export interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'designer' | 'manufacturer' | 'user' | string;
  date_joined: string;
}

// 로그인 요청 타입
export interface LoginRequest {
  username: string;
  password: string;
}

// 인증 응답 타입
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// 인증 상태 타입
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
