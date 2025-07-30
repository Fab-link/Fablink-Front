"use client"

import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, LogOut, RefreshCw } from 'lucide-react';

/**
 * 사용자 정보 표시 및 인증 관련 기능을 제공하는 컴포넌트
 */
export const UserInfo: React.FC = () => {
  const { 
    user, 
    tokens, 
    isAuthenticated, 
    isLoading, 
    error, 
    logout, 
    refreshAuth,
    refreshTokens 
  } = useAuthContext();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-2">로딩 중...</span>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="text-center p-6">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">로그인이 필요합니다.</p>
        </CardContent>
      </Card>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleRefreshAuth = async () => {
    try {
      await refreshAuth();
    } catch (error) {
      console.error('인증 정보 새로고침 실패:', error);
    }
  };

  const handleRefreshTokens = async () => {
    try {
      await refreshTokens();
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>사용자 정보</span>
        </CardTitle>
        <CardDescription>현재 로그인된 사용자의 정보입니다</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 사용자 기본 정보 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">사용자 ID:</span>
            <span className="text-gray-900">{user.user_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">이름:</span>
            <span className="text-gray-900">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">사용자 타입:</span>
            <span className="text-gray-900 capitalize">{user.user_type}</span>
          </div>
          {user.email && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">이메일:</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
          )}
        </div>

        {/* 토큰 정보 (개발용) */}
        {tokens && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium text-gray-700">토큰 정보 (개발용)</h4>
            <div className="text-xs text-gray-600 break-all">
              <div>
                <span className="font-medium">Access:</span>
                <div className="bg-gray-100 p-2 rounded mt-1">
                  {tokens.access.substring(0, 50)}...
                </div>
              </div>
              <div className="mt-2">
                <span className="font-medium">Refresh:</span>
                <div className="bg-gray-100 p-2 rounded mt-1">
                  {tokens.refresh.substring(0, 50)}...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex flex-col space-y-2 pt-4 border-t">
          <Button
            onClick={handleRefreshAuth}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            인증 정보 새로고침
          </Button>
          
          <Button
            onClick={handleRefreshTokens}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            토큰 갱신
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfo;
