"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ClipboardList, Package, Truck } from "lucide-react"
import Link from "next/link"
import { manufacturingApi } from "@/lib/api/manufacturing"

type FactoryOrderItem = {
  order_id: string
  phase: string
  factory_id: string
  overall_status: string
  due_date?: string | null
  quantity?: number | null
  unit_price?: number | null
  last_updated: string
  product_id?: string | null
  product_name?: string
  designer_id?: string | null
  designer_name?: string
  steps?: Array<{ index: number; name: string; status?: string; end_date?: string }>
}

export default function FactoryOrdersPage() {
  const [items, setItems] = useState<FactoryOrderItem[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugSummary, setDebugSummary] = useState<any | null>(null)

  const pageSize = 20

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadPage = async (nextPage: number) => {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost')
      const debugParam = url.searchParams.get('debug')
      const res = await manufacturingApi.getFactoryOrdersMongo({ page: nextPage, page_size: pageSize, debug: debugParam || undefined })
  setItems((prev: FactoryOrderItem[]) => [...prev, ...res.results])
      setHasNext(res.has_next)
      setPage(res.page)
      if ((res as any).debug_summary) setDebugSummary((res as any).debug_summary)
    } catch (e: any) {
      setError(e?.message || '목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 첫 페이지 로드
    loadPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!sentinelRef.current) return
    const el = sentinelRef.current
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hasNext && !loading) {
          loadPage(page + 1)
        }
      })
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [hasNext, loading, page])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">주문 확인</Badge>
      case 'in_production':
        return <Badge className="bg-yellow-100 text-yellow-800">생산 중</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">생산 완료</Badge>
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800">배송 중</Badge>
      default:
        return <Badge>알 수 없음</Badge>
    }
  }

  const renderPhaseBadge = (phase?: string) => {
    const label = phase === 'main' ? '생산' : '샘플'
    return <Badge className="bg-gray-100 text-gray-800">{label}</Badge>
  }

  const getCurrentStageName = (steps?: FactoryOrderItem['steps']) => {
    if (!steps || !Array.isArray(steps) || steps.length === 0) return '대기'
    // 완료되지 않은 첫 단계 = end_date가 빈 값인 가장 작은 index
    const pending = [...steps]
      .sort((a, b) => (a.index || 0) - (b.index || 0))
      .find(s => !s.end_date)
    if (pending) return pending.name || '진행 중'
    // 모두 완료인 경우 마지막 단계 이름
    return steps[steps.length - 1]?.name || '완료'
  }

  // React key 충돌 방지를 위한 안전 키 생성기
  const makeKey = (o: FactoryOrderItem, idx: number) => {
    const a = o.order_id || o.product_id || o.last_updated || `row${idx}`
    const b = o.phase || 'na'
    const c = o.factory_id || o.designer_id || 'na'
    return `${a}-${b}-${c}-${idx}`
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
            <ClipboardList className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
          </div>
          <p className="text-gray-600 mt-2">진행 중인 주문의 상태를 관리하고 업데이트하세요</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {items.map((order, idx) => (
            <Card key={makeKey(order, idx)} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{order.product_name ? order.product_name : (order.order_id ? `주문 ${order.order_id}` : '주문')}</span>
                      {renderPhaseBadge(order.phase)}
                      {getStatusBadge(order.overall_status || 'confirmed')}
                    </CardTitle>
                    <CardDescription>
                      공정 단계: {getCurrentStageName(order.steps)} • 디자이너: {order.designer_name || '-'}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>수량: {order.quantity ?? '-'}</div>
                    <div>
                      단가: {(() => {
                        const up = order.unit_price
                        if (up === null || up === undefined || up === '') return '-'
                        const n = typeof up === 'string' ? Number(up) : up
                        return isNaN(n) ? '-' : `${n.toLocaleString()}원`
                      })()}
                    </div>
                    <div>납기일: {order.due_date || '-'}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4" />
                      <span>생산 관리</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="h-4 w-4" />
                      <span>배송 준비</span>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <Button size="sm">
                      진행 상황 업데이트
                    </Button>
                    <Button variant="outline" size="sm">
                      상세 보기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {items.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>진행 중인 주문이 없습니다.</p>
                <p className="text-sm">새로운 주문이 들어오면 여기에 표시됩니다.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {debugSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Debug summary</CardTitle>
              <CardDescription>URL에 ?debug=1을 붙였을 때만 보입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(debugSummary, null, 2)}</pre>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="text-red-600 text-sm mt-4">{error}</div>
        )}

        <div ref={sentinelRef} className="h-10" />

        {loading && (
          <div className="text-center text-sm text-gray-500 py-4">불러오는 중…</div>
        )}
      </div>
    </div>
  )
}