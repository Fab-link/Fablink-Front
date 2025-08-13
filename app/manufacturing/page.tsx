"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Shirt } from "lucide-react"
import { useRouter } from "next/navigation"

// Per-step DB 호출을 중단하고 localStorage에만 저장합니다.

export default function ManufacturingStep1() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    season: "",
    target_customer: "",
    concept: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const TARGET_LABELS: Record<string, string> = {
    teens: '10대',
    twenties: '20대',
    thirties: '30대',
    forties: '40대',
    'fifties-plus': '50대 이상',
    'all-ages': '전 연령',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      console.log('Saving step1 to localStorage:', formData)
      // 임시 productId 생성(최종 제출 시 서버에서 실제 ID 생성 예정)
      const existing = JSON.parse(localStorage.getItem("manufacturingData") || "{}")
      const productId = existing.productId || Date.now()
      const targetLabel = TARGET_LABELS[formData.target_customer] || formData.target_customer
      const manufacturingData = {
        productId,
        name: formData.name,
        season: formData.season,
        target_customer: targetLabel, // 한글 라벨 저장
        target_customer_code: formData.target_customer, // 코드 병행 저장(제출용)
        concept: formData.concept,
        step1: {
          productName: formData.name,
          season: formData.season,
          targetCustomer: targetLabel,
          targetCustomerCode: formData.target_customer,
          concept: formData.concept,
        }
      }
      
      localStorage.setItem("manufacturingData", JSON.stringify(manufacturingData))
      console.log('Saved to localStorage:', manufacturingData)
      
      router.push("/manufacturing/design-upload")
    } catch (error) {
      console.error('Submit error:', error)
      setErrorMessage(`제품 정보 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.name && formData.season && formData.target_customer && formData.concept

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
            <span className="text-sm font-medium text-gray-600">단계 1/6</span>
            <span className="text-sm text-gray-500">제품 정보 입력</span>
          </div>
          <Progress value={16.67} className="h-2" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shirt className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">제품 정보 입력</h1>
          <p className="text-gray-600">제작하실 의류의 기본 정보를 입력해주세요</p>
        </div>

        {/* Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>정확한 정보를 입력하시면 더 나은 제작 서비스를 제공할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="productName">제품명 *</Label>
                <Input
                  id="productName"
                  placeholder="예: 여성용 캐주얼 블라우스"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="season">시즌 *</Label>
                <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="시즌을 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spring">봄 (Spring)</SelectItem>
                    <SelectItem value="summer">여름 (Summer)</SelectItem>
                    <SelectItem value="autumn">가을 (Fall)</SelectItem>
                    <SelectItem value="winter">겨울 (Winter)</SelectItem>
                    <SelectItem value="all-season">사계절 (All Season)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetCustomer">타겟 고객층 *</Label>
                <Select
                  value={formData.target_customer}
                  onValueChange={(value) => setFormData({ ...formData, target_customer: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="타겟 고객층을 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teens">10대 (Teens)</SelectItem>
                    <SelectItem value="twenties">20대 (Twenties)</SelectItem>
                    <SelectItem value="thirties">30대 (Thirties)</SelectItem>
                    <SelectItem value="forties">40대 (Forties)</SelectItem>
                    <SelectItem value="fifties-plus">50대 이상 (50+)</SelectItem>
                    <SelectItem value="all-ages">전 연령 (All Ages)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="concept">컨셉 설명 *</Label>
                <Textarea
                  id="concept"
                  placeholder="제품의 컨셉, 스타일, 특징 등을 자세히 설명해주세요&#10;예: 직장인을 위한 세미 포멀 스타일의 블라우스로, 편안한 착용감과 우아한 실루엣을 강조한 디자인"
                  value={formData.concept}
                  onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{errorMessage}</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={!isFormValid || isLoading} className="px-8">
                  {isLoading ? '저장 중...' : '다음 단계'}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
