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
import { ArrowLeft, ArrowRight, CalendarIcon, Package, Clock, Ruler } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { updateQuantitySchedule } from '@/lib/api/manufacturing'
import { toast } from 'sonner'

export default function QuantitySchedulePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)  // ✅ 컴포넌트 내부로 이동
  const [formData, setFormData] = useState({
    sampleSize: "",
    totalQuantity: "",
    deliveryDate: undefined as Date | undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {  // ✅ async 추가
    e.preventDefault()
    setIsLoading(true)

    try {
      const manufacturingData = JSON.parse(localStorage.getItem("manufacturingData") || "{}")
      const productId = manufacturingData.productId

      // DB 저장 (productId가 있을 때만)
      if (productId) {
        const dbData = {
          size: formData.sampleSize.toUpperCase(),
          quantity: parseInt(formData.totalQuantity),
          due_date: formData.deliveryDate ? format(formData.deliveryDate, 'yyyy-MM-dd') : ''
        }
        
        await updateQuantitySchedule(productId, dbData)
        toast.success('수량 및 일정이 저장되었습니다.')
      }
      
      // 기존 localStorage 로직 유지
      localStorage.setItem(
        "manufacturingData",
        JSON.stringify({
          ...manufacturingData,  // ✅ 중복 제거
          step5: formData,
        }),
      )
      
      router.push("/manufacturing/final-notes")
    } catch (error) {
      console.error('저장 오류:', error)
      toast.error('저장에 실패했습니다.')
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

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전 단계
              </Button>
              <Button type="submit" disabled={!isFormValid}>
                다음 단계
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
