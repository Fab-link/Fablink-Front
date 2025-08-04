"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calculator, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function FactoryQuotesPage() {
  const [quotes, setQuotes] = useState([
    {
      id: 1,
      quoteId: "QUO-20240801-001",
      productName: "여성용 캐주얼 블라우스",
      designer: "김디자이너",
      quantity: 500,
      status: "pending",
      requestDate: "2024-08-01",
      dueDate: "2024-08-05",
      materials: ["면 100%", "폴리에스터 혼방"],
      description: "여름용 가벼운 블라우스, 다양한 컬러 옵션 필요"
    },
    {
      id: 2,
      quoteId: "QUO-20240802-002",
      productName: "남성용 정장 셔츠",
      designer: "박디자이너", 
      quantity: 300,
      status: "responded",
      requestDate: "2024-08-02",
      dueDate: "2024-08-06",
      materials: ["면 100%"],
      description: "비즈니스용 정장 셔츠, 화이트/블루 컬러",
      quotedPrice: 25000,
      quotedDelivery: "2024-08-20"
    }
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">검토 중</Badge>
      case 'responded':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">견적 제출</Badge>
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">견적 승인</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">견적 거절</Badge>
      default:
        return <Badge variant="secondary">알 수 없음</Badge>
    }
  }

  const handleQuoteResponse = (quoteId: number, action: 'accept' | 'reject') => {
    // 실제로는 API 호출
    console.log(`Quote ${quoteId} ${action}ed`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                대시보드로 돌아가기
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">요청된 견적 확인</h1>
          </div>
          <p className="text-gray-600 mt-2">디자이너가 요청한 견적을 확인하고 응답하세요</p>
        </div>

        {/* Quotes List */}
        <div className="space-y-6">
          {quotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{quote.productName}</span>
                      {getStatusBadge(quote.status)}
                    </CardTitle>
                    <CardDescription>
                      견적번호: {quote.quoteId} • 디자이너: {quote.designer}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>응답 마감: {quote.dueDate}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">주문 정보</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>수량: {quote.quantity}개</p>
                        <p>요청일: {quote.requestDate}</p>
                        <p>소재: {quote.materials.join(", ")}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">제품 설명</h4>
                      <p className="text-sm text-gray-600">{quote.description}</p>
                    </div>
                  </div>

                  {quote.status === 'responded' && quote.quotedPrice && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">제출된 견적</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">단가:</span>
                          <span className="ml-2 font-medium">{quote.quotedPrice?.toLocaleString()}원</span>
                        </div>
                        <div>
                          <span className="text-blue-700">납기일:</span>
                          <span className="ml-2 font-medium">{quote.quotedDelivery}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      요청일: {quote.requestDate}
                    </div>
                    <div className="space-x-2">
                      {quote.status === 'pending' && (
                        <>
                          <Button size="sm">
                            견적 작성
                          </Button>
                          <Button variant="outline" size="sm">
                            상세 보기
                          </Button>
                        </>
                      )}
                      {quote.status === 'responded' && (
                        <Button variant="outline" size="sm">
                          견적 수정
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {quotes.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>요청된 견적이 없습니다.</p>
                <p className="text-sm">새로운 견적 요청이 들어오면 여기에 표시됩니다.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}