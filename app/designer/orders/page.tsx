"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

export default function DesignerOrdersPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await manufacturingApi.getOrders()
        const ordersData = response.results || response
        // 현재 사용자의 주문만 필터링
        const userOrders = Array.isArray(ordersData) ? ordersData.filter(order => 
          order.productInfo?.designer === user?.id
        ) : []
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
  }

  const handleShowProgress = (order: any) => {
    setSelectedOrder(order)
    setShowProgressModal(true)
  }

  const handleAcceptQuote = async (orderId: number) => {
    try {
      // TODO: API 구현 후 사용
      // await manufacturingApi.updateOrder(orderId, { status: 'accepted' })
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'accepted' } : order
      ))
      
      alert('견적을 승인했습니다.')
      setShowQuoteModal(false)
    } catch (error) {
      console.error('견적 승인 실패:', error)
      alert('견적 승인 중 오류가 발생했습니다.')
    }
  }

  const handleRejectQuote = async (orderId: number) => {
    try {
      // TODO: API 구현 후 사용
      // await manufacturingApi.updateOrder(orderId, { status: 'rejected' })
      
      setOrders(prev => prev.filter(order => order.id !== orderId))
      
      alert('견적을 거절했습니다.')
      setShowQuoteModal(false)
    } catch (error) {
      console.error('견적 거절 실패:', error)
      alert('견적 거절 중 오류가 발생했습니다.')
    }
  }



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
                                      <div className="space-y-4">
                                        <h4 className="font-medium">업체 입찰 현황</h4>
                                        <BidsDisplay order={selectedOrder} onSelectBid={handleSelectBid} />
                                      </div>
                                    )}
                                    {step.id === 2 && selectedOrder.unitPrice && (
                                      <div className="space-y-4">
                                        <h4 className="font-medium">견적 정보</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <span className="text-gray-600">단가:</span>
                                            <p className="font-medium text-blue-600">{selectedOrder.unitPrice.toLocaleString()}원</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">총액:</span>
                                            <p className="font-medium text-blue-600">{selectedOrder.totalPrice?.toLocaleString()}원</p>
                                          </div>
                                        </div>
                                        {selectedOrder.status === 'responded' && (
                                          <div className="flex space-x-2 pt-4 border-t">
                                            <Button size="sm" onClick={() => handleAcceptQuote(selectedOrder.id)}>
                                              <CheckCircle className="h-4 w-4 mr-1" />
                                              견적 승인
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              onClick={() => handleRejectQuote(selectedOrder.id)}
                                              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                            >
                                              <XCircle className="h-4 w-4 mr-1" />
                                              견적 거절
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {step.id === 4 && selectedOrder.status === 'accepted' && (
                                      <div className="space-y-4">
                                        <h4 className="font-medium">생산 현황</h4>
                                        <div className="space-y-3">
                                          {productionStages.map((stage, stageIndex) => {
                                            const isCompleted = stageIndex < 3
                                            const isCurrent = stageIndex === 2
                                            return (
                                              <div key={stage.index} className="flex items-center space-x-3">
                                                <div className={`w-4 h-4 rounded-full ${
                                                  isCompleted ? 'bg-green-600' : 
                                                  isCurrent ? 'bg-blue-600' : 'bg-gray-300'
                                                }`} />
                                                <span className="flex-1 text-sm">{stage.name}</span>
                                                {isCompleted && <span className="text-xs text-gray-500">완료</span>}
                                                {isCurrent && <Badge variant="secondary">진행중</Badge>}
                                              </div>
                                            )
                                          })}
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
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">수량:</span>
                          <p>{selectedOrder.quantity}개</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">단가:</span>
                          <p className="text-lg font-bold text-blue-600">
                            {selectedOrder.unitPrice?.toLocaleString()}원
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">총액:</span>
                          <p className="text-lg font-bold text-blue-600">
                            {selectedOrder.totalPrice?.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                      
                      {selectedOrder.notes && (
                        <div>
                          <span className="font-medium text-gray-700">공장 메모:</span>
                          <p className="mt-1 p-3 bg-gray-50 rounded">{selectedOrder.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleRejectQuote(selectedOrder.id)}
                    className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    견적 거절
                  </Button>
                  <Button onClick={() => handleAcceptQuote(selectedOrder.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    견적 승인
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Progress Modal */}
        <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>생산 현황</span>
              </DialogTitle>
              <DialogDescription>
                주문번호: {selectedOrder?.orderId} • 제품명: {selectedOrder?.productInfo?.name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Progress Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>전체 진행률</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>현재 단계: 3단계 (마킹 및 재단)</span>
                        <span>50% 완료</span>
                      </div>
                      <Progress value={50} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                {/* Stage Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>단계별 현황</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {productionStages.map((stage, index) => {
                        const isCompleted = index < 3
                        const isCurrent = index === 2
                        const isPending = index > 2
                        
                        return (
                          <div key={stage.index} className={`flex items-center space-x-4 p-3 rounded-lg ${
                            isCompleted ? 'bg-green-50' : 
                            isCurrent ? 'bg-blue-50' : 
                            'bg-gray-50'
                          }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-600 text-white' :
                              isCurrent ? 'bg-blue-600 text-white' :
                              'bg-gray-300 text-gray-600'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <span className="text-sm font-bold">{stage.index}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                isCompleted ? 'text-green-900' :
                                isCurrent ? 'text-blue-900' :
                                'text-gray-600'
                              }`}>
                                {stage.name}
                              </h4>
                              <p className={`text-sm ${
                                isCompleted ? 'text-green-700' :
                                isCurrent ? 'text-blue-700' :
                                'text-gray-500'
                              }`}>
                                {stage.description}
                              </p>
                            </div>
                            <div className="text-right">
                              {isCompleted && (
                                <div className="text-sm text-green-600">
                                  완료: 2024.01.15
                                </div>
                              )}
                              {isCurrent && (
                                <div className="text-sm text-blue-600">
                                  진행중
                                </div>
                              )}
                              {isPending && (
                                <div className="text-sm text-gray-500">
                                  대기중
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>


      </div>
    </div>
  )
}