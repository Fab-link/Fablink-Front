"use client"

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, AuthState } from '@/types/auth';

// 인증 컨텍스트 타입
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 인증 컨텍스트 제공자 props 타입
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 인증 컨텍스트 제공자 컴포넌트
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

/**
 * 인증 컨텍스트 사용 훅
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext는 AuthProvider 내에서 사용해야 합니다');
  }
  return context;
};
