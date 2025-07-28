"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useAuthContext } from "@/contexts/AuthContext"
import { debugLog } from "@/lib/config"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Shirt, User, Factory, Contact } from "lucide-react"
import Link from "next/link"
import { resolve } from "path"
import { SelectTrigger } from "@radix-ui/react-select"

interface LoginFormProps {
  redirectPath?: string
}

export default function LoginPage({ redirectPath = '/dashboard' }: LoginFormProps) {
  const router = useRouter()
  const { login, error, isAuthenticated, user } = useAuthContext();

  const [ formData, setFormData ] = useState({
    id: "",
    password: "",
    userType: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<String | null>(null);
  const isFormValid = formData.id && formData.password && formData.userType

  // 진입시 인증 상태에 따라 경로 이동
  useEffect(() => {
    if (isAuthenticated && user) {
      debugLog('인증됨, 리디렉션:', {redirectPath})
      router.push(redirectPath)
    }
  }, [isAuthenticated, user, router, redirectPath])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.id || !formData.password || !formData.userType) {
      setErrorMessage('아이디, 비밀번호, 사용자 타입 모두 입력 해주세요.')
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage(null)

      debugLog('로그인 시도:', { id: formData.id, redirectPath })
      const response = await login(formData.id, formData.password)
      debugLog('로그인 응답:', response)
    } catch (error: any) {
      debugLog('로그인 에러:', error)
      setErrorMessage(error.message || '로그인에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">

        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
            <Shirt className="h-10 w-10 text-blue-600"/>
            <span className="text-2xl font-bold text-gray-900">FabLink</span>          
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">로그인</h2>
          <p className="mt-2 text-gray-600">계정에 로그인하여 서비스를 이용하세요</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>로그인 정보</CardTitle>
            <CardDescription>아이디, 비밀번호, 사용자 타입을 입력해주세요</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="id">아이디 *</Label>
                <Input
                  id="id"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id">비밀번호 *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">사용자 타입 *</Label>
                <Select 
                  value={formData.userType}
                  onValueChange={(value) => setFormData({ ...formData, userType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="사용자 타입을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="designer">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>디자이너</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="factory">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>공장</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={!isFormValid || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    로그인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>


            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )

}

// import React, { useEffect } from 'react';
// import LoginForm from '@/components/auth/LoginForm';
// import Link from 'next/link';
// import { useAuthContext } from '@/contexts/AuthContext';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { debugLog } from '@/lib/config';

// export default function LoginPage() {
//   const { isAuthenticated, user } = useAuthContext();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const fromPath = searchParams.get('from') || '/dashboard';

//   useEffect(() => {
//     debugLog('로그인 페이지 마운트:', { isAuthenticated, user, fromPath });
    
//     // 이미 로그인된 경우 원래 가려던 페이지로 리디렉션
//     if (isAuthenticated && user) {
//       debugLog('이미 로그인됨, 리디렉션:', { to: fromPath });
//       router.push(fromPath);
//     }
//   }, [isAuthenticated, user, router, fromPath]);

  
// }
