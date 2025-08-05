"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calculator, Clock, CheckCircle, XCircle, Eye, Package, Calendar, User, Edit, FileText, Download } from "lucide-react"
import Link from "next/link"
import { manufacturingApi } from "@/lib/api/manufacturing"

export default function FactoryQuotesPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteForm, setQuoteForm] = useState({
    unitPrice: '',
    deliveryDate: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await manufacturingApi.getOrders()
        console.log('API 응답:', response) // 디버깅용
        // Django REST framework pagination 응답 처리
        const ordersData = response.results || response
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      } catch (error) {
        console.error('주문 데이터 로딩 실패:', error)
        setOrders([]) // 에러 시 빈 배열로 설정
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

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

  const handleQuoteResponse = (orderId: number, action: 'accept' | 'reject') => {
    // 실제로는 API 호출
    console.log(`Order ${orderId} ${action}ed`)
  }

  const handleShowDetail = (order: any) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handleShowQuote = (order: any) => {
    setSelectedOrder(order)
    setQuoteForm({
      unitPrice: order.unitPrice?.toString() || '',
      deliveryDate: '',
      notes: ''
    })
    setShowQuoteModal(true)
  }

  const handleSubmitQuote = async () => {
    if (!selectedOrder || !quoteForm.unitPrice) {
      alert('단가를 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      // TODO: API 엔드포인트 구현 후 사용
      const quoteData = {
        orderId: selectedOrder.id,
        unitPrice: parseFloat(quoteForm.unitPrice),
        totalPrice: parseFloat(quoteForm.unitPrice) * selectedOrder.quantity,
        deliveryDate: quoteForm.deliveryDate,
        notes: quoteForm.notes,
        status: 'responded'
      }
      
      console.log('제출할 견적 데이터:', quoteData)
      
      // 실제 API 호출 예시:
      // await manufacturingApi.updateOrder(selectedOrder.id, quoteData)
      
      // 임시로 로컬 상태 업데이트
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, unitPrice: quoteData.unitPrice, totalPrice: quoteData.totalPrice, status: 'responded' }
          : order
      ))
      
      alert('견적이 성공적으로 제출되었습니다.')
      setShowQuoteModal(false)
    } catch (error) {
      console.error('견적 제출 실패:', error)
      alert('견적 제출 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
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

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>주문 데이터를 불러오는 중...</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && Array.isArray(orders) && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{order.productInfo?.name || '제품명 없음'}</span>
                        {getStatusBadge(order.status)}
                      </CardTitle>
                      <CardDescription>
                        주문번호: {order.orderId} • 디자이너: {order.productInfo?.designerName || '알 수 없음'}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>주문일: {new Date(order.createdAt).toLocaleDateString()}</span>
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
                          <p>단가: {order.unitPrice?.toLocaleString()}원</p>
                          <p>총액: {order.totalPrice?.toLocaleString()}원</p>
                          <p>배송비: {order.shippingCost?.toLocaleString() || 0}원</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">고객 정보</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>이름: {order.customerName}</p>
                          <p>연락처: {order.customerContact}</p>
                          <p>배송지: {order.shippingAddress}</p>
                          <p>결제방법: {order.shippingMethod}</p>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">추가 정보</h4>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    )}

                    {/* 작업지시서 다운로드 */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">작업지시서</span>
                        </div>
                        {order.productInfo?.workSheetUrl ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                            onClick={() => window.open(order.productInfo.workSheetUrl, '_blank')}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            다운로드
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-500">작업지시서 없음</span>
                        )}
                      </div>
                      {/* 디버깅 정보 */}
                      <div className="text-xs text-gray-400 mt-1">
                        workSheetUrl: {order.productInfo?.workSheetUrl || '없음'}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        주문일: {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="space-x-2">
                        {order.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleShowQuote(order)}>
                              <Edit className="h-4 w-4 mr-1" />
                              견적 작성
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleShowDetail(order)}>
                              <Eye className="h-4 w-4 mr-1" />
                              상세 보기
                            </Button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleShowQuote(order)}>
                              <Edit className="h-4 w-4 mr-1" />
                              견적 수정
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleShowDetail(order)}>
                              <Eye className="h-4 w-4 mr-1" />
                              상세 보기
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && (!Array.isArray(orders) || orders.length === 0) && (
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

        {/* Product Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>제품 상세 정보</span>
              </DialogTitle>
              <DialogDescription>
                주문번호: {selectedOrder?.orderId}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* 기본 제품 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>기본 정보</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">제품명:</span>
                          <span className="ml-2">{selectedOrder.productInfo?.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">시즌:</span>
                          <span className="ml-2">{selectedOrder.productInfo?.season}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">타겟 고객층:</span>
                          <span className="ml-2">{selectedOrder.productInfo?.target}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">디자이너:</span>
                          <span className="ml-2">{selectedOrder.productInfo?.designerName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">사이즈:</span>
                          <span className="ml-2">{selectedOrder.productInfo?.size || '미지정'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">납기일:</span>
                          <span className="ml-2">{selectedOrder.productInfo?.dueDate ? new Date(selectedOrder.productInfo.dueDate).toLocaleDateString() : '미지정'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 컨셉 설명 */}
                {selectedOrder.productInfo?.concept && (
                  <Card>
                    <CardHeader>
                      <CardTitle>컨셉 설명</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedOrder.productInfo.concept}</p>
                    </CardContent>
                  </Card>
                )}

                {/* 포인트 부위 설명 */}
                {selectedOrder.productInfo?.detail && (
                  <Card>
                    <CardHeader>
                      <CardTitle>포인트 부위 설명</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedOrder.productInfo.detail}</p>
                    </CardContent>
                  </Card>
                )}

                {/* 원단 정보 */}
                {selectedOrder.productInfo?.fabric && (
                  <Card>
                    <CardHeader>
                      <CardTitle>원단 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {typeof selectedOrder.productInfo.fabric === 'string' 
                          ? selectedOrder.productInfo.fabric 
                          : JSON.stringify(selectedOrder.productInfo.fabric, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* 부자재 정보 */}
                {selectedOrder.productInfo?.material && (
                  <Card>
                    <CardHeader>
                      <CardTitle>부자재 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {typeof selectedOrder.productInfo.material === 'string' 
                          ? selectedOrder.productInfo.material 
                          : JSON.stringify(selectedOrder.productInfo.material, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* 디자인 이미지 */}
                {selectedOrder.productInfo?.imageUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle>디자인 이미지</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img 
                        src={selectedOrder.productInfo.imageUrl} 
                        alt="제품 디자인" 
                        className="max-w-full h-auto rounded-lg shadow-md"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* 작업지시서 */}
                {selectedOrder.productInfo?.workSheetUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>작업지시서</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">작업지시서 파일</span>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => window.open(selectedOrder.productInfo.workSheetUrl, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            다운로드
                          </Button>
                        </div>
                        {/* 작업지시서 미리보기 */}
                        <div className="border rounded-lg overflow-hidden">
                          <iframe 
                            src={selectedOrder.productInfo.workSheetUrl}
                            className="w-full h-96"
                            title="작업지시서 미리보기"
                            onError={(e) => {
                              console.log('작업지시서 로드 실패:', selectedOrder.productInfo.workSheetUrl)
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          파일 URL: {selectedOrder.productInfo.workSheetUrl}
                        </p>
                        <p className="text-sm text-gray-600">
                          작업지시서를 위에서 미리 확인하거나 다운로드하여 상세히 보세요.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 메모 */}
                {selectedOrder.productInfo?.memo && (
                  <Card>
                    <CardHeader>
                      <CardTitle>메모</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedOrder.productInfo.memo}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Quote Creation Modal */}
        <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>견적 작성</span>
              </DialogTitle>
              <DialogDescription>
                주문번호: {selectedOrder?.orderId} • 제품명: {selectedOrder?.productInfo?.name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* 주문 요약 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">주문 요약</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">제품명:</span>
                        <span className="ml-2">{selectedOrder.productInfo?.name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">수량:</span>
                        <span className="ml-2">{selectedOrder.quantity}개</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">고객명:</span>
                        <span className="ml-2">{selectedOrder.customerName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">연락처:</span>
                        <span className="ml-2">{selectedOrder.customerContact}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 견적 입력 폼 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">단가 (원) *</Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        placeholder="15000"
                        value={quoteForm.unitPrice}
                        onChange={(e) => setQuoteForm({...quoteForm, unitPrice: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate">예상 납기일</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={quoteForm.deliveryDate}
                        onChange={(e) => setQuoteForm({...quoteForm, deliveryDate: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* 총액 계산 표시 */}
                  {quoteForm.unitPrice && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-900">예상 총액:</span>
                        <span className="text-lg font-bold text-blue-900">
                          {(parseFloat(quoteForm.unitPrice) * selectedOrder.quantity).toLocaleString()}원
                        </span>
                      </div>
                      <div className="text-sm text-blue-700 mt-1">
                        단가 {parseFloat(quoteForm.unitPrice).toLocaleString()}원 × {selectedOrder.quantity}개
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">견적 메모 (선택)</Label>
                    <Textarea
                      id="notes"
                      placeholder="견적에 대한 추가 설명이나 조건을 입력하세요..."
                      value={quoteForm.notes}
                      onChange={(e) => setQuoteForm({...quoteForm, notes: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowQuoteModal(false)}
                    disabled={submitting}
                  >
                    취소
                  </Button>
                  <Button 
                    onClick={handleSubmitQuote}
                    disabled={!quoteForm.unitPrice || submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        제출 중...
                      </>
                    ) : (
                      '견적 제출'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}