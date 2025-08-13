"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, FileText, Edit, Calendar, Package, Shirt } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export default function ManufacturingStep7() {
  const router = useRouter()
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    // Load all manufacturing data
    const data = localStorage.getItem("manufacturingData")
    if (data) {
      setOrderData(JSON.parse(data))
    }
  }, [])


  // 다운로드 기능 제거로 관련 문자열 생성 함수도 제거되었습니다.

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
                    <p className="font-medium">{orderData.name || orderData.step1?.productName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">시즌:</span>
                    <p className="font-medium">{orderData.season || orderData.step1?.season}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">타겟 고객층:</span>
                    <p className="font-medium">{orderData.target_customer || orderData.step1?.targetCustomer}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-600">컨셉:</span>
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{orderData.concept || orderData.step1?.concept}</p>
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
                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{orderData.detail || orderData.step2?.pointDescription}</p>
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
            <p className="font-medium">{orderData.step4?.fabricCode}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">부자재 코드:</span>
            <p className="font-medium">{orderData.step4?.accessoryCode}</p>
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
                    <p className="font-medium">{(orderData.size || orderData.step5?.sampleSize)?.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">총 수량:</span>
                    <p className="font-medium">{orderData.quantity || orderData.step5?.totalQuantity}개</p>
                  </div>
                  <div>
                    <span className="text-gray-600">납기일:</span>
                    <p className="font-medium">{orderData.due_date ? format(new Date(orderData.due_date), "PPP", { locale: ko }) : (deliveryDate ? format(deliveryDate, "PPP", { locale: ko }) : "")}</p>
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
                    {orderData.memo || orderData.step6?.finalNotes || "특별한 요청사항이 없습니다."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 다운로드 섹션 제거 */}

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
