"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  Truck,
  MessageSquare,
  Factory,
  FileText,
  Phone,
  MapPin,
  AwardIcon as Won,
  Eye,
  Edit,
  Check,
<<<<<<< Updated upstream
  XCircle,
  Shirt
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { manufacturingApi, FactoryBidData } from "@/lib/api/manufacturing"
import { useAuthContext } from "@/contexts/AuthContext"

// 입찰 업체 표시 컴포넌트
function BidsDisplay({ order, onSelectBid }: { order: any, onSelectBid: (bidId: number) => void }) {
  const [bids, setBids] = useState<FactoryBidData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBids = async () => {
      if (!order) return
      
      try {
        const response = await manufacturingApi.getBidsByOrder(order.id)
        setBids(response || [])
      } catch (error) {
        console.error('입찰 목록 로딩 실패:', error)
        setBids([])
      } finally {
        setLoading(false)
      }
    }

    fetchBids()
  }, [order])

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">입찰 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Factory className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">현재 입찰 가능한 업체가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bids.map((bid) => (
        <Card key={bid.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Factory className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h5 className="font-medium text-sm">{bid.factory_info?.name || '공장명 없음'}</h5>
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-2.5 w-2.5" />
                      <span>{bid.factory_info?.phone || '연락처 없음'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{bid.estimated_delivery_days}일</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 font-medium mb-1">
                  <Won className="h-3 w-3" />
                  <span className="text-sm">{bid.unit_price?.toLocaleString() || '0'}원</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  총액: {bid.total_price?.toLocaleString() || '0'}원
                </div>
                {bid.status === 'pending' && (
                  <Button size="sm" className="text-xs px-2 py-1" onClick={() => onSelectBid(bid.id!)}>
                    업체 선정
                  </Button>
                )}
                {bid.status === 'selected' && (
                  <Badge className="bg-green-600 text-xs">선정됨</Badge>
                )}
                {bid.status === 'rejected' && (
                  <Badge variant="outline" className="text-xs">거절됨</Badge>
                )}
              </div>
            </div>
            {bid.notes && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-gray-600">{bid.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
=======
  Shirt
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { manufacturingApi } from "@/lib/api/manufacturing"
import { useAuthContext } from "@/contexts/AuthContext"

// 샘플 업체 데이터 (추후 백엔드 구현 예정)
const sampleFactories = [
  {
    id: 1,
    name: "프리미엄 샘플 공방",
    contact: "02-1234-5678",
    address: "서울시 강남구 테헤란로 123",
    estimatedTime: "3-5일",
    price: 150000,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "스피드 샘플 제작소",
    contact: "02-8765-4321",
    address: "서울시 마포구 홍대로 456",
    estimatedTime: "2-3일",
    price: 180000,
    image: "/placeholder.svg?height=80&width=80",
  },
]
>>>>>>> Stashed changes

export default function DesignerOrdersPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
<<<<<<< Updated upstream
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
=======
>>>>>>> Stashed changes


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await manufacturingApi.getOrders()
        const ordersData = response.results || response
        // 현재 사용자의 주문만 필터링하고 단계 정보 추가
        const userOrders = Array.isArray(ordersData) ? ordersData.filter(order => 
          order.product?.designer === user?.id || order.productInfo?.designer === user?.id
        ).map(order => ({
          ...order,
          currentStep: getOrderCurrentStep(order),
          steps: getOrderSteps(order)
        })) : []
        setOrders(userOrders)
      } catch (error) {
        console.error('주문 데이터 로딩 실패:', error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user])

<<<<<<< Updated upstream
  const getStatusInfo = (order: any) => {
    if (!order.unitPrice) {
      return { 
        status: '확인중', 
        color: 'bg-yellow-100 text-yellow-800',
        description: '공장에서 견적을 검토하고 있습니다',
        currentStep: 1
      }
    }
    if (order.status === 'responded') {
      return { 
        status: '견적 확인', 
        color: 'bg-blue-100 text-blue-800',
        description: '공장에서 견적을 제시했습니다',
        currentStep: 2
      }
    }
    if (order.status === 'accepted') {
      return { 
        status: '생산중', 
        color: 'bg-green-100 text-green-800',
        description: '견적 승인 후 생산이 진행중입니다',
        currentStep: 4
      }
    }
    return { 
      status: '확인중', 
      color: 'bg-gray-100 text-gray-800',
      description: '상태를 확인하고 있습니다',
      currentStep: 1
    }
  }

  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 1:
        return Factory
      case 2:
        return Package
      case 3:
        return Truck
      case 4:
        return MessageSquare
      case 5:
        return Factory
      case 6:
        return Package
      case 7:
        return Truck
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-600"
      case "active":
        return "bg-blue-600"
      case "pending":
        return "bg-gray-300"
      default:
        return "bg-gray-300"
    }
  }

  const getOrderSteps = (order: any) => {
    const statusInfo = getStatusInfo(order)
    return [
      { id: 1, name: "견적 요청", status: "done", completedAt: new Date(order.createdAt).toLocaleDateString() },
      { id: 2, name: "견적 검토", status: statusInfo.currentStep >= 2 ? "done" : "active", completedAt: statusInfo.currentStep >= 2 ? "완료" : null },
      { id: 3, name: "견적 승인", status: statusInfo.currentStep >= 3 ? "done" : statusInfo.currentStep === 2 ? "active" : "pending", completedAt: statusInfo.currentStep >= 3 ? "완료" : null },
      { id: 4, name: "생산 진행", status: statusInfo.currentStep >= 4 ? "active" : "pending", completedAt: null },
      { id: 5, name: "품질 검사", status: "pending", completedAt: null },
      { id: 6, name: "배송 준비", status: "pending", completedAt: null },
      { id: 7, name: "배송 완료", status: "pending", completedAt: null },
    ]
  }

  const handleShowQuote = (order: any) => {
    setSelectedOrder(order)
    setShowQuoteModal(true)
=======
  // 주문 상태에 따른 현재 단계 계산
  const getOrderCurrentStep = (order: any) => {
    switch (order.status) {
      case 'pending': return 1
      case 'confirmed': return 2
      case 'in_production': return 3
      case 'completed': return 7
      default: return 1
    }
  }

  // 주문 단계 정보 생성
  const getOrderSteps = (order: any) => {
    const currentStep = getOrderCurrentStep(order)
    return [
      { id: 1, name: "샘플 제작 업체 선정", status: currentStep > 1 ? "done" : currentStep === 1 ? "active" : "pending", completedAt: currentStep > 1 ? order.created_at : null },
      { id: 2, name: "샘플 생산 현황", status: currentStep > 2 ? "done" : currentStep === 2 ? "active" : "pending", completedAt: currentStep > 2 ? order.updated_at : null },
      { id: 3, name: "샘플 생산 배송 조회", status: currentStep > 3 ? "done" : currentStep === 3 ? "active" : "pending", completedAt: null },
      { id: 4, name: "샘플 피드백", status: currentStep > 4 ? "done" : currentStep === 4 ? "active" : "pending", completedAt: null },
      { id: 5, name: "본 생산 업체 선정", status: currentStep > 5 ? "done" : currentStep === 5 ? "active" : "pending", completedAt: null },
      { id: 6, name: "본 생산 현황", status: currentStep > 6 ? "done" : currentStep === 6 ? "active" : "pending", completedAt: null },
      { id: 7, name: "본 생산 배송 조회", status: currentStep >= 7 ? "done" : "pending", completedAt: currentStep >= 7 ? order.updated_at : null },
    ]
>>>>>>> Stashed changes
  }

  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 1: return Factory
      case 2: return Package
      case 3: return Truck
      case 4: return MessageSquare
      case 5: return Factory
      case 6: return Package
      case 7: return Truck
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "bg-green-600"
      case "active": return "bg-blue-600"
      case "pending": return "bg-gray-300"
      default: return "bg-gray-300"
    }
  }

<<<<<<< Updated upstream


  const handleSelectBid = async (bidId: number) => {
    try {
      await manufacturingApi.selectBid(bidId)
      
      // 주문 목록 새로고침
      const response = await manufacturingApi.getOrders()
      const ordersData = response.results || response
      const userOrders = Array.isArray(ordersData) ? ordersData.filter(order => 
        order.productInfo?.designer === user?.id
      ) : []
      setOrders(userOrders)
      
      alert('업체를 선정했습니다.')
    } catch (error) {
      console.error('업체 선정 실패:', error)
      alert('업체 선정 중 오류가 발생했습니다.')
    }
  }

  // 생산 단계 정보
  const productionStages = [
    { index: 1, name: "1차 가봉", description: "초기 샘플 제작" },
    { index: 2, name: "부자재 부착", description: "단추, 지퍼 등 부자재 부착" },
    { index: 3, name: "마킹 및 재단", description: "원단 마킹 및 재단 작업" },
    { index: 4, name: "봉제", description: "의류 봉제 작업" },
    { index: 5, name: "검사 및 다림질", description: "품질 검사 및 마무리" },
    { index: 6, name: "배송", description: "완제품 포장 및 배송" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-black hover:text-gray-700 transition-colors mr-4"
              >
                <Shirt className="h-6 w-6" />
                <span className="text-xl font-bold">Fablink</span>
              </button>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  대시보드
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">주문 내역 조회</h1>
            </div>
            <span className="text-sm text-gray-600">
              디자이너: {user?.id || 'Unknown'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>주문 내역을 불러오는 중...</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>주문 목록</CardTitle>
                  <CardDescription>진행 중인 주문을 선택하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order) => {
                        const statusInfo = getStatusInfo(order)
                        return (
                          <div
                            key={order.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedOrder?.id === order.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              setSelectedOrder(order)
                              setSelectedStep(null)
                            }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">{order.productInfo?.name || '제품명 없음'}</h4>
                              <Badge variant="outline" className="text-xs">
                                {order.quantity}개
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{order.orderId}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                              <Progress value={(statusInfo.currentStep / 7) * 100} className="w-16 h-2" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>주문 내역이 없습니다.</p>
                      <p className="text-sm">새로운 주문을 생성해보세요.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Detail */}
            <div className="lg:col-span-2">
              {selectedOrder ? (
                <div className="space-y-6">
                  {/* Order Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedOrder.productInfo?.name || '제품명 없음'}</CardTitle>
                      <CardDescription>주문 코드: {selectedOrder.orderId}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">수량:</span>
                          <p className="font-medium">{selectedOrder.quantity}개</p>
                        </div>
                        <div>
                          <span className="text-gray-600">주문일:</span>
                          <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">진행률:</span>
                          <p className="font-medium">{getStatusInfo(selectedOrder).currentStep}/7 단계</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Process Steps */}
                  <Card>
                    <CardHeader>
                      <CardTitle>제작 공정</CardTitle>
                      <CardDescription>각 단계를 클릭하여 상세 정보를 확인하세요</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getOrderSteps(selectedOrder).map((step: any, index: number) => {
                          const Icon = getStepIcon(step.id)
                          const isClickable = step.status !== "pending"

                          return (
                            <div key={step.id}>
                              <div
                                className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                                  isClickable ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed opacity-60"
                                } ${selectedStep === step.id ? "bg-blue-50 border border-blue-200" : ""}`}
                                onClick={() => isClickable && setSelectedStep(selectedStep === step.id ? null : step.id)}
                              >
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}
                                >
                                  {step.status === "done" ? (
                                    <CheckCircle className="h-5 w-5 text-white" />
                                  ) : (
                                    <Icon className="h-5 w-5 text-white" />
                                  )}
                                </div>

                                <div className="flex-1">
                                  <h4 className="font-medium">{step.name}</h4>
                                  {step.completedAt && (
                                    <p className="text-sm text-gray-600">완료일: {step.completedAt}</p>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  {step.status === "active" && <Badge variant="secondary">진행중</Badge>}
                                  {step.status === "done" && <Badge className="bg-green-600">완료</Badge>}
                                  {step.status === "pending" && <Badge variant="outline">대기</Badge>}
                                  {isClickable && <Eye className="h-4 w-4 text-gray-400" />}
                                </div>
                              </div>

                              {/* Step Detail */}
                              {selectedStep === step.id && (
                                <Card className="mt-4">
                                  <CardContent className="pt-6">
                                    {step.id === 1 && (
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                          <div>
                                            <h4 className="font-medium flex items-center space-x-2">
                                              <CheckCircle className="h-5 w-5 text-green-600" />
                                              <span>샘플 제작 업체 선정</span>
                                            </h4>
                                            <p className="text-sm text-gray-600">완료일: 2024-01-16</p>
                                          </div>
                                          <Badge className="bg-green-600">완료</Badge>
                                        </div>
                                        <h5 className="font-medium mb-3">샘플 제작 업체 목록</h5>
                                        <div className="space-y-3">
                                          <div className="bg-white border rounded-lg p-4">
                                            <div className="flex items-center space-x-4">
                                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <Factory className="h-8 w-8 text-gray-600" />
                                              </div>
                                              <div className="flex-1">
                                                <h6 className="font-medium">프리미엄 샘플 공방</h6>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                  <div className="flex items-center space-x-2">
                                                    <Phone className="h-3 w-3" />
                                                    <span>02-1234-5678</span>
                                                  </div>
                                                  <div className="flex items-center space-x-2">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>서울시 강남구 테헤란로 123</span>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                                  <Clock className="h-3 w-3" />
                                                  <span>3-5일</span>
                                                </div>
                                                <div className="flex items-center space-x-2 font-medium text-lg">
                                                  <Won className="h-4 w-4" />
                                                  <span>150,000원</span>
                                                </div>
                                              </div>
                                              <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                                                업체 선정
                                              </Button>
                                            </div>
                                          </div>
                                          <div className="bg-white border rounded-lg p-4">
                                            <div className="flex items-center space-x-4">
                                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <Factory className="h-8 w-8 text-gray-600" />
                                              </div>
                                              <div className="flex-1">
                                                <h6 className="font-medium">스피드 샘플 제작소</h6>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                  <div className="flex items-center space-x-2">
                                                    <Phone className="h-3 w-3" />
                                                    <span>02-8765-4321</span>
                                                  </div>
                                                  <div className="flex items-center space-x-2">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>서울시 마포구 홍대로 456</span>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                                  <Clock className="h-3 w-3" />
                                                  <span>2-3일</span>
                                                </div>
                                                <div className="flex items-center space-x-2 font-medium text-lg">
                                                  <Won className="h-4 w-4" />
                                                  <span>180,000원</span>
                                                </div>
                                              </div>
                                              <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                                                업체 선정
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {step.id === 2 && (
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                          <div>
                                            <h4 className="font-medium flex items-center space-x-2">
                                              <Package className="h-5 w-5 text-blue-600" />
                                              <span>샘플 생산 현황</span>
                                            </h4>
                                            <div className="flex justify-between items-center text-sm text-gray-600">
                                              <span>주문 코드: {selectedOrder.orderId}</span>
                                              <span>업체명: 프리미엄 샘플 공방</span>
                                            </div>
                                          </div>
                                          <Badge variant="secondary">진행중</Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                            <h5 className="font-medium mb-3">주문 정보</h5>
                                            <div className="text-sm space-y-2">
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">주문 날짜:</span>
                                                <span>2024-01-15</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">연락처:</span>
                                                <span>02-1234-5678</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div>
                                            <h5 className="font-medium mb-3">생산 공정</h5>
                                            <div className="space-y-3">
                                              {[
                                                { name: "1차 가봉", status: "done", date: "2024-01-17" },
                                                { name: "부자재 부착", status: "done", date: "2024-01-18" },
                                                { name: "마킹 및 재단", status: "active", date: null },
                                                { name: "봉제", status: "pending", date: null },
                                                { name: "검사 및 다림질", status: "pending", date: null },
                                                { name: "배송 현황", status: "pending", date: null },
                                              ].map((process, index) => (
                                                <div key={index} className="flex items-center space-x-3">
                                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                                    process.status === "done" ? "bg-green-600" :
                                                    process.status === "active" ? "bg-blue-600" : "bg-gray-300"
                                                  }`}>
                                                    {process.status === "done" && <Check className="h-2 w-2 text-white" />}
                                                  </div>
                                                  <span className="flex-1 text-sm">{process.name}</span>
                                                  {process.status === "done" && process.date && (
                                                    <span className="text-xs text-gray-500">{process.date}</span>
                                                  )}
                                                  {process.status === "active" && <Badge variant="secondary">진행중</Badge>}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {step.id === 4 && (
                                      <div className="space-y-4">
                                        <h4 className="font-medium">샘플 피드백</h4>
                                        <div className="border rounded-lg p-4">
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                              <img
                                                src="/placeholder.svg?height=150&width=150"
                                                alt="샘플 사진"
                                                className="w-full h-32 object-cover rounded-lg bg-gray-200"
                                              />
                                            </div>
                                            <div>
                                              <h5 className="font-medium mb-2">1차 생산</h5>
                                              <div className="text-sm text-gray-600 space-y-1">
                                                <div className="flex items-center space-x-2">
                                                  <Phone className="h-3 w-3" />
                                                  <span>02-1234-5678</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <MapPin className="h-3 w-3" />
                                                  <span>서울시 강남구 테헤란로 123</span>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="space-y-2">
                                              <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">피드백 상태:</span>
                                                <Badge variant="outline">배송 완료</Badge>
                                              </div>
                                              <div className="space-y-2">
                                                <Button size="sm" variant="outline" className="w-full bg-transparent">
                                                  <Edit className="h-3 w-3 mr-1" />
                                                  작업 지시서 수정
                                                </Button>
                                                <Button size="sm" className="w-full">
                                                  <Check className="h-3 w-3 mr-1" />
                                                  작업 지시서 확정
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {step.status === "pending" && (
                                      <div className="text-center py-8 text-gray-500">
                                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>이 단계는 아직 진행되지 않았습니다.</p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Connector Line */}
                              {index < getOrderSteps(selectedOrder).length - 1 && <div className="ml-5 w-0.5 h-4 bg-gray-200" />}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">주문을 선택하세요</h3>
                      <p>왼쪽 목록에서 주문을 선택하면 상세 정보를 확인할 수 있습니다.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Quote Modal */}
        <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>견적 확인</span>
              </DialogTitle>
              <DialogDescription>
                주문번호: {selectedOrder?.orderId}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>견적 정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-700">제품명:</span>
                          <p>{selectedOrder.productInfo?.name}</p>
=======
  const renderStepDetail = (order: any, stepId: number) => {
    switch (stepId) {
      case 1: // 샘플 제작 업체 선정
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>샘플 제작 업체 목록</CardTitle>
              <CardDescription>주문 코드: {order.order_id}</CardDescription>
            </CardHeader>
            <CardContent>
              {sampleFactories.length > 0 ? (
                <div className="space-y-4">
                  {sampleFactories.map((factory) => (
                    <div
                      key={factory.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <img
                        src={factory.image || "/placeholder.svg"}
                        alt={factory.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{factory.name}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3" />
                            <span>{factory.contact}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{factory.address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <Clock className="h-3 w-3" />
                          <span>{factory.estimatedTime}</span>
                        </div>
                        <div className="flex items-center space-x-2 font-medium">
                          <Won className="h-4 w-4" />
                          <span>{factory.price.toLocaleString()}원</span>
                        </div>
                      </div>
                      <Button size="sm">업체 선정</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Factory className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>현재 입찰 가능한 업체가 없습니다.</p>
                  <p className="text-sm">업체가 작업지시서를 확인 후 입찰하면 목록에 표시됩니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 2: // 샘플 생산 현황
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>샘플 생산 현황</CardTitle>
              <CardDescription>
                <div className="flex justify-between items-center">
                  <span>주문 코드: {order.order_id}</span>
                  <span>업체명: 프리미엄 샘플 공방</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">주문 정보</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">주문 날짜:</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">연락처:</span>
                      <span>02-1234-5678</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">생산 공정</h4>
                  <div className="space-y-3">
                    {[
                      { name: "1차 가봉", status: "done", date: "2024-01-17" },
                      { name: "부자재 부착", status: "done", date: "2024-01-18" },
                      { name: "마킹 및 재단", status: "active", date: null },
                      { name: "봉제", status: "pending", date: null },
                      { name: "검사 및 다림질", status: "pending", date: null },
                      { name: "배송", status: "pending", date: null },
                    ].map((process, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(process.status)}`} />
                        <span className="flex-1 text-sm">{process.name}</span>
                        {process.status === "done" && process.date && (
                          <span className="text-xs text-gray-500">{process.date}</span>
                        )}
                        {process.status === "active" && <Badge variant="secondary">진행중</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 4: // 샘플 피드백
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>샘플 피드백</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <img
                        src="/placeholder.svg?height=150&width=150"
                        alt="샘플 사진"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">1차 생산</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3" />
                          <span>02-1234-5678</span>
>>>>>>> Stashed changes
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3" />
                          <span>서울시 강남구 테헤란로 123</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">피드백 상태:</span>
                        <Badge variant="outline">배송 완료</Badge>
                      </div>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          <Edit className="h-3 w-3 mr-1" />
                          작업 지시서 수정
                        </Button>
                        <Button size="sm" className="w-full">
                          <Check className="h-3 w-3 mr-1" />
                          작업 지시서 확정
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>이 단계는 아직 진행되지 않았습니다.</p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  대시보드
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">주문 내역 조회</h1>
            </div>
            <span className="text-sm text-gray-600">
              디자이너: {user.user_id}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>주문 목록</CardTitle>
                <CardDescription>진행 중인 주문을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">로딩 중...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedOrder?.id === order.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setSelectedOrder(order)
                          setSelectedStep(null)
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{order.product?.name || order.productInfo?.name || '제품명 없음'}</h4>
                          <Badge variant="outline" className="text-xs">
                            {order.quantity}개
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{order.order_id}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                          <Progress value={(order.currentStep / 7) * 100} className="w-16 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">주문 내역이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Detail */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="space-y-6">
                {/* Order Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedOrder.product?.name || selectedOrder.productInfo?.name || '제품명 없음'}</CardTitle>
                    <CardDescription>주문 코드: {selectedOrder.order_id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">수량:</span>
                        <p className="font-medium">{selectedOrder.quantity}개</p>
                      </div>
                      <div>
                        <span className="text-gray-600">주문일:</span>
                        <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">진행률:</span>
                        <p className="font-medium">{selectedOrder.currentStep}/7 단계</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Process Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle>제작 공정</CardTitle>
                    <CardDescription>각 단계를 클릭하여 상세 정보를 확인하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.steps?.map((step: any, index: number) => {
                        const Icon = getStepIcon(step.id)
                        const isClickable = step.status !== "pending"

                        return (
                          <div key={step.id}>
                            <div
                              className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                                isClickable ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed opacity-60"
                              } ${selectedStep === step.id ? "bg-blue-50 border border-blue-200" : ""}`}
                              onClick={() => isClickable && setSelectedStep(selectedStep === step.id ? null : step.id)}
                            >
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}
                              >
                                {step.status === "done" ? (
                                  <CheckCircle className="h-5 w-5 text-white" />
                                ) : (
                                  <Icon className="h-5 w-5 text-white" />
                                )}
                              </div>

                              <div className="flex-1">
                                <h4 className="font-medium">{step.name}</h4>
                                {step.completedAt && (
                                  <p className="text-sm text-gray-600">완료일: {new Date(step.completedAt).toLocaleDateString()}</p>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                {step.status === "active" && <Badge variant="secondary">진행중</Badge>}
                                {step.status === "done" && <Badge className="bg-green-600">완료</Badge>}
                                {step.status === "pending" && <Badge variant="outline">대기</Badge>}
                                {isClickable && <Eye className="h-4 w-4 text-gray-400" />}
                              </div>
                            </div>

                            {/* Step Detail */}
                            {selectedStep === step.id && renderStepDetail(selectedOrder, step.id)}

                            {/* Connector Line */}
                            {index < selectedOrder.steps.length - 1 && <div className="ml-5 w-0.5 h-4 bg-gray-200" />}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">주문을 선택하세요</h3>
                    <p>왼쪽 목록에서 주문을 선택하면 상세 정보를 확인할 수 있습니다.</p>
                  </div>
                </CardContent>
              </Card>
            )}
<<<<<<< Updated upstream
          </DialogContent>
        </Dialog>


=======
          </div>
        </div>
>>>>>>> Stashed changes
      </div>
    </div>
  )
}

