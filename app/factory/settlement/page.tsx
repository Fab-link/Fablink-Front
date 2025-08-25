"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, DollarSign, Calendar, TrendingUp, Download } from "lucide-react"
import Link from "next/link"

export default function FactorySettlementPage() {
  const [settlements, setSettlements] = useState([
    {
      id: 1,
      orderId: "ORD-20240801-001",
      productName: "여성용 캐주얼 블라우스",
      designer: "김디자이너",
      quantity: 500,
  workPrice: 22000,
      totalAmount: 11000000,
      status: "completed",
      completedDate: "2024-08-15",
      settlementDate: "2024-08-20",
      paymentMethod: "bank_transfer"
    },
    {
      id: 2,
      orderId: "ORD-20240802-002",
      productName: "남성용 정장 셔츠",
      designer: "박디자이너",
      quantity: 300,
  workPrice: 25000,
      totalAmount: 7500000,
      status: "pending",
      completedDate: "2024-08-18",
      settlementDate: null,
      paymentMethod: "bank_transfer"
    },
    {
      id: 3,
      orderId: "ORD-20240803-003",
      productName: "아동용 원피스",
      designer: "이디자이너",
      quantity: 200,
  workPrice: 18000,
      totalAmount: 3600000,
      status: "processing",
      completedDate: "2024-08-19",
      settlementDate: null,
      paymentMethod: "bank_transfer"
    }
  ])

  const [summary, setSummary] = useState({
    totalRevenue: 22100000,
    pendingAmount: 11100000,
    completedAmount: 11000000,
    thisMonthRevenue: 15600000
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">정산 완료</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">정산 대기</Badge>
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">처리 중</Badge>
      case 'failed':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">정산 실패</Badge>
      default:
        return <Badge variant="secondary">알 수 없음</Badge>
    }
  }

  const handleDownloadInvoice = (settlementId: number) => {
    // 실제로는 PDF 다운로드 API 호출
    console.log(`Downloading invoice for settlement ${settlementId}`)
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
            <DollarSign className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">정산 관리</h1>
          </div>
          <p className="text-gray-600 mt-2">완료된 주문의 정산 내역을 확인하고 관리하세요</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalRevenue.toLocaleString()}원</div>
              <p className="text-xs text-muted-foreground">전체 누적 매출</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">정산 대기</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.pendingAmount.toLocaleString()}원</div>
              <p className="text-xs text-muted-foreground">정산 대기 중인 금액</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">정산 완료</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.completedAmount.toLocaleString()}원</div>
              <p className="text-xs text-muted-foreground">정산 완료된 금액</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.thisMonthRevenue.toLocaleString()}원</div>
              <p className="text-xs text-muted-foreground">8월 매출</p>
            </CardContent>
          </Card>
        </div>

        {/* Settlement List */}
        <div className="space-y-6">
          {settlements.map((settlement) => (
            <Card key={settlement.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{settlement.productName}</span>
                      {getStatusBadge(settlement.status)}
                    </CardTitle>
                    <CardDescription>
                      주문번호: {settlement.orderId} • 디자이너: {settlement.designer}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {settlement.totalAmount.toLocaleString()}원
                    </div>
                    <div className="text-sm text-gray-500">
                      단가: {settlement.workPrice.toLocaleString()}원
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">주문 정보</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>수량: {settlement.quantity}개</p>
                        <p>단가: {settlement.workPrice.toLocaleString()}원</p>
                        <p>총액: {settlement.totalAmount.toLocaleString()}원</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">완료 정보</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>완료일: {settlement.completedDate}</p>
                        <p>정산일: {settlement.settlementDate || '대기 중'}</p>
                        <p>결제 방식: 계좌 이체</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">정산 상태</h4>
                      <div className="space-y-2">
                        {getStatusBadge(settlement.status)}
                        {settlement.status === 'completed' && (
                          <div className="text-sm text-green-600">
                            ✓ {settlement.settlementDate}에 정산 완료
                          </div>
                        )}
                        {settlement.status === 'pending' && (
                          <div className="text-sm text-yellow-600">
                            ⏳ 정산 처리 중 (3-5일 소요)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      완료일: {settlement.completedDate}
                    </div>
                    <div className="space-x-2">
                      {settlement.status === 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadInvoice(settlement.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          세금계산서 다운로드
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        상세 보기
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {settlements.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>정산 내역이 없습니다.</p>
                <p className="text-sm">완료된 주문이 있으면 정산 내역이 여기에 표시됩니다.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Options */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            월별 정산 보고서 다운로드
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            연간 정산 보고서 다운로드
          </Button>
        </div>
      </div>
    </div>
  )
}