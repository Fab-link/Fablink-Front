"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shirt, User, Factory } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    userType: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login process
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Store user info
    localStorage.setItem(
      "userInfo",
      JSON.stringify({
        id: formData.id,
        userType: formData.userType,
        loginTime: new Date().toISOString(),
      }),
    )

    setIsLoading(false)

    // Redirect to main page
    router.push("/dashboard")
  }

  const isFormValid = formData.id && formData.password && formData.userType

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
            <Shirt className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">옷 제작 플랫폼</span>
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
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                        <Factory className="h-4 w-4" />
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

        {/* Demo Accounts */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 mb-3">데모 계정</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div>
                <p className="font-medium">디자이너 계정</p>
                <p>ID: designer / PW: 1234</p>
              </div>
              <div>
                <p className="font-medium">공장 계정</p>
                <p>ID: factory / PW: 1234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-500 text-sm">
            메인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
