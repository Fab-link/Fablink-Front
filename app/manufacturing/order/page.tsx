"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Shield, CheckCircle, AlertCircle, Calculator } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export default function ManufacturingStep8() {
  const router = useRouter()
  const [orderData, setOrderData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    companyName: "",
    businessNumber: "",
    address: "",
    paymentMethod: "",
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  })

  // 버튼 텍스트를 "견적 요청"으로 변경하고 클릭 시 팝업 표시
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem("manufacturingData")
    if (data) {
      setOrderData(JSON.parse(data))
    }
  }, [])

  const calculatePricing = () => {
    const quantity = Number.parseInt(orderData?.step5?.totalQuantity || "0")
    const basePrice = 15000 // 기본 단가
    const totalPrice = quantity * basePrice
    const sampleFee = 0 // 무료 샘플
    const shippingFee = quantity >= 500 ? 0 : 50000 // 500개 이상 무료배송
    const tax = Math.floor(totalPrice * 0.1)
    const finalPrice = totalPrice + sampleFee + shippingFee + tax

    return {
      basePrice,
      quantity,
      totalPrice,
      sampleFee,
      shippingFee,
      tax,
      finalPrice,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      alert("필수 약관에 동의해주세요.")
      return
    }

    setIsSubmitting(true)

    // Store final order data
    const finalOrderData = {
      ...orderData,
      step8: {
        customerInfo: formData,
        pricing: calculatePricing(),
        orderedAt: new Date().toISOString(),
      },
    }

    localStorage.setItem("manufacturingData", JSON.stringify(finalOrderData))

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setShowSuccessPopup(true)
  }

  const handleBack = () => {
    router.push("/manufacturing/work-order")
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

  const pricing = calculatePricing()
  const deliveryDate = orderData.step5?.deliveryDate ? new Date(orderData.step5.deliveryDate) : null
  const isFormValid =
    formData.customerName &&
    formData.customerPhone &&
    formData.customerEmail &&
    formData.address &&
    formData.paymentMethod &&
    formData.agreeTerms &&
    formData.agreePrivacy

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">단계 8/8</span>
            <span className="text-sm text-gray-500">주문하기</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">주문 완료</h1>
          <p className="text-gray-600">고객 정보와 결제 방법을 입력하고 주문을 완료해주세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>고객 정보</CardTitle>
                  <CardDescription>주문자 정보를 정확히 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">이름 *</Label>
                      <Input
                        id="customerName"
                        placeholder="홍길동"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">연락처 *</Label>
                      <Input
                        id="customerPhone"
                        placeholder="010-1234-5678"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">이메일 *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">회사명 (선택)</Label>
                      <Input
                        id="companyName"
                        placeholder="(주)패션컴퍼니"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessNumber">사업자번호 (선택)</Label>
                      <Input
                        id="businessNumber"
                        placeholder="123-45-67890"
                        value={formData.businessNumber}
                        onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">배송 주소 *</Label>
                    <Input
                      id="address"
                      placeholder="서울시 강남구 테헤란로 123, 456호"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>결제 방법</span>
                  </CardTitle>
                  <CardDescription>결제 방법을 선택해주세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="결제 방법을 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank-transfer">무통장 입금</SelectItem>
                      <SelectItem value="card">신용카드</SelectItem>
                      <SelectItem value="corporate-card">법인카드</SelectItem>
                      <SelectItem value="installment">할부 결제</SelectItem>
                    </SelectContent>
                  </Select>

                  {formData.paymentMethod === "bank-transfer" && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">입금 계좌 정보</h4>
                      <p className="text-sm text-blue-800">
                        국민은행 123456-78-901234
                        <br />
                        예금주: (주)옷제작플랫폼
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Terms Agreement */}
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
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: !!checked })}
                    />
                    <Label htmlFor="agreeTerms" className="text-sm">
                      <span className="text-red-500">*</span> 서비스 이용약관에 동의합니다
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreePrivacy: !!checked })}
                    />
                    <Label htmlFor="agreePrivacy" className="text-sm">
                      <span className="text-red-500">*</span> 개인정보 처리방침에 동의합니다
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeMarketing"
                      checked={formData.agreeMarketing}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeMarketing: !!checked })}
                    />
                    <Label htmlFor="agreeMarketing" className="text-sm">
                      마케팅 정보 수신에 동의합니다 (선택)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Details */}
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
                    <span className="font-medium">{pricing.quantity}개</span>
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

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>결제 금액</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>제품 단가:</span>
                    <span>{pricing.basePrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>수량:</span>
                    <span>{pricing.quantity}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span>소계:</span>
                    <span>{pricing.totalPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>샘플 제작비:</span>
                    <span className="text-green-600">무료</span>
                  </div>
                  <div className="flex justify-between">
                    <span>배송비:</span>
                    <span className={pricing.shippingFee === 0 ? "text-green-600" : ""}>
                      {pricing.shippingFee === 0 ? "무료" : `${pricing.shippingFee.toLocaleString()}원`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>부가세 (10%):</span>
                    <span>{pricing.tax.toLocaleString()}원</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>총 결제금액:</span>
                  <span className="text-blue-600">{pricing.finalPrice.toLocaleString()}원</span>
                </div>

                {pricing.quantity >= 500 && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>500개 이상 주문으로 배송비 무료!</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">주문 전 확인사항</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 주문 후 변경/취소가 어려우니 신중히 검토해주세요</li>
                      <li>• 샘플 승인 후 대량 생산이 시작됩니다</li>
                      <li>• 납기일은 샘플 승인일 기준입니다</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-8">
          <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            이전 단계
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} size="lg" className="px-8">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                요청 처리 중...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {pricing.finalPrice.toLocaleString()}원 견적 요청
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
  showSuccessPopup && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">견적 요청이 완료되었습니다!</h3>
          <p className="text-gray-600 mb-6">담당자가 검토 후 연락드리겠습니다.</p>
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            메인 페이지로 이동
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
