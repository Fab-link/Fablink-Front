"use client"

import { useEffect, useRef, useState } from "react"
// React 타입 선언이 설치되지 않은 환경에서도 JSX 오류를 방지하기 위한 최소 IntrinsicElements 선언
// (빌드 환경에 @types/react 설치 후 제거 가능)
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IntrinsicElements { [elemName: string]: any }
  }
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ClipboardList, Package, Truck, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { manufacturingApi } from "@/lib/api/manufacturing"
import { apiClient } from "@/lib/api/client"
import { useAuthContext } from "@/contexts/AuthContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"

type StageItem = {
  index: number
  name: string
  status?: string
  end_date?: string
  delivery_code?: string
}
type StepItem = {
  index: number
  name: string
  status?: string
  end_date?: string
  stage?: StageItem[]
}

type FactoryOrderItem = {
  order_id: string
  phase: string
  factory_id: string
  overall_status: string
  due_date?: string | null
  quantity?: number | null
  work_price?: number | null
  last_updated: string
  product_id?: string | null
  product_name?: string
  designer_id?: string | null
  designer_name?: string
  factory_name?: string
  steps?: StepItem[]
  current_step_index?: number
}

export default function FactoryOrdersPage() {
  const { toast } = useToast()
  const { isAuthenticated, isLoading, login } = useAuthContext()
  const [items, setItems] = useState<FactoryOrderItem[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugSummary, setDebugSummary] = useState<any | null>(null)
  const [progressOrderId, setProgressOrderId] = useState<string | null>(null)
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailDoc, setDetailDoc] = useState<any | null>(null)
  const [progressSubmitting, setProgressSubmitting] = useState(false)
  // stage 토글 상태 (step index 기준) - 단계별 펼침/접힘
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())
  // stage 토글 상태 제거 (항상 표시)
  // 재시도/재요청 제어 상태
  const [firstPageAttempts, setFirstPageAttempts] = useState(0)
  const [needRetry, setNeedRetry] = useState(false)
  const [lastCount, setLastCount] = useState<number | null>(null)
  const [firstPageLoaded, setFirstPageLoaded] = useState(false)

  const pageSize = 20

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadedPagesRef = useRef<Set<number>>(new Set())
  const debugRef = useRef<string | null>(null) // 마지막으로 사용한 debug 파라미터 값 추적

  const loadPage = async (nextPage: number) => {
    // 인증되지 않은 상태에서 첫 페이지 로드는 지연
    if (nextPage === 1 && !isAuthenticated) return
    if (loading) return

    // 현재 URL의 debug 파라미터 확인
    let debugParam: string | null = null
    try {
      const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost')
      debugParam = url.searchParams.get('debug')
    } catch {}

    // debug 값이 바뀌었다면 페이지 캐시 초기화 및 1페이지부터 재시작
    if (debugRef.current !== (debugParam || null)) {
      loadedPagesRef.current.clear()
      debugRef.current = debugParam || null
      // 1페이지 요청으로 강제
      nextPage = 1
    }

    // 동일 페이지 중복 요청 방지
    if (loadedPagesRef.current.has(nextPage)) return
    loadedPagesRef.current.add(nextPage)

    setLoading(true)
    setError(null)
    try {
      const res = await manufacturingApi.getFactoryOrdersMongo({ page: nextPage, page_size: pageSize, debug: debugParam || undefined })
      if (nextPage === 1) {
        setLastCount(typeof res.count === 'number' ? res.count : null)
        setNeedRetry(false)
  setFirstPageAttempts((a: number) => a === 0 ? 1 : a) // 최초 성공 시 1로 기록 (0은 아직 미시도 의미)
  setFirstPageLoaded(true)
      }
  setItems((prev: FactoryOrderItem[]) => {
        const base = nextPage === 1 ? [] : prev
        const map = new Map<string, FactoryOrderItem>()
        const keyOf = (o: FactoryOrderItem) => `${o.order_id || ''}-${o.phase || ''}-${o.factory_id || ''}`
        const normalizeItem = (raw: any): FactoryOrderItem => {
          const csiRaw = raw.current_step_index ?? raw.currentStepIndex
          let csi: number | undefined = undefined
          if (csiRaw !== undefined && csiRaw !== null && csiRaw !== '') {
            const n = typeof csiRaw === 'string' ? parseInt(csiRaw, 10) : csiRaw
            if (!isNaN(n)) csi = n
          }
          const steps: StepItem[] | undefined = Array.isArray(raw.steps)
            ? raw.steps.map((s: any) => ({
                index: s.index,
                name: s.name,
                status: s.status,
                end_date: s.end_date ?? s.endDate,
                stage: Array.isArray(s.stage)
                  ? s.stage.map((st: any, i: number) => ({
                      index: st.index ?? i + 1,
                      name: st.name,
                      status: st.status,
                      end_date: st.end_date ?? st.endDate,
                      delivery_code: st.delivery_code ?? st.deliveryCode,
                    }))
                  : undefined,
              }))
            : undefined
          return {
            order_id: raw.order_id,
            phase: raw.phase,
            factory_id: raw.factory_id,
            overall_status: raw.overall_status,
            due_date: raw.due_date ?? raw.dueDate ?? null,
            quantity: raw.quantity,
            work_price: raw.work_price ?? raw.workPrice,
            last_updated: raw.last_updated ?? raw.lastUpdated,
            product_id: raw.product_id ?? raw.productId ?? null,
            product_name: raw.product_name ?? raw.productName ?? '',
            designer_id: raw.designer_id ?? raw.designerId ?? null,
            designer_name: raw.designer_name ?? raw.designerName ?? '',
            factory_name: raw.factory_name ?? raw.factoryName ?? raw.factory?.name ?? raw.factory?.username ?? '',
            steps,
            current_step_index: csi,
          }
        }
        for (const it of base as FactoryOrderItem[]) map.set(keyOf(it), it)
        for (const it of (res.results || []) as FactoryOrderItem[]) map.set(keyOf(it), normalizeItem(it))
        const arr = Array.from(map.values())
        const parseOrderId = (v: string | undefined) => {
          if (!v) return NaN
          // 숫자만 추출 후 숫자 비교 (전부 숫자면), 아니면 NaN
          const numStr = v.match(/\d+/)?.[0]
          if (!numStr) return NaN
            const n = Number(numStr)
          return isNaN(n) ? NaN : n
        }
        arr.sort((a, b) => {
          const na = parseOrderId(a.order_id)
          const nb = parseOrderId(b.order_id)
          if (!isNaN(na) && !isNaN(nb) && na !== nb) return nb - na // 숫자 기반 내림차순
          // fallback: 문자열 전체 비교 (내림차순)
          return (b.order_id || '').localeCompare(a.order_id || '')
        })
        return arr
      })
      setHasNext(res.has_next)
      setPage(res.page)
      if ((res as any).debug_summary) setDebugSummary((res as any).debug_summary)
  } catch (e: any) {
      // 첫 페이지 실패 시 로드 플래그 해제하여 재시도 가능
      if (nextPage === 1) {
        loadedPagesRef.current.delete(1)
        // 재시도 조건 플래그 세팅 (권한/네트워크/시간초과/토큰 관련 키워드)
        const msg = (e?.message || '').toLowerCase()
        if (firstPageAttempts < 3 && (
          msg.includes('권한') || msg.includes('token') || msg.includes('auth') || msg.includes('네트워크') || msg.includes('network') || msg.includes('timeout') || msg.includes('요청 시간을 초과')
        )) {
          setNeedRetry(true)
        }
      } else {
        loadedPagesRef.current.delete(nextPage)
      }
      setError(e?.message || '목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 최초 마운트 후 인증 완료시 로드 (race condition 방지)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      loadPage(1)
    }
    // 인증 안 된 상태에서 이미 한 번 실패했을 수 있으므로, auth 확정 시 재시도
  }, [isAuthenticated, isLoading])

  // 초기 실패 재시도(backoff 최대 3회)
  useEffect(() => {
    if (!isAuthenticated || isLoading) return
    if (!needRetry) return
    if (firstPageAttempts >= 3) return
    const attempt = firstPageAttempts + 1
    const delay = 400 * attempt // 점증 backoff
    const timer = setTimeout(() => {
      setFirstPageAttempts(attempt)
      loadPage(1)
    }, delay)
    return () => clearTimeout(timer)
  }, [needRetry, firstPageAttempts, isAuthenticated, isLoading])

  // count=0 & steps 아직 안 올라온 레이스 완충: 첫 성공(count=0) 직후 한 번만 재확인 (document 생성 지연 대비)
  useEffect(() => {
    if (!isAuthenticated || isLoading) return
    if (firstPageAttempts === 0) return // 아직 성공 fetch 없음
    if (lastCount !== 0) return // 0이 아닐 때는 skip
    if (firstPageAttempts >= 2) return // 이미 한 번 재확인 수행
    const timer = setTimeout(() => {
      // 재확인: loadedPagesRef 초기화 후 다시 1페이지 호출
      loadedPagesRef.current.delete(1)
      loadPage(1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [lastCount, firstPageAttempts, isAuthenticated, isLoading])

  useEffect(() => {
    if (!sentinelRef.current) return
    if (!firstPageLoaded) return // 첫 페이지 미로드 시 추가 페이지 로드 금지
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
  }, [hasNext, loading, page, firstPageLoaded])

  const getStatusBadge = (status: string) => {
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
    switch (status) {
      case 'confirmed':
        return <span className={`${base} bg-blue-100 text-blue-800`}>주문 확인</span>
      case 'in_production':
        return <span className={`${base} bg-yellow-100 text-yellow-800`}>생산 중</span>
      case 'completed':
        return <span className={`${base} bg-green-100 text-green-800`}>생산 완료</span>
      case 'done': // 새로운 완료 상태(backend 변경)
        return <span className={`${base} bg-green-100 text-green-800`}>생산 완료</span>
      case 'shipped':
        return <span className={`${base} bg-purple-100 text-purple-800`}>배송 중</span>
      default:
        return <span className={`${base} bg-gray-200 text-gray-700`}>알 수 없음</span>
    }
  }

  const renderPhaseBadge = (phase?: string) => {
    const label = phase === 'main' ? '생산' : '샘플'
    return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">{label}</span>
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

  const fetchDetail = async (orderId: string) => {
    setDetailLoading(true)
    try {
      const doc = await manufacturingApi.getMongoOrder(orderId)
      const csiRaw = doc.current_step_index ?? doc.currentStepIndex
      let csi = csiRaw
      if (csiRaw !== undefined && csiRaw !== null && csiRaw !== '') {
        const n = typeof csiRaw === 'string' ? parseInt(csiRaw, 10) : csiRaw
        if (!isNaN(n)) csi = n
      }
      const listItem = items.find((i: FactoryOrderItem) => i.order_id === orderId)
      const formatKST = (d?: string) => {
        if (!d) return ''
        const date = new Date(d)
        if (isNaN(date.getTime())) return ''
        const parts = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date)
        const get = (t: string) => parts.find(p => p.type === t)?.value || ''
        return `${get('year')}.${get('month')}.${get('day')} ${get('hour')}:${get('minute')}`
      }
      setDetailDoc({
        ...doc,
        current_step_index: csi,
        phase: doc.phase, // 원본 유지
        product_name: doc.product_name || doc.productName || listItem?.product_name || '',
        designer_name: doc.designer_name || doc.designerName || listItem?.designer_name || '',
        factory_name: doc.factory_name || doc.factoryName || doc.factory?.name || doc.factory?.username || (listItem as any)?.factory_name || (doc.factory_id ? `공장 ${doc.factory_id}` : ''),
        last_updated_formatted: formatKST(doc.last_updated || doc.lastUpdated || doc.updated_at || doc.updatedAt),
        steps: Array.isArray(doc.steps)
          ? doc.steps.map((s: any) => ({
              index: s.index,
              name: s.name,
              status: s.status,
              end_date: s.end_date ?? s.endDate,
              stage: Array.isArray(s.stage)
                ? s.stage.map((st: any, i: number) => ({
                    index: st.index ?? i + 1,
                    name: st.name,
                    status: st.status,
                    end_date: st.end_date ?? st.endDate,
                    delivery_code: st.delivery_code ?? st.deliveryCode,
                  }))
                : undefined,
            }))
          : doc.steps,
      })
    } catch (e: any) {
      const fallback = items.find((i: FactoryOrderItem) => i.order_id === orderId)
      setDetailDoc(fallback || null)
    } finally {
      setDetailLoading(false)
    }
  }

  const openProgress = (orderId: string) => { setProgressOrderId(orderId); fetchDetail(orderId) }
  const openDetail = (orderId: string) => { setDetailOrderId(orderId); fetchDetail(orderId) }
  const closeProgress = () => { setProgressOrderId(null); setDetailDoc(null) }
  const closeDetail = () => { setDetailOrderId(null); setDetailDoc(null) }

  // 공통 정규화 (camelCase/snakeCase 통일 + stage endDate->end_date)
  const normalizeDoc = (doc: any) => {
    if (!doc) return doc
    const order_id = doc.order_id ?? doc.orderId
    const steps = Array.isArray(doc.steps)
      ? doc.steps.map((s: any) => ({
          index: s.index,
          name: s.name,
          status: s.status,
          end_date: s.end_date ?? s.endDate ?? '',
          stage: Array.isArray(s.stage)
            ? s.stage.map((st: any, i: number) => ({
                index: st.index ?? i + 1,
                name: st.name,
                status: st.status,
                end_date: st.end_date ?? st.endDate ?? '',
                delivery_code: st.delivery_code ?? st.deliveryCode,
              }))
            : undefined,
        }))
      : undefined
    return {
      ...doc,
      order_id,
      current_step_index: doc.current_step_index ?? doc.currentStepIndex ?? 1,
      steps,
    }
  }

  const completeStep = async (stepIndex: number) => {
    if (!detailDoc) return
    setProgressSubmitting(true)
    try {
      const updated = await manufacturingApi.updateMongoOrderProgress(detailDoc.order_id, stepIndex)
      setDetailDoc(updated)
      setItems((prev: FactoryOrderItem[]) => prev.map((it: FactoryOrderItem) => it.order_id === updated.order_id ? {
        ...it,
        current_step_index: updated.current_step_index,
        overall_status: updated.overall_status,
        steps: Array.isArray(updated.steps) ? updated.steps.map((s: any) => ({
          index: s.index,
          name: s.name,
          status: s.status,
          end_date: s.end_date,
          stage: Array.isArray(s.stage) ? s.stage.map((st: any, i: number) => ({
            index: st.index ?? i + 1,
            name: st.name,
            status: st.status,
            end_date: st.end_date,
            delivery_code: st.delivery_code,
          })) : undefined,
        })) : it.steps,
        last_updated: updated.last_updated,
      } : it))
      toast({ title: '단계 완료', description: `단계 ${stepIndex} 완료 처리되었습니다.` })
    } catch (e: any) {
      const msg = (e?.response?.data?.detail) || (e?.message) || '업데이트 실패'
      toast({ title: '완료 실패', description: msg })
    } finally { setProgressSubmitting(false) }
  }

  const completeStage = async (stepIndex: number, stageIndex: number) => {
    if (!detailDoc) return
    setProgressSubmitting(true)
    try {
      const effectiveOrderId = detailDoc.order_id || (detailDoc as any).orderId
      if (!effectiveOrderId) {
        toast({ title: '오류', description: 'order_id 를 찾을 수 없습니다. 새로고침 후 다시 시도하세요.' })
        setProgressSubmitting(false)
        return
      }
      // apiClient 활용 (기본 baseUrl + 인증 헤더)
      let updatedRaw: any
      try {
        updatedRaw = await apiClient.patch(`/manufacturing/orders-mongo/${effectiveOrderId}/progress/`, { complete_step_index: stepIndex, complete_stage_index: stageIndex })
      } catch (err: any) {
        const msg = err?.message || ''
        if (msg.includes('404')) {
          toast({ title: '진행 문서 없음', description: '주문 문서를 찾을 수 없습니다. 목록을 새로고침 후 재시도하세요.' })
        } else if (msg.includes('403')) {
          toast({ title: '권한 오류', description: '이 주문에 대한 권한이 없습니다.' })
        } else if (msg.includes('current_step_index')) {
          toast({ title: '순서 오류', description: '현재 진행중인 단계만 완료할 수 있습니다.' })
        } else if (msg.includes('stage')) {
          toast({ title: 'Stage 처리 실패', description: msg })
        } else {
          toast({ title: 'Stage 완료 실패', description: msg })
        }
        setProgressSubmitting(false)
        return
      }
      const updated = normalizeDoc(updatedRaw)
      setDetailDoc(updated)
      setItems((prev: FactoryOrderItem[]) => prev.map((it: FactoryOrderItem) => it.order_id === updated.order_id ? {
        ...it,
        current_step_index: updated.current_step_index,
        overall_status: updated.overall_status,
        steps: Array.isArray(updated.steps) ? updated.steps.map((s: any) => ({
          index: s.index,
          name: s.name,
          status: s.status,
          end_date: s.end_date,
          stage: s.stage,
        })) : it.steps,
        last_updated: updated.last_updated,
      } : it))
      toast({ title: 'Stage 완료', description: `Stage ${stageIndex} 완료 처리되었습니다.` })
    } catch (e: any) {
      toast({ title: 'Stage 완료 실패', description: e.message || '오류' })
    } finally { setProgressSubmitting(false) }
  }

  // 토글 제거 (항상 stage 목록 전개)

  const toggleExpand = (stepIdx: number) => {
  setExpandedSteps((prev: Set<number>) => {
      const next = new Set(prev)
      if (next.has(stepIdx)) next.delete(stepIdx); else next.add(stepIdx)
      return next
    })
  }

  const renderStepRow = (s: any, currentIdx: number, displayIndex: number, currentStepIndex: number) => {
    // UI 규칙: current_step_index 보다 작은 step 은 end_date 없더라도 완료로 표시
    const logicallyCompleted = s.index < currentStepIndex
    const isCompleted = !!s.end_date || logicallyCompleted
    const isCurrent = !isCompleted && s.index === currentIdx
    const formatEnd = (d?: string) => {
      if (!d) return ''
      const date = new Date(d)
      if (isNaN(date.getTime())) return ''
      // 한국시간 변환
      const parts = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(date)
      const get = (type: string) => parts.find(p => p.type === type)?.value || ''
      const yyyy = get('year'); const mm = get('month'); const dd = get('day');
      const hh = get('hour'); const mi = get('minute')
      return `${yyyy}.${mm}.${dd} ${hh}:${mi}`
    }
    const completedAt = isCompleted && s.end_date ? formatEnd(s.end_date) : ''
    const statusBadge = isCompleted ? (
      <span className="flex items-center gap-1 text-xs font-medium text-green-700">
        {completedAt && <span className="text-[10px] font-normal text-green-600 bg-green-50 border border-green-200 px-1 py-0.5 rounded">{completedAt}</span>}
        <CheckCircle2 className="h-4 w-4" />
        <span>완료</span>
      </span>
    ) : isCurrent ? (
      <span className="text-xs font-medium text-blue-700 flex items-center space-x-1"><Clock className="h-4 w-4" /><span>진행중</span></span>
    ) : (
      <span className="text-xs text-gray-500">대기</span>
    )
    const canCompleteStep = isCurrent && !s.stage && !progressSubmitting
    const hasStages = Array.isArray(s.stage) && s.stage.length > 0
    // 기본: 현재 단계는 자동 펼침, 아니면 토글 상태 따름
    const expanded = hasStages ? (expandedSteps.has(s.index) || s.index === currentIdx) : false
    const handleHeaderClick = () => {
      if (!hasStages) return
      toggleExpand(s.index)
    }
    return (
      <div key={s.index} className={`rounded border px-3 py-2 mb-3 ${isCompleted ? 'bg-green-50 border-green-200' : isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white'} `}>
        <div className={`flex items-center justify-between select-none ${hasStages ? 'cursor-pointer' : ''}`} onClick={handleHeaderClick}>
          <div className="flex flex-col">
            <span className="text-sm font-medium flex items-center gap-1">{displayIndex}. {s.name || (s.index === 2 ? '샘플 생산 현황' : '단계')}</span>
            {/* 완료 시간은 statusBadge 내 pill 로만 표시 (요청에 따라 하단 라인 제거) */}
          </div>
          <div className="flex items-center space-x-3">
            {statusBadge}
            {canCompleteStep && <Button size="xs" variant="outline" className="h-7 px-2 gap-1" onClick={(e: any) => { e.stopPropagation(); completeStep(s.index) }}><CheckCircle2 className="h-3.5 w-3.5"/>완료</Button>}
          </div>
        </div>
        {hasStages && expanded && (
          <div className="mt-2 ml-2 border-l pl-4">
            {s.stage.map((st: any, i: number) => {
              const stageCompleted = !!st.end_date
              const pendingStages = s.stage.filter((x: any) => !x.end_date).map((x: any) => x.index)
              const lowestPending = pendingStages.length ? Math.min(...pendingStages) : null
              const showComplete = !stageCompleted && st.index === lowestPending && s.index === currentIdx && !progressSubmitting
              const stageCompletedAt = stageCompleted ? ((): string => {
                const date = new Date(st.end_date)
                if (isNaN(date.getTime())) return ''
                const parts = new Intl.DateTimeFormat('ko-KR', {
                  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
                }).formatToParts(date)
                const get = (type: string) => parts.find(p => p.type === type)?.value || ''
                return `${get('year')}.${get('month')}.${get('day')} ${get('hour')}:${get('minute')}`
              })() : ''
              return (
                <div key={st.index} className={`flex items-center justify-between mb-2 rounded px-2 py-1 text-xs ${stageCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-50'} `}>
                  <div className="flex flex-col">
                    <span className="font-medium">Stage {st.index}. {st.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {stageCompleted && stageCompletedAt && (
                      <span className="text-[10px] font-normal text-green-700 bg-green-50 border border-green-200 px-1 py-0.5 rounded">{stageCompletedAt}</span>
                    )}
                    {stageCompleted ? <span className="text-green-700 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1"/>완료</span> : s.index === currentIdx ? <span className="text-blue-600">진행중</span> : <span className="text-gray-500">대기</span>}
                    {showComplete && <Button size="xs" variant="outline" className="h-6 px-2 gap-1" onClick={() => completeStage(s.index, st.index)}><CheckCircle2 className="h-3 w-3"/>완료</Button>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
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
        {!isLoading && !isAuthenticated && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md text-sm text-red-700">
            이 페이지는 공장 계정으로 로그인해야 합니다. 상단 메뉴에서 로그인 후 다시 시도하세요.
          </div>
        )}
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
          {items.map((order: FactoryOrderItem, idx: number) => {
            const isDone = order.overall_status === 'done' || order.overall_status === 'completed'
            return (
            <Card key={makeKey(order, idx)} className={`hover:shadow-lg transition-shadow ${isDone ? 'bg-green-50 border border-green-200' : 'bg-white'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center flex-wrap gap-2">
                      <span className="font-semibold text-gray-900">{order.product_name ? order.product_name : (order.order_id ? `주문 ${order.order_id}` : '주문')}</span>
                      {(() => {
                        const csi = order.current_step_index ?? 1
                        const isSample = (order.phase === 'sample' && csi < 5) || (order.phase !== 'main' && csi < 5)
                        const cls = isSample
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                        return (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium shadow-sm ${cls}`}>
                            {isSample ? '샘플' : '생산'}
                          </span>
                        )
                      })()}
                      {(() => {
                        const csi = order.current_step_index || 1
                        const steps = order.steps || []
                        let found = steps.find(s => s.index === csi)
                        if (!found && steps.length) {
                          found = steps.find(s => !s.end_date) || steps[steps.length - 1]
                        }
                        let stepName = found?.name?.trim() || ''
                        if (!stepName && csi === 2) stepName = '샘플 생산'
                        if (!stepName) stepName = '-'
                        return (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-300 shadow-sm">
                            {stepName}
                          </span>
                        )
                      })()}
                      {(() => {
                        const st = order.overall_status
                        if (!st) return null
                        const map: Record<string, { label: string; cls: string }> = {
                          confirmed: { label: '주문 확인', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
                          in_production: { label: '생산 중', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
                          done: { label: '완료', cls: 'bg-green-100 text-green-700 border-green-200' },
                          completed: { label: '완료', cls: 'bg-green-100 text-green-700 border-green-200' },
                          shipped: { label: '배송 중', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
                        }
                        const entry = map[st] || { label: st, cls: 'bg-slate-100 text-slate-700 border-slate-200' }
                        return (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border shadow-sm ${entry.cls}`}>
                            {entry.label}
                          </span>
                        )
                      })()}
                    </CardTitle>
                    <CardDescription>
                      디자이너: {order.designer_name || '-'}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>수량: {order.quantity ?? '-'}</div>
                    <div>
                      단가: {(() => {
<<<<<<< HEAD
                        const wp = order.work_price
                        if (wp === null || wp === undefined) return '-'
                        const n = typeof wp === 'string' ? Number(wp) : wp
=======
                        const raw = (order as any).work_price
                        if (raw === null || raw === undefined || raw === '') return '-'
                        const n = typeof raw === 'string' ? Number(raw) : raw
>>>>>>> feature/FABLINK-157
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
                    <Button size="sm" onClick={() => openProgress(order.order_id)}>진행 상황 업데이트</Button>
                    <Button variant="outline" size="sm" onClick={() => openDetail(order.order_id)}>상세 보기</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )})}
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
        {/* 진행 상황 업데이트 Dialog (크기 확대) */}
        <Dialog open={!!progressOrderId} onOpenChange={(o: boolean) => { if(!o) closeProgress() }}>
          <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-auto">
            <DialogHeader>
              <DialogTitle>진행 상황 업데이트</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col">
              {detailLoading && <div className="text-sm text-gray-500">불러오는 중...</div>}
              {!detailLoading && detailDoc && (
                <div className="flex flex-col">
                  <div className="text-sm text-gray-600 mb-2">주문 ID: {detailDoc.order_id}</div>
                  <div className="overflow-visible pr-2">
                    {Array.isArray(detailDoc.steps) && detailDoc.steps
                      .filter((s: any) => s.index !== 1) // step1 제거
                      .map((s: any, i: number) => {
                        const reorderedIndex = i + 1 // 표시용 index (step1 제거 후 재번호)
                        return renderStepRow(s, detailDoc.current_step_index || 1, reorderedIndex, detailDoc.current_step_index || 1)
                      })}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeProgress} disabled={progressSubmitting}>닫기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* 상세 보기 Sheet */}
  <Sheet open={!!detailOrderId} onOpenChange={(o: boolean) => { if(!o) closeDetail() }}>
          <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>주문 상세</SheetTitle>
              <SheetDescription>주문 문서 상세 정보</SheetDescription>
            </SheetHeader>
            {detailLoading && <div className="text-sm text-gray-500 mt-4">불러오는 중...</div>}
            {!detailLoading && detailDoc && (
              <div className="mt-4 space-y-6 pb-10">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold flex items-center flex-wrap gap-2">
                    <span>{detailDoc.product_name || `주문 ${detailDoc.order_id}`}</span>
                    {(() => {
                      const csi = detailDoc.current_step_index || 1
                      const phaseIsSample = (detailDoc.phase === 'sample' && csi < 5) || (detailDoc.phase !== 'main' && csi < 5)
                      return (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          {phaseIsSample ? '샘플' : '본 생산'}
                        </span>
                      )
                    })()}
                    {detailDoc.overall_status && (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border shadow-sm ${detailDoc.overall_status === 'done' || detailDoc.overall_status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {detailDoc.overall_status === 'done' || detailDoc.overall_status === 'completed' ? '완료' : detailDoc.overall_status}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-gray-500">마지막 업데이트: {detailDoc.last_updated_formatted || detailDoc.last_updated || '-'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-0.5"><div className="font-medium">주문 ID</div><div>{detailDoc.order_id}</div></div>
                  <div className="space-y-0.5"><div className="font-medium">제품</div><div>{detailDoc.product_name || '-'}</div></div>
                  <div className="space-y-0.5"><div className="font-medium">디자이너</div><div>{detailDoc.designer_name || '-'}</div></div>
                  <div className="space-y-0.5"><div className="font-medium">공장</div><div>{detailDoc.factory_name || '-'}</div></div>
                  <div className="space-y-0.5"><div className="font-medium">수량</div><div>{detailDoc.quantity ?? '-'}</div></div>
                  <div className="space-y-0.5"><div className="font-medium">단가</div><div>{detailDoc.work_price ? Number(detailDoc.work_price).toLocaleString() : '-'}</div></div>
                  <div className="space-y-0.5"><div className="font-medium">납기</div><div>{detailDoc.due_date || '-'}</div></div>
                  <div className="space-y-0.5"><div className="font-medium">현재 단계</div><div>{detailDoc.current_step_index}</div></div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">단계</h3>
                  <div className="max-h-80 overflow-auto pr-1">
                    {Array.isArray(detailDoc.steps) && detailDoc.steps.filter((s: any) => s.index !== 1).map((s: any, i: number) => renderStepRow(s, detailDoc.current_step_index || 1, i + 1, detailDoc.current_step_index || 1))}
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}