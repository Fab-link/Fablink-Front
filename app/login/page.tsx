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
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import { Shirt, User, Factory, Contact } from "lucide-react"
import Link from "next/link"

interface LoginFormProps {
  redirectPath?: string
}

export default function LoginPage({ redirectPath = '/dashboard' }: LoginFormProps) {
  const router = useRouter()
  const { login, error, isAuthenticated, user, clearError } = useAuthContext();

  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
    user_type: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isFormValid = formData.user_id && formData.password && formData.user_type

  // 진입시 인증 상태에 따라 경로 이동
  useEffect(() => {
    if (isAuthenticated && user) {
      debugLog('인증됨, 리디렉션:', {redirectPath})
      router.push(redirectPath)
    }
  }, [isAuthenticated, user, router, redirectPath])

  // 인증 에러 상태 동기화
  useEffect(() => {
    if (error) {
      setErrorMessage(error)
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.user_id || !formData.password || !formData.user_type) {
      setErrorMessage('사용자 ID, 비밀번호, 사용자 타입을 모두 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage(null)
      clearError() // 이전 에러 초기화

      debugLog('로그인 시도:', { user_id: formData.user_id, user_type: formData.user_type, redirectPath })
      
      const response = await login(formData.user_id, formData.password, formData.user_type)
      
      debugLog('로그인 성공:', response)
      
      // 로그인 성공 시 리디렉션은 useEffect에서 처리됨
    } catch (error: any) {
      debugLog('로그인 에러:', error)
      
      let errorMsg = '로그인에 실패했습니다. 다시 시도해주세요.'
      
      // 백엔드에서 오는 구체적인 에러 메시지 처리
      if (error.message) {
        if (error.message.includes('user_id')) {
          errorMsg = '존재하지 않는 사용자 ID입니다.'
        } else if (error.message.includes('password')) {
          errorMsg = '비밀번호가 올바르지 않습니다.'
        } else if (error.message.includes('user_type')) {
          errorMsg = '사용자 타입이 일치하지 않습니다.'
        } else {
          errorMsg = error.message
        }
      }
      
      setErrorMessage(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // 입력 시 에러 메시지 초기화
    if (errorMessage) {
      setErrorMessage(null)
      clearError()
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
            <CardDescription>사용자 ID, 비밀번호, 사용자 타입을 입력해주세요</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 에러 메시지 표시 */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2">
                {/* 사용자 ID 입력란 */}
                <Label htmlFor="user_id">사용자 ID *</Label>
                <Input
                  id="user_id"
                  type="text"
                  placeholder="사용자 ID를 입력하세요"
                  value={formData.user_id}
                  onChange={(e) => handleInputChange('user_id', e.target.value)}
                  required
                />
              </div>
              
              {/* 비밀번호 입력란 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>
              
              {/* 사용자 타입 입력란 */}
              <div className="space-y-2">
                <Label htmlFor="user_type">사용자 타입 *</Label>
                <Select
                  value={formData.user_type}
                  onValueChange={(value) => handleInputChange('user_type', value)}
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
                        <Factory className="h-4 w-4" />
                        <span>공장</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* 로그인 버튼 */}
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

              {/* 추가 링크 */}
              <div className="text-center text-sm text-gray-600">
                <p>
                  계정이 없으신가요?{' '}
                  <Link href="/register" className="text-blue-600 hover:text-blue-500">
                    회원가입
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

