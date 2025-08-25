"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Badge 컴포넌트 타입 충돌로 span 커스텀 스타일 사용
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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



// 샘플 제작 업체 목록 컴포넌트
function SampleFactoriesList({ order, onRefresh }: { order: any; onRefresh?: () => Promise<void> | void }) {
  const [factories, setFactories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFactories = async () => {
      if (!order) return
      
      console.log('Fetching factories for order:', order)
      
      try {
        const response = await manufacturingApi.getBidsByOrder(order.order_id || order.id)
        console.log('API Response:', response)
  const bidsData = Array.isArray(response) ? response : []
        
  // 입찰 데이터를 공장 정보로 변환
  const factoriesData = bidsData.map((bid: any) => {
          const factoryInfo = bid.factory_info || bid.factoryInfo || {}
          return {
            id: bid.id,
            orderId: order.order_id || order.id,
            name: factoryInfo.name || '공장명 없음',
            contact: factoryInfo.contact || '연락처 없음',
            address: factoryInfo.address || '주소 없음',
            profile_image: factoryInfo.profile_image,
            estimatedTime: `${bid.estimated_delivery_days || bid.estimatedDeliveryDays || 0}일`,
            price: bid.work_price || bid.workPrice || 0,
            totalPrice: bid.total_price || bid.totalPrice || 0,
            dueDate: bid.expect_work_day || bid.expectWorkDay || '미정',
            status: bid.status || 'pending',
            bidId: bid.id
          }
        })
        
        console.log('Processed factories data:', factoriesData)
        setFactories(factoriesData)
      } catch (error) {
        console.error('공장 목록 로딩 실패:', error)
        setFactories([])
      } finally {
        setLoading(false)
      }
    }

    fetchFactories()
  }, [order])

  const handleSelectFactory = async (bidId: number) => {
    try {
      await manufacturingApi.selectBid(bidId)
      alert('업체를 선정했습니다.')
      // 목록 새로고침
      const response = await manufacturingApi.getBidsByOrder(order.order_id || order.id)
  const bidsData = Array.isArray(response) ? response : []
  const factoriesData = bidsData.map((bid: any) => {
        const factoryInfo = bid.factory_info || bid.factoryInfo || {}
        return {
          id: bid.id,
          orderId: order.order_id,
          name: factoryInfo.name || '공장명 없음',
          contact: factoryInfo.contact || '연락처 없음',
          address: factoryInfo.address || '주소 없음',
          profile_image: factoryInfo.profile_image,
          estimatedTime: `${bid.estimated_delivery_days || bid.estimatedDeliveryDays || 0}일`,
          price: bid.work_price || bid.workPrice || 0,
          totalPrice: bid.total_price || bid.totalPrice || 0,
          dueDate: bid.expect_work_day || bid.expectWorkDay || '미정',
          status: bid.status || 'pending',
          bidId: bid.id
        }
      })
      setFactories(factoriesData)
      // 상위 페이지의 진행상황 갱신(디자이너 주문 재조회)
      if (onRefresh) {
        try { await onRefresh() } catch {}
      }
    } catch (error) {
      console.error('업체 선정 실패:', error)
      alert('업체 선정 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">업체 정보를 불러오는 중...</p>
      </div>
    )
  }

  console.log('Factories state:', factories)
  
  if (factories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Factory className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>현재 입찰 가능한 업체가 없습니다.</p>
        <p className="text-sm">업체가 작업지시서를 확인 후 입찰하면 목록에 표시됩니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
  {factories.map((factory: any) => (
        <div
          key={factory.id}
          className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {factory.profile_image ? (
              <img 
                src={factory.profile_image} 
                alt={factory.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <Factory className={`h-8 w-8 text-gray-600 ${factory.profile_image ? 'hidden' : ''}`} />
          </div>
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
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>납기일: {factory.dueDate}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
              <Clock className="h-3 w-3" />
              <span>{factory.estimatedTime}</span>
            </div>
            <div className="flex items-center space-x-2 font-medium mb-2">
              <Won className="h-4 w-4" />
              <span>{factory.price.toLocaleString()}원</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              총액: {factory.totalPrice.toLocaleString()}원
            </div>
            {factory.status === 'pending' && (
              <Button size="sm" onClick={() => handleSelectFactory(factory.bidId)}>업체 선정</Button>
            )}
            {factory.status === 'selected' && (
              <span className="inline-flex items-center rounded-full bg-green-600 text-white px-2.5 py-0.5 text-xs font-semibold">선정됨</span>
            )}
            {factory.status === 'rejected' && (
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">거절됨</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// 단계별 상세 정보 렌더링 함수
const renderStepDetail = (order: any, stepId: number, getStatusColor: (status: string) => string) => {
  switch (stepId) {
    case 1: // 샘플 제작 업체 선정
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>샘플 제작 업체 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-gray-600">
              주문 코드: #{order.order_id || order.id}
            </div>
            <SampleFactoriesList order={order} onRefresh={order.onRefresh} />
          </CardContent>
        </Card>
      )

    case 2: { // 샘플 생산 현황 (Mongo steps[ index=2 ])
      const step2 = Array.isArray(order.steps) ? order.steps.find((s: any) => s.index === 2) : null
      const stages = Array.isArray(step2?.stage) ? step2.stage : []
      const factoryName = step2?.factory_name || '업체명 미정'
      const orderDate = order.created_at || order.createdAt
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>샘플 생산 현황</CardTitle>
            <CardDescription>
              <div className="flex justify-between items-center">
                <span>주문 코드: {order.order_id || order.id}</span>
                <span>업체명: {factoryName}</span>
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
                    <span>{orderDate ? new Date(orderDate).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">연락처:</span>
                    <span>{step2?.factory_contact || '-'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">생산 공정</h4>
                <div className="space-y-3">
                  {stages.map((process: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(process.status || 'pending')}`} />
                      <span className="flex-1 text-sm">{process.name || '-'}</span>
                      {process.status === 'done' && process.end_date && (
                        <span className="text-xs text-gray-500">{process.end_date}</span>
                      )}
                      {process.status === 'active' && <span className="inline-flex items-center rounded-full bg-blue-600 text-white px-2 py-0.5 text-[10px] font-semibold">진행중</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    case 4: { // 샘플 피드백 (Mongo steps[ index=4 ])
      const step4 = Array.isArray(order.steps) ? order.steps.find((s: any) => s.index === 4) : null
      const items = Array.isArray(step4?.feedback_history) ? step4.feedback_history : []
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>샘플 피드백</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">피드백 내역이 없습니다.</div>
              )}
              {items.map((fb: any) => (
                <div key={fb.id || fb.index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <img
                        src={fb.image_url || "/placeholder.svg?height=150&width=150"}
                        alt={fb.title || '샘플 사진'}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{fb.title || '피드백'}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3" />
                          <span>{fb.factory_contact || '-'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3" />
                          <span>{fb.factory_address || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">상태:</span>
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium">{fb.status || '-'}</span>
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
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }
    case 3: { // 샘플 생산 배송 조회
      const step3 = Array.isArray(order.steps) ? order.steps.find((s: any) => s.index === 3) : null
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>샘플 생산 배송 조회</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex justify-between"><span className="text-gray-600">제품명:</span><span>{step3?.product_name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">수량:</span><span>{step3?.product_quantity || '-'}</span></div>
              </div>
              <div>
                <div className="flex justify-between"><span className="text-gray-600">업체명:</span><span>{step3?.factory_name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">연락처:</span><span>{step3?.factory_contact || '-'}</span></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>배송 상태: {step3?.delivery_status || '-'}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium">운송장: {step3?.delivery_code || '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
    case 5: { // 본 생산 업체 선정
      const step5 = Array.isArray(order.steps) ? order.steps.find((s: any) => s.index === 5) : null
      const list = Array.isArray(step5?.factory_list) ? step5.factory_list : []
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>본 생산 업체 선정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {list.length === 0 && <div className="text-gray-500">입찰 내역이 없습니다.</div>}
              {list.map((f: any, i: number) => (
                <div key={f.id || f.factory_id || i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Factory className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{f.name || '-'}</div>
                      <div className="text-xs text-gray-500">{f.contact || '-'}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div>단가: {f.work_price ? Number(f.work_price).toLocaleString() : '-'}원</div>
                    <div>작업기간: {f.work_duration || '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }
    case 6: { // 본 생산 현황
      const step6 = Array.isArray(order.steps) ? order.steps.find((s: any) => s.index === 6) : null
      const stages = Array.isArray(step6?.stage) ? step6.stage : []
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>본 생산 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stages.map((p: any, i: number) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(p.status || 'pending')}`} />
                  <span className="flex-1 text-sm">{p.name || '-'}</span>
                  {p.status === 'done' && p.end_date && <span className="text-xs text-gray-500">{p.end_date}</span>}
                  {p.status === 'active' && <span className="inline-flex items-center rounded-full bg-blue-600 text-white px-2 py-0.5 text-[10px] font-semibold">진행중</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }
    case 7: { // 본 생산 배송 조회
      const step7 = Array.isArray(order.steps) ? order.steps.find((s: any) => s.index === 7) : null
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>본 생산 배송 조회</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex justify-between"><span className="text-gray-600">제품명:</span><span>{step7?.product_name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">수량:</span><span>{step7?.product_quantity || '-'}</span></div>
              </div>
              <div>
                <div className="flex justify-between"><span className="text-gray-600">업체명:</span><span>{step7?.factory_name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">연락처:</span><span>{step7?.factory_contact || '-'}</span></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>배송 상태: {step7?.delivery_status || '-'}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium">운송장: {step7?.delivery_code || '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

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

export default function DesignerOrdersPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)

  const fetchOrders = async () => {
    try {
  const response = await manufacturingApi.getOrders({ page: 1, page_size: 200 })
  const ordersData = (response as any)?.results ?? (Array.isArray(response) ? response : [])
      const userOrders = Array.isArray(ordersData) ? ordersData
        .filter(order => {
          // API 정규화 결과: designer_id 보유. product/productInfo 미포함.
          if (typeof order?.designer_id === 'number' && typeof user?.id === 'number') return order.designer_id === user.id
          return String(order?.designer_id) === String(user?.id)
        })
        .map(order => ({
          ...order,
          currentStep: getOrderCurrentStep(order),
          timelineSteps: getOrderSteps(order),
          onRefresh: fetchOrders,
        })) : []
      setOrders(userOrders)
      // 선택된 주문이 있으면 최신 객체로 재매칭
      if (selectedOrder) {
        const refreshed = userOrders.find(o => (o.order_id || o.id) === (selectedOrder.order_id || selectedOrder.id))
        if (refreshed) {
          setSelectedOrder(refreshed)
          setSelectedStep(getOrderCurrentStep(refreshed))
        }
      }
    } catch (error) {
      console.error('주문 데이터 로딩 실패:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const handleShowQuote = (order: any) => {
    setSelectedOrder(order)
    setShowQuoteModal(true)
  }

  // Mongo designer_orders.current_step_index 기반 현재 단계 계산(백엔드에서 내려줌)
  const getOrderCurrentStep = (order: any) => {
  const idx = order.current_step_index || order.currentStep || order.current_step || 1
    const n = Number(idx)
    return Number.isFinite(n) && n > 0 ? Math.min(Math.max(1, n), 7) : 1
  }

  // 주문 단계 정보 생성
  const getOrderSteps = (order: any) => {
    const currentStep = getOrderCurrentStep(order)
    const created = order.order_date || order.created_at || order.createdAt || null
    const updated = order.last_updated || order.updated_at || order.updatedAt || null
    return [
      { id: 1, name: "샘플 제작 업체 선정", status: currentStep > 1 ? "done" : currentStep === 1 ? "active" : "pending", completedAt: currentStep > 1 ? created : null },
      { id: 2, name: "샘플 생산 현황", status: currentStep > 2 ? "done" : currentStep === 2 ? "active" : "pending", completedAt: currentStep > 2 ? updated : null },
      { id: 3, name: "샘플 생산 배송 조회", status: currentStep > 3 ? "done" : currentStep === 3 ? "active" : "pending", completedAt: null },
      { id: 4, name: "샘플 피드백", status: currentStep > 4 ? "done" : currentStep === 4 ? "active" : "pending", completedAt: null },
      { id: 5, name: "본 생산 업체 선정", status: currentStep > 5 ? "done" : currentStep === 5 ? "active" : "pending", completedAt: null },
      { id: 6, name: "본 생산 현황", status: currentStep > 6 ? "done" : currentStep === 6 ? "active" : "pending", completedAt: null },
      { id: 7, name: "본 생산 배송 조회", status: currentStep >= 7 ? "done" : "pending", completedAt: currentStep >= 7 ? updated : null },
    ]
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
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-black hover:text-gray-700 transition-colors mr-4"
              >
                <img src="/FabLink_logo.png" alt="FabLink" className="h-12 w-auto" />
                <span className="sr-only">FabLink</span>
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
              디자이너: {user?.name || user?.user_id || 'Unknown'}
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
          {orders.map((order: any, idx: number) => (
                        <div
                          key={order.order_id || order.id || idx}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            (selectedOrder && ((selectedOrder.order_id||selectedOrder.id)===(order.order_id||order.id))) ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedOrder(order)
                            setSelectedStep(getOrderCurrentStep(order))
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{order.product_name || order.product?.name || order.productInfo?.name || '제품명 없음'}</h4>
                            <span className="text-xs inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold bg-transparent">
                              {order.quantity}개
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">주문코드: {order.order_id || order.id}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{(order.order_date || order.created_at || order.createdAt) ? new Date(order.order_date || order.created_at || order.createdAt).toLocaleDateString() : '날짜 정보 없음'}</span>
                            <Progress value={(getOrderCurrentStep(order) / 7) * 100} className="w-16 h-2" />
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
            <CardTitle>{selectedOrder.product_name || selectedOrder.product?.name || selectedOrder.productInfo?.name || '제품명 없음'}</CardTitle>
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
              <p className="font-medium">{(selectedOrder.order_date || selectedOrder.created_at || selectedOrder.createdAt) ? new Date(selectedOrder.order_date || selectedOrder.created_at || selectedOrder.createdAt).toLocaleDateString() : '날짜 정보 없음'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">진행률:</span>
                          <p className="font-medium">{getOrderCurrentStep(selectedOrder)}/7 단계</p>
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
                        {selectedOrder.timelineSteps?.map((step: any, index: number) => {
                          const currentStep = getOrderCurrentStep(selectedOrder)
                          const Icon = getStepIcon(step.id)
                          const isClickable = step.id <= currentStep

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
                                  {step.status === "active" && <span className="inline-flex items-center rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-xs font-semibold">진행중</span>}
                                  {step.status === "done" && <span className="inline-flex items-center rounded-full bg-green-600 text-white px-2.5 py-0.5 text-xs font-semibold">완료</span>}
                                  {step.status === "pending" && <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-gray-600">대기</span>}
                                  {isClickable && <Eye className="h-4 w-4 text-gray-400" />}
                                </div>
                              </div>

                              {/* Step Detail */}
                              {selectedStep === step.id && renderStepDetail(selectedOrder, step.id, getStatusColor)}

                              {/* Connector Line */}
                              {index < selectedOrder.timelineSteps.length - 1 && <div className="ml-5 w-0.5 h-4 bg-gray-200" />}
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
                주문번호: {selectedOrder?.order_id}
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
                      </div>
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