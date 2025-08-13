"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, ArrowRight, CalendarIcon, Package, Clock, Ruler, Shirt } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

// 이 단계에서는 서버 업데이트 없이 localStorage만 갱신합니다.

export default function ManufacturingStep5() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    sampleSize: "",
    totalQuantity: "",
    deliveryDate: undefined as Date | undefined,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const manufacturingData = JSON.parse(localStorage.getItem("manufacturingData") || "{}")
      const productId = manufacturingData.productId

      if (!productId) {
        setErrorMessage("제품 ID를 찾을 수 없습니다. 이전 단계로 돌아가 다시 시도해주세요.")
        setIsLoading(false)
        return
      }

      // 날짜를 YYYY-MM-DD 형식으로 변환
      const dueDate = formData.deliveryDate ? format(formData.deliveryDate, 'yyyy-MM-dd') : null

  // localStorage에 저장
      const updatedData = {
        ...manufacturingData,
        size: formData.sampleSize,
        quantity: formData.totalQuantity,
        due_date: dueDate,
        step5: formData
      }
      localStorage.setItem("manufacturingData", JSON.stringify(updatedData))

      router.push("/manufacturing/final-notes")
    } catch (error) {
      console.error('Submit error:', error)
      setErrorMessage(`데이터 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/manufacturing/material-selection")
  }

  const isFormValid = formData.sampleSize && formData.totalQuantity && formData.deliveryDate

  // 최소 납기일 (오늘로부터 14일 후)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 14)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Logo */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-black hover:text-gray-700 transition-colors"
          >
            <Shirt className="h-8 w-8" />
            <span className="text-2xl font-bold">Fablink</span>
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">단계 5/6</span>
            <span className="text-sm text-gray-500">수량 및 일정</span>
          </div>
          <Progress value={83.33} className="h-2" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">수량 및 일정 설정</h1>
          <p className="text-gray-600">샘플 사이즈, 총 수량, 납기일을 설정해주세요</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sample Size */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ruler className="h-5 w-5" />
                  <span>샘플 사이즈</span>
                </CardTitle>
                <CardDescription>샘플 제작을 위한 사이즈를 선택해주세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="sampleSize">샘플 사이즈 *</Label>
                  <Select
                    value={formData.sampleSize}
                    onValueChange={(value) => setFormData({ ...formData, sampleSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="샘플 사이즈를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xs">XS</SelectItem>
                      <SelectItem value="s">S</SelectItem>
                      <SelectItem value="m">M</SelectItem>
                      <SelectItem value="l">L</SelectItem>
                      <SelectItem value="xl">XL</SelectItem>
                      <SelectItem value="xxl">XXL</SelectItem>
                      <SelectItem value="free">Free Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Total Quantity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>총 수량</span>
                </CardTitle>
                <CardDescription>제작하실 총 수량을 입력해주세요 (최소 100개)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="totalQuantity">총 수량 *</Label>
                  <Input
                    id="totalQuantity"
                    type="number"
                    min="100"
                    placeholder="예: 500"
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: e.target.value })}
                    required
                  />
                  <p className="text-sm text-gray-500">최소 주문 수량: 100개</p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Date */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>납기일</span>
                </CardTitle>
                <CardDescription>제품 완성 희망 날짜를 선택해주세요 (최소 2주 소요)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>납기일 *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deliveryDate ? (
                          format(formData.deliveryDate, "PPP", { locale: ko })
                        ) : (
                          <span>날짜를 선택해주세요</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.deliveryDate}
                        onSelect={(date) => setFormData({ ...formData, deliveryDate: date })}
                        disabled={(date) => date < minDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-gray-500">최소 납기일: {format(minDate, "PPP", { locale: ko })}</p>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            {isFormValid && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">주문 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">샘플 사이즈:</span>
                      <span className="font-medium text-blue-900">{formData.sampleSize.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">총 수량:</span>
                      <span className="font-medium text-blue-900">{formData.totalQuantity}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">납기일:</span>
                      <span className="font-medium text-blue-900">
                        {formData.deliveryDate && format(formData.deliveryDate, "PPP", { locale: ko })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전 단계
              </Button>
              <Button type="submit" disabled={!isFormValid || isLoading}>
                {isLoading ? '저장 중...' : '다음 단계'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
