"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, FileText, Send } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ManufacturingStep6() {
  const router = useRouter()
  const [finalNotes, setFinalNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Store final data
    const existingData = JSON.parse(localStorage.getItem("manufacturingData") || "{}")
    const finalData = {
      ...existingData,
      step6: { finalNotes },
      submittedAt: new Date().toISOString(),
    }
    localStorage.setItem("manufacturingData", JSON.stringify(finalData))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Redirect to success page or dashboard
    router.push("/manufacturing/work-order")
  }

  const handleBack = () => {
    router.push("/manufacturing/quantity-schedule")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">단계 6/6</span>
            <span className="text-sm text-gray-500">최종 참고사항</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">최종 참고사항</h1>
          <p className="text-gray-600">추가로 전달하고 싶은 내용이나 특별한 요청사항을 작성해주세요</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Final Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>참고사항 및 특별 요청</span>
                </CardTitle>
                <CardDescription>
                  제작 과정에서 참고해야 할 사항이나 특별한 요청사항을 자유롭게 작성해주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="finalNotes">참고사항 (선택사항)</Label>
                  <Textarea
                    id="finalNotes"
                    placeholder="예시:&#10;- 소매 길이를 조금 더 길게 해주세요&#10;- 단추는 무광택으로 부탁드립니다&#10;- 라벨 부착 위치를 목 뒤쪽으로 해주세요&#10;- 포장 시 개별 비닐포장 희망합니다&#10;- 품질검사 시 특별히 확인해야 할 부분이 있다면 알려주세요"
                    value={finalNotes}
                    onChange={(e) => setFinalNotes(e.target.value)}
                    rows={8}
                  />
                  <p className="text-sm text-gray-500">
                    이 정보는 제작팀에게 전달되어 더 나은 제품을 만드는데 도움이 됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-900">
                  <CheckCircle className="h-5 w-5" />
                  <span>주문 완료 준비</span>
                </CardTitle>
                <CardDescription className="text-green-700">
                  모든 정보가 입력되었습니다. 제출하시면 담당자가 검토 후 연락드리겠습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-green-700 font-medium">예상 처리 시간:</span>
                      <p className="text-green-900">1-2 영업일 내 연락</p>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">다음 단계:</span>
                      <p className="text-green-900">견적서 및 계약서 발송</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <span className="text-green-700 font-medium">포함 서비스:</span>
                    <ul className="text-green-900 mt-1 space-y-1">
                      <li>• 무료 샘플 제작 (1벌)</li>
                      <li>• 품질검사 및 검수</li>
                      <li>• 포장 및 배송</li>
                      <li>• A/S 및 수선 서비스</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전 단계
              </Button>
              <Button type="submit" disabled={isSubmitting} className="px-8">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    제출 중...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    작업 지시서 확인
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
