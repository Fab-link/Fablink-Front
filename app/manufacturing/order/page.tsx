"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Shield, CheckCircle, AlertCircle, Calculator, Shirt } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { useAuthContext } from "@/contexts/AuthContext"
import { useManufacturingContext } from "@/contexts/ManufacturingContext"
import { manufacturingApi } from "@/lib/api/manufacturing"

export default function ManufacturingStep8() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { designFiles } = useManufacturingContext()
  const [orderData, setOrderData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    companyName: "",
    businessNumber: "",
    address: "",
    paymentMethod: "",
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
    useMemberInfo: false,
  })

  useEffect(() => {
    const data = localStorage.getItem("manufacturingData")
    if (data) {
      setOrderData(JSON.parse(data))
    }
  }, [])

  const orderSummary = useMemo(() => {
    if (!orderData?.step5?.totalQuantity) return null
    
    const quantity = Number.parseInt(orderData.step5.totalQuantity)

    return {
      quantity,
    }
  }, [orderData?.step5?.totalQuantity])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      alert("필수 약관에 동의해주세요.")
      return
    }

    if (!orderSummary) {
      alert("주문 정보를 불러올 수 없습니다.")
      return
    }

  setIsSubmitting(true)

    try {
      const finalOrderData = {
        ...orderData,
        step8: {
          customerInfo: formData,
          orderedAt: new Date().toISOString(),
          orderId: `temp-${Date.now()}`
        },
      }
      localStorage.setItem("manufacturingData", JSON.stringify(finalOrderData))

      // 단일 제출 API 호출(FormData 구성)
      const data = finalOrderData
      const fd = new FormData()
      fd.append('name', data.name || data.step1?.productName || '')
      fd.append('season', data.season || data.step1?.season || '')
  const targetCode = data.target_customer_code || data.step1?.targetCustomerCode || data.target_customer
  fd.append('target', targetCode || '')
      fd.append('concept', data.concept || data.step1?.concept || '')
      if (data.detail) fd.append('detail', data.detail)
      if (data.size || data.step5?.sampleSize) fd.append('size', (data.size || data.step5?.sampleSize))
      const qty = (data.quantity || data.step5?.totalQuantity)
      if (qty) fd.append('quantity', String(qty))
      if (data.step4?.fabricCode) fd.append('fabric_code', data.step4.fabricCode)
      if (data.step4?.accessoryCode) fd.append('material_code', data.step4.accessoryCode)
      if (data.due_date) fd.append('due_date', data.due_date)
      if (data.memo || data.step6?.finalNotes) fd.append('memo', data.memo || data.step6.finalNotes)
      // 파일: 첫 번째 디자인 파일만 image_path로 업로드
      if (designFiles && designFiles.length > 0) {
        fd.append('image_path', designFiles[0])
      }

      try {
        const resp: any = await manufacturingApi.submitManufacturing(fd)
        const serverOrderId = resp.order_id ?? resp.orderId
        const withIds = {
          ...finalOrderData,
          productId: resp.product_id || finalOrderData.productId,
          // 양쪽 표기 모두 저장해 성공 페이지/기타 화면 호환
          orderId: serverOrderId || finalOrderData.step8?.orderId,
          order_id: serverOrderId || finalOrderData.step8?.orderId,
          requestOrderId: resp.request_order_id,
        }
        localStorage.setItem('manufacturingData', JSON.stringify(withIds))
        router.push("/manufacturing/success")
      } catch (err) {
        console.error('제출 API 오류:', err)
        alert('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

    } catch (error) {
      console.error('주문 처리 오류:', error)
      alert('주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, orderSummary, orderData, router, designFiles])

  const handleBack = useCallback(() => {
    router.push("/manufacturing/work-order")
  }, [router])

  const deliveryDate = useMemo(() => 
    orderData?.step5?.deliveryDate ? new Date(orderData.step5.deliveryDate) : null,
    [orderData?.step5?.deliveryDate]
  )

  const isFormValid = useMemo(() =>
    formData.customerName &&
    formData.customerPhone &&
    formData.address &&

    formData.agreeTerms &&
    formData.agreePrivacy,
    [formData]
  )

  if (!orderData || !orderSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
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
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">단계 8/8</span>
            <span className="text-sm text-gray-500">주문하기</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">제조 요청 완료</h1>
          <p className="text-gray-600">고객 정보를 입력하고 제조 요청을 완료해주세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>고객 정보</CardTitle>
                      <CardDescription>주문자 정보를 정확히 입력해주세요</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useMemberInfo"
                        checked={formData.useMemberInfo}
                        onCheckedChange={(checked) => {
                          const isChecked = !!checked
                          setFormData(prev => ({ 
                            ...prev, 
                            useMemberInfo: isChecked,
                            ...(isChecked && user ? {
                              customerName: user.name || "",
                              customerPhone: user.contact || "",
                              address: user.address || ""
                            } : {})
                          }))
                        }}
                      />
                      <Label htmlFor="useMemberInfo" className="text-sm font-medium">
                        회원정보와 동일함
                      </Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">이름 *</Label>
                      <Input
                        id="customerName"
                        placeholder="홍길동"
                        value={formData.customerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">연락처 *</Label>
                      <Input
                        id="customerPhone"
                        placeholder="010-1234-5678"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">회사명 (선택)</Label>
                      <Input
                        id="companyName"
                        placeholder="(주)패션컴퍼니"
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessNumber">사업자번호 (선택)</Label>
                      <Input
                        id="businessNumber"
                        placeholder="123-45-67890"
                        value={formData.businessNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessNumber: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">배송 주소 *</Label>
                    <Input
                      id="address"
                      placeholder="서울시 강남구 테헤란로 123, 456호"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  </div>
                </CardContent>
              </Card>



              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>약관 동의</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeTerms: !!checked }))}
                    />
                    <Label htmlFor="agreeTerms" className="text-sm">
                      <span className="text-red-500">*</span> 서비스 이용약관에 동의합니다
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreePrivacy: !!checked }))}
                    />
                    <Label htmlFor="agreePrivacy" className="text-sm">
                      <span className="text-red-500">*</span> 개인정보 처리방침에 동의합니다
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeMarketing"
                      checked={formData.agreeMarketing}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeMarketing: !!checked }))}
                    />
                    <Label htmlFor="agreeMarketing" className="text-sm">
                      마케팅 정보 수신에 동의합니다 (선택)
                    </Label>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={!isFormValid || isSubmitting} size="lg" className="px-8">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      요청 처리 중...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      제조 요청 완료
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>주문 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">제품명:</span>
                    <span className="font-medium">{orderData.step1?.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수량:</span>
                    <span className="font-medium">{orderSummary.quantity}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">샘플 사이즈:</span>
                    <span className="font-medium">{orderData.step5?.sampleSize?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">납기일:</span>
                    <span className="font-medium">
                      {deliveryDate ? format(deliveryDate, "PPP", { locale: ko }) : ""}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>제조 요청 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>요청 수량:</span>
                    <span>{orderSummary.quantity}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span>진행 방식:</span>
                    <span>공장 입찰</span>
                  </div>
                </div>

                <Separator />

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>입찰 방식:</strong> 공장들이 견적을 제출하면 가격을 비교하여 선택할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">제조 요청 전 확인사항</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 요청 후 공장들이 견적을 제출합니다</li>
                      <li>• 견적을 비교하여 최적의 공장을 선택할 수 있습니다</li>
                      <li>• 가격은 공장 입찰을 통해 결정됩니다</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-start pt-8">
          <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            이전 단계
          </Button>
        </div>
      </div>
    </div>
  )
}