"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Eye, Calendar, User, Shirt } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { manufacturingApi } from "@/lib/api/manufacturing"
import { useAuthContext } from "@/contexts/AuthContext"

export default function DesignerOrdersPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
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
        description: '공장에서 견적을 검토하고 있습니다'
      }
    }
    if (order.status === 'responded') {
      return { 
        status: '견적 확인', 
        color: 'bg-blue-100 text-blue-800',
        description: '공장에서 견적을 제시했습니다'
      }
    }
    if (order.status === 'accepted') {
      return { 
        status: '생산중', 
        color: 'bg-green-100 text-green-800',
        description: '견적 승인 후 생산이 진행중입니다'
      }
    }
    return { 
      status: '확인중', 
      color: 'bg-gray-100 text-gray-800',
      description: '상태를 확인하고 있습니다'
    }
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">주문 내역</h1>
          </div>
          <p className="text-gray-600 mt-2">내가 주문한 제품들의 현재 상태를 확인하세요</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>주문 내역을 불러오는 중...</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order)
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{order.productInfo?.name || '제품명 없음'}</span>
                          <Badge variant="secondary" className={statusInfo.color}>
                            {statusInfo.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          주문번호: {order.orderId} • 주문일: {new Date(order.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{statusInfo.description}</span>
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
                            <p>수량: {order.quantity}개</p>
                            <p>단가: {order.unitPrice ? `${order.unitPrice.toLocaleString()}원` : '견적 대기중'}</p>
                            <p>총액: {order.totalPrice ? `${order.totalPrice.toLocaleString()}원` : '견적 대기중'}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">배송 정보</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>배송지: {order.shippingAddress}</p>
                            <p>배송비: {order.shippingCost?.toLocaleString() || 0}원</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4 border-t">
                        {statusInfo.status === '견적 확인' && (
                          <Button size="sm" onClick={() => handleShowQuote(order)}>
                            <Eye className="h-4 w-4 mr-1" />
                            견적 확인
                          </Button>
                        )}
                        {statusInfo.status === '생산중' && (
                          <Button size="sm" onClick={() => handleShowProgress(order)}>
                            <Eye className="h-4 w-4 mr-1" />
                            생산 현황
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>주문 내역이 없습니다.</p>
                <p className="text-sm">새로운 주문을 생성해보세요.</p>
              </div>
            </CardContent>
          </Card>
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