"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, Home, MessageCircle, Calendar, FileText, Shirt } from "lucide-react"
import { useRouter } from "next/navigation"
import { downloadWorksheetExcel } from "@/lib/pdfGenerator"

export default function ManufacturingSuccess() {
  const router = useRouter()

  const handleDownloadSummary = () => {
    // Generate and download order summary
    const data = localStorage.getItem("manufacturingData")
    if (data) {
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "manufacturing-order-summary.json"
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleDownloadWorksheet = () => {
    const data = localStorage.getItem("manufacturingData")
    if (data) {
      const manufacturingData = JSON.parse(data)
      console.log('localStorage 데이터:', manufacturingData)
      console.log('compositeImageUrl:', manufacturingData.compositeImageUrl)
      
      // 작업지시서 데이터 구성
      const worksheetData = {
        productName: manufacturingData.name || '제품명',
        season: manufacturingData.season || '',
        target: manufacturingData.target_customer || '',
        concept: manufacturingData.concept || '',
        detail: manufacturingData.detail || '',
        quantity: manufacturingData.quantity || 0,
        size: (manufacturingData.size || 'M').toUpperCase(),
        garmentType: 'tshirt',
        fabric: manufacturingData.step4?.fabricCode || '',
        material: manufacturingData.step4?.accessoryCode || '',
        dueDate: manufacturingData.due_date || new Date().toLocaleDateString('ko-KR'),
        memo: manufacturingData.memo || '',
        compositeImageUrl: manufacturingData.compositeImageUrl || '',
        contact: manufacturingData.designerContact || '010-0000-0000'
      }
      
      console.log('워크시트 데이터:', worksheetData)
      downloadWorksheetExcel(worksheetData)
    }
  }

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
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">주문이 성공적으로 제출되었습니다!</h1>
          <p className="text-gray-600">담당자가 검토 후 1-2 영업일 내에 연락드리겠습니다.</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Number */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-blue-600 mb-1">주문 번호</p>
                <p className="text-2xl font-bold text-blue-900">MFG-{Date.now().toString().slice(-8)}</p>
                <p className="text-sm text-blue-600 mt-2">이 번호로 주문 상태를 확인하실 수 있습니다.</p>
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">주문 완료 시간</p>
                  <p className="text-sm font-medium">{new Date().toLocaleString("ko-KR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>주문 상세 정보</CardTitle>
              <CardDescription>완료된 주문의 상세 내용입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">제품명:</span>
                  <p className="font-medium">여성용 캐주얼 블라우스</p>
                </div>
                <div>
                  <span className="text-gray-600">주문 수량:</span>
                  <p className="font-medium">500개</p>
                </div>
                <div>
                  <span className="text-gray-600">예상 납기:</span>
                  <p className="font-medium">2024년 2월 15일</p>
                </div>
                <div>
                  <span className="text-gray-600">결제 금액:</span>
                  <p className="font-medium text-blue-600">8,250,000원</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>다음 단계</CardTitle>
              <CardDescription>주문 처리 과정을 안내해드립니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">주문 검토 및 견적</h4>
                    <p className="text-sm text-gray-600">담당자가 주문 내용을 검토하고 정확한 견적을 산출합니다.</p>
                    <p className="text-xs text-gray-500 mt-1">예상 소요시간: 1-2 영업일</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">계약 및 선금</h4>
                    <p className="text-sm text-gray-600">견적 확인 후 계약서 작성 및 선금 결제를 진행합니다.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">샘플 제작</h4>
                    <p className="text-sm text-gray-600">무료 샘플을 제작하여 품질과 디자인을 확인합니다.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">대량 생산</h4>
                    <p className="text-sm text-gray-600">샘플 승인 후 대량 생산을 시작합니다.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>연락처 정보</CardTitle>
              <CardDescription>문의사항이 있으시면 언제든 연락해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">고객센터</p>
                    <p className="text-sm text-gray-600">1588-1234</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">운영시간</p>
                    <p className="text-sm text-gray-600">평일 09:00-18:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button onClick={handleDownloadWorksheet} className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              작업지시서 다운로드
            </Button>
            <Button onClick={handleDownloadSummary} variant="outline" className="flex-1 bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              주문 요약서 다운로드
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
