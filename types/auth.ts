// 인증 관련 타입 정의

// JWT 토큰 타입
export interface Tokens {
  access: string;
  refresh: string;
}

// 사용자 정보 타입
export interface User {
  id: number;
  userId: string; // camelCase로 변경
  name: string;
  email?: string;
  userType: 'designer' | 'factory' | string; // camelCase로 변경
  contact?: string;
  address?: string;
  createdAt?: string; // camelCase로 변경
}

// 로그인 요청 타입
export interface LoginRequest {
  user_id: string;
  password: string;
  user_type?: 'designer' | 'factory' | string;
}

// 인증 응답 타입
export interface AuthResponse {
  success: boolean;
  message: string;
  tokens: Tokens;
  user: User;
}

// 로그아웃 요청 타입
export interface LogoutRequest {
  refresh: string;
}

// 로그아웃 응답 타입
export interface LogoutResponse {
  success: boolean;
  message: string;
}

// 사용자 정보 응답 타입
export interface UserInfoResponse {
  success: boolean;
  user: User;
}

// 인증 상태 타입
export interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
