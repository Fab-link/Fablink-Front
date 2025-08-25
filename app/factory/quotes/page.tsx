"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calculator, Clock, CheckCircle, XCircle, Eye, Package, Calendar, User, Edit, FileText, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"
import { manufacturingApi } from "@/lib/api/manufacturing"

export default function FactoryQuotesPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [sortedOrders, setSortedOrders] = useState<any[]>([])
  const [sortType, setSortType] = useState<'default' | 'quantity' | 'dueDate'>('default')
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteForm, setQuoteForm] = useState({
    workPrice: '',
    deliveryDate: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const list = await manufacturingApi.getFactoryQuotes()
        console.log('getFactoryQuotes 응답:', list)
        // 초기 bid 상태 확인
  const results = await Promise.allSettled(list.map((o: any) => manufacturingApi.hasFactoryBid(o.orderId)))
  const withBid = list.map((o: any, idx: number) => {
          const r = results[idx]
          if (r.status === 'fulfilled' && r.value) {
            const data: any = r.value
            return { ...o, bidStatus: data.has_bid ? 'submitted' : 'pending', bidId: data.bid_id }
          }
          return { ...o, bidStatus: 'error' }
        })
        setOrders(withBid)
        setSortedOrders(withBid)
      } catch (error) {
        console.error('견적 요청 목록 로딩 실패:', error)
        setOrders([])
        setSortedOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      // RequestOrder 기반 커스텀 상태 (샘플/생산 단계 구분)
      case 'sample_pending':
      case 'sample_matched':
        return <Badge className="bg-purple-100 text-purple-800">샘플</Badge>
      case 'product_pending':
      case 'product_matched':
        return <Badge className="bg-teal-100 text-teal-800">생산</Badge>
      case 'finished':
        return <Badge className="bg-green-100 text-green-800">완료</Badge>
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
      workPrice: order.workPrice?.toString() || '',
      deliveryDate: '',
      notes: ''
    })
    setShowQuoteModal(true)
  }

  const handleSubmitQuote = async () => {
    if (!selectedOrder || !quoteForm.workPrice) {
      alert('단가를 입력해주세요.')
      return
    }

    const deliveryDays = quoteForm.deliveryDate ? 
      Math.ceil((new Date(quoteForm.deliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 7

    setSubmitting(true)
    try {
      // 백엔드가 요구하는 order 기본키: API 응답에 id 대신 order_id / orderId만 있을 수 있으므로 보정
      // RequestOrder PK 사용 (백엔드 create_factory_bid: order = RequestOrder.id 기대)
      const pk = selectedOrder.requestOrderId
      if (!pk) {
        console.error('선택된 견적 요청에 requestOrderId 가 없습니다.', selectedOrder)
        alert('견적 요청 식별자 오류로 입찰을 제출할 수 없습니다.')
        return
      }
      const bidData = {
        order: pk,
        work_price: parseFloat(quoteForm.workPrice),
        estimated_delivery_days: Math.max(1, deliveryDays),
        notes: quoteForm.notes
      }
      
      await manufacturingApi.createBid(bidData)
      
      // 주문 목록 새로고침
  const refreshed = await manufacturingApi.getFactoryQuotes()
  setOrders(refreshed)
  applySorting(refreshed, sortType)
      
      alert('입찰이 성공적으로 제출되었습니다.')
      setShowQuoteModal(false)
    } catch (error: any) {
      console.error('입찰 제출 실패:', error)
      if (error.message?.includes('duplicate key') || error.message?.includes('중복')) {
        alert('이미 이 주문에 대해 입찰을 제출하셨습니다.')
      } else {
        alert('입찰 제출 중 오류가 발생했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const applySorting = (ordersList: any[], type: 'default' | 'quantity' | 'dueDate') => {
    let sorted = [...ordersList]
    
    switch (type) {
      case 'quantity':
        sorted.sort((a, b) => (b.quantity || 0) - (a.quantity || 0)) // 내림차순
        break
      case 'dueDate':
        sorted.sort((a, b) => {
          const dateA = a.productInfo?.dueDate ? new Date(a.productInfo.dueDate).getTime() : 0
          const dateB = b.productInfo?.dueDate ? new Date(b.productInfo.dueDate).getTime() : 0
          return dateB - dateA // 내림차순
        })
        break
      default:
        // 기본 정렬 (생성일 기준)
  sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
    }
    
    setSortedOrders(sorted)
  }

  const handleSort = (type: 'default' | 'quantity' | 'dueDate') => {
    setSortType(type)
    applySorting(orders, type)
  }

  const getSortIcon = (type: 'default' | 'quantity' | 'dueDate') => {
    if (sortType === type) {
      return <ArrowDown className="h-4 w-4" />
    }
    return <ArrowUpDown className="h-4 w-4" />
  }

  // 액션 버튼 표시 규칙 헬퍼
  const hasBidValue = (o: any) => {
    const v = o.work_price ?? o.workPrice
    return typeof v === 'number' && v > 0
  }
  const canBidStatuses = ['pending', 'sample_pending', 'product_pending']
  const canEditStatuses = ['responded', 'confirmed', 'sample_pending', 'product_pending', 'sample_matched', 'product_matched']
  const shouldShowSubmit = (o: any) => canBidStatuses.includes(o.status) && !hasBidValue(o)
  const shouldShowEdit = (o: any) => canEditStatuses.includes(o.status) && hasBidValue(o)

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

        {/* 정렬 버튼 */}
        {!loading && Array.isArray(orders) && orders.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">정렬:</span>
              <Button
                variant={sortType === 'default' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('default')}
                className="flex items-center space-x-1"
              >
                {getSortIcon('default')}
                <span>기본</span>
              </Button>
              <Button
                variant={sortType === 'quantity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('quantity')}
                className="flex items-center space-x-1"
              >
                {getSortIcon('quantity')}
                <span>수량별</span>
              </Button>
              <Button
                variant={sortType === 'dueDate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('dueDate')}
                className="flex items-center space-x-1"
              >
                {getSortIcon('dueDate')}
                <span>납기일별</span>
              </Button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>주문 데이터를 불러오는 중...</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && Array.isArray(sortedOrders) && sortedOrders.length > 0 && (
          <div className="space-y-6">
            {sortedOrders.map((order: any, index: number) => (
              <Card key={order.orderId || order.id || `order-${index}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{order.productInfo?.name || '제품명 없음'}</span>
                        {order.requestStatusLabel && (
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800"
                          >
                            {order.requestStatusLabel}
                          </Badge>
                        )}
                        {getStatusBadge(order.status)}
                        {order.bidStatus === 'submitted' && <Badge className="bg-blue-100 text-blue-800">견적 제출 완료</Badge>}
                        {order.bidStatus === 'pending' && <Badge variant="outline" className="border-dashed">견적 대기중</Badge>}
                        {order.bidStatus === 'checking' && <Badge variant="secondary">확인중...</Badge>}
                        {order.bidStatus === 'error' && <Badge className="bg-red-100 text-red-700">상태 오류</Badge>}
                      </CardTitle>
                      <CardDescription>
                        주문번호: {order.orderId} • 디자이너: {order.productInfo?.designerName || '알 수 없음'}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>주문일: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</span>
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
                          <p>수량: {order.quantity ?? order.productInfo?.quantity ?? '-'}개</p>
                          <p>입찰 단가: {(() => { const v = order.work_price ?? order.workPrice; return (v !== undefined && v !== null && v > 0) ? `${v.toLocaleString()}원` : '미입찰'; })()}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">고객 정보</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>이름: {order.customerName || '정보 없음'}</p>
                          <p>연락처: {order.customerContact || '정보 없음'}</p>
                          <p>배송지: {order.shippingAddress || '정보 없음'}</p>
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
                        {shouldShowSubmit(order) && (
                          <Button size="sm" onClick={() => handleShowQuote(order)}>
                            <Edit className="h-4 w-4 mr-1" />
                            입찰 제출
                          </Button>
                        )}
                        {shouldShowEdit(order) && (
                          <Button variant="outline" size="sm" onClick={() => handleShowQuote(order)}>
                            <Edit className="h-4 w-4 mr-1" />
                            견적 수정
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleShowDetail(order)}>
                          <Eye className="h-4 w-4 mr-1" />
                          상세 보기
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && (!Array.isArray(sortedOrders) || sortedOrders.length === 0) && (
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
                            onError={(e: any) => {
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
                <span>입찰 제출</span>
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
                      <Label htmlFor="workPrice">단가 (원) *</Label>
                      <Input
                        id="workPrice"
                        type="number"
                        placeholder="15000"
                        value={quoteForm.workPrice}
                        onChange={(e) => setQuoteForm({...quoteForm, workPrice: e.target.value})}
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
                  {quoteForm.workPrice && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-900">예상 총액:</span>
                        <span className="text-lg font-bold text-blue-900">
                          {(parseFloat(quoteForm.workPrice) * selectedOrder.quantity).toLocaleString()}원
                        </span>
                      </div>
                      <div className="text-sm text-blue-700 mt-1">
                        단가 {parseFloat(quoteForm.workPrice).toLocaleString()}원 × {selectedOrder.quantity}개
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">입찰 메모 (선택)</Label>
                    <Textarea
                      id="notes"
                      placeholder="입찰에 대한 추가 설명이나 조건을 입력하세요..."
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
                    disabled={!quoteForm.workPrice || submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        제출 중...
                      </>
                    ) : (
                      '입찰 제출'
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