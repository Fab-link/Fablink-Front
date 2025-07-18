"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, Download, FileText, Edit, Calendar, Package, Shirt } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export default function ManufacturingStep7() {
  const router = useRouter()
  const [orderData, setOrderData] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Load all manufacturing data
    const data = localStorage.getItem("manufacturingData")
    if (data) {
      setOrderData(JSON.parse(data))
    }
  }, [])

  const handleDownloadWorkOrder = async () => {
    setIsGenerating(true)

    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate work order content
    const workOrderContent = generateWorkOrderContent(orderData)

    // Create and download file
    const blob = new Blob([workOrderContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `작업지시서_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    setIsGenerating(false)
  }

  const generateWorkOrderContent = (data: any) => {
    const deliveryDate = data.step5?.deliveryDate ? new Date(data.step5.deliveryDate) : null

    return `
===========================================
           의류 제작 작업 지시서
===========================================

주문 번호: MFG-${Date.now().toString().slice(-8)}
작성일: ${format(new Date(), "PPP", { locale: ko })}

===========================================
1. 제품 기본 정보
===========================================
제품명: ${data.step1?.productName || ""}
시즌: ${data.step1?.season || ""}
타겟 고객층: ${data.step1?.targetCustomer || ""}
컨셉: ${data.step1?.concept || ""}

===========================================
2. 디자인 정보
===========================================
업로드된 파일 수: ${data.step2?.files || 0}개
포인트 부위 설명:
${data.step2?.pointDescription || ""}

===========================================
3. 재료 정보
===========================================
선택된 원단 코드: ${data.step4?.fabricCode || ""}
선택된 부자재 코드: ${data.step4?.accessoryCode || ""}

===========================================
4. 생산 정보
===========================================
샘플 사이즈: ${data.step5?.sampleSize?.toUpperCase() || ""}
총 생산 수량: ${data.step5?.totalQuantity || ""}개
납기일: ${deliveryDate ? format(deliveryDate, "PPP", { locale: ko }) : ""}

===========================================
5. 특별 참고사항
===========================================
${data.step6?.finalNotes || "특별한 요청사항 없음"}

===========================================
6. 작업 체크리스트
===========================================
□ 디자인 검토 완료
□ 원단 및 부자재 준비
□ 샘플 제작
□ 샘플 승인
□ 대량 생산 시작
□ 품질 검사
□ 포장 및 출고

===========================================
담당자: _______________
승인일: _______________
===========================================
    `
  }

  const handleBack = () => {
    router.push("/manufacturing/final-notes")
  }

  const handleNext = () => {
    router.push("/manufacturing/order")
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const deliveryDate = orderData.step5?.deliveryDate ? new Date(orderData.step5.deliveryDate) : null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">단계 7/8</span>
            <span className="text-sm text-gray-500">작업 지시서</span>
          </div>
          <Progress value={87.5} className="h-2" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">작업 지시서 확인</h1>
          <p className="text-gray-600">입력하신 정보를 바탕으로 작업 지시서를 생성했습니다</p>
        </div>

        <div className="space-y-6">
          {/* Work Order Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>작업 지시서 미리보기</span>
              </CardTitle>
              <CardDescription>제작팀에게 전달될 작업 지시서의 내용을 확인해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Shirt className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold">제품 기본 정보</h3>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/manufacturing")}>
                    <Edit className="h-3 w-3 mr-1" />
                    수정
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">제품명:</span>
                    <p className="font-medium">{orderData.step1?.productName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">시즌:</span>
                    <p className="font-medium">{orderData.step1?.season}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">타겟 고객층:</span>
                    <p className="font-medium">{orderData.step1?.targetCustomer}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-600">컨셉:</span>
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{orderData.step1?.concept}</p>
                </div>
              </div>

              <Separator />

              {/* Design Info */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold">디자인 정보</h3>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/manufacturing/design-upload")}>
                    <Edit className="h-3 w-3 mr-1" />
                    수정
                  </Button>
                </div>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-gray-600">업로드된 파일:</span>
                    <Badge variant="secondary" className="ml-2">
                      {orderData.step2?.files || 0}개
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">포인트 부위 설명:</span>
                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{orderData.step2?.pointDescription}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Material Info */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Package className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold">재료 정보</h3>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/manufacturing/material-selection")}>
                    <Edit className="h-3 w-3 mr-1" />
                    수정
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">원단 코드:</span>
                    <p className="font-medium font-mono">{orderData.step4?.fabricCode}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">부자재 코드:</span>
                    <p className="font-medium font-mono">{orderData.step4?.accessoryCode}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Production Info */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold">생산 정보</h3>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/manufacturing/quantity-schedule")}>
                    <Edit className="h-3 w-3 mr-1" />
                    수정
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">샘플 사이즈:</span>
                    <p className="font-medium">{orderData.step5?.sampleSize?.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">총 수량:</span>
                    <p className="font-medium">{orderData.step5?.totalQuantity}개</p>
                  </div>
                  <div>
                    <span className="text-gray-600">납기일:</span>
                    <p className="font-medium">{deliveryDate ? format(deliveryDate, "PPP", { locale: ko }) : ""}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Special Notes */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold">특별 참고사항</h3>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/manufacturing/final-notes")}>
                    <Edit className="h-3 w-3 mr-1" />
                    수정
                  </Button>
                </div>
                <div className="text-sm">
                  <p className="p-2 bg-gray-50 rounded">
                    {orderData.step6?.finalNotes || "특별한 요청사항이 없습니다."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">작업 지시서 다운로드</CardTitle>
              <CardDescription className="text-blue-700">
                작업 지시서를 다운로드하여 보관하거나 인쇄할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleDownloadWorkOrder} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    작업 지시서 다운로드
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전 단계
            </Button>
            <Button onClick={handleNext}>
              주문하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
