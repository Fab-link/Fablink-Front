import { apiClient } from './client';

// Product 데이터 타입 (필요에 따라 확장)
export interface ProductData {
  id?: number;
  name?: string;
  season?: string;
  target_customer?: string;
  concept?: string;
  fabric?: string;
  material?: string;
  image_path?: File | null;
}

// Order 데이터 타입
export interface OrderData {
  id?: number;
  product: number;
  quantity: number;
  work_price?: number; // (was unit_price)
  customer_name?: string;
  customer_contact?: string;
  shipping_address?: string;
  shipping_method?: string;
  shipping_cost?: number;
  notes?: string;
}

// FactoryBid 데이터 타입
export interface FactoryBidData {
  id?: number;
  order: number;
  factory?: number;
  factory_info?: any;
  work_price: number; // (was unit_price)
  estimated_delivery_days: number;
  notes?: string;
  status?: 'pending' | 'selected' | 'rejected';
  total_price?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * 제조 관련 API 함수 모음
 */
export const manufacturingApi = {
  /**
   * 새로운 Product 생성
   * @param productData 생성할 제품의 초기 데이터
   * @returns 생성된 제품 정보
   */
  createProduct: async (productData: ProductData) => {
    return apiClient.post<ProductData>('/manufacturing/products/', productData);
  },

  /**
   * 기존 Product 정보 업데이트 (파일 포함)
   * @param productId 업데이트할 제품의 ID
   * @param formData 업데이트할 데이터 (FormData 객체)
   * @returns 업데이트된 제품 정보
   */
  updateProduct: async (productId: number, formData: FormData) => {
    return apiClient.uploadFile<ProductData>(`/manufacturing/products/${productId}/`, formData, 'PATCH');
  },
  
  /**
   * 기존 Product 정보 업데이트 (JSON)
   * @param productId 업데이트할 제품의 ID
   * @param productData 업데이트할 데이터
   * @returns 업데이트된 제품 정보
   */
  updateProductJson: async (productId: number, productData: ProductData) => {
  return apiClient.patch<ProductData>(`/manufacturing/products/${productId}/`, productData);
  },

  /**
   * 주문 생성
   * @param orderData 생성할 주문 데이터
   * @returns 생성된 주문 정보
   */
  createOrder: async (orderData: OrderData) => {
    return apiClient.post<OrderData>('/manufacturing/orders/', orderData);
  },

  /**
   * 주문 목록 조회 (공장주용, Django ORM 기반 기존)
   */
  getOrders: async () => {
    return apiClient.get<OrderData[]>('/manufacturing/factory-orders/');
  },

  /**
   * factory_orders 목록 조회 (Mongo, 페이징)
   */
  getFactoryOrdersMongo: async (params?: { page?: number; page_size?: number; phase?: string; status?: string; debug?: boolean | string }) => {
    const query: Record<string, string> = {}
    if (params?.page) query.page = String(params.page)
    if (params?.page_size) query.page_size = String(params.page_size)
    if (params?.phase) query.phase = params.phase
    if (params?.status) query.status = params.status
    if (typeof params?.debug !== 'undefined') {
      const v = String(params.debug).toLowerCase()
      if (v === '1' || v === 'true' || v === 'yes') query.debug = '1'
    }
    const raw = await apiClient.get<any>('/manufacturing/factory-orders-mongo/', query)

    // 일부 환경에서 camelCase로 응답되는 경우를 대비한 정규화
  // Normalize whenever results 배열이 존재 (케이스 혼재 시 일관된 형태 보장)
  const needsNormalize = Array.isArray(raw?.results)
  const normalizeItem = (it: any) => {
    if (!it || typeof it !== 'object') return it
    const steps = Array.isArray(it.steps)
      ? it.steps.map((s: any) => ({
          index: s.index,
          name: s.name,
          status: s.status,
          end_date: s.endDate ?? s.end_date ?? '',
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
      : it.steps
    return {
      order_id: it.order_id ?? it.orderId,
      phase: it.phase,
      factory_id: it.factory_id ?? it.factoryId,
      overall_status: it.overall_status ?? it.overallStatus ?? '',
      due_date: it.due_date ?? it.dueDate ?? null,
      quantity: it.quantity,
      work_price: it.work_price ?? it.workPrice ?? null,
      last_updated: it.last_updated ?? it.lastUpdated,
      product_id: it.product_id ?? it.productId ?? null,
      current_step_index: it.current_step_index ?? it.currentStepIndex ?? 1,
      steps,
      product_name: it.product_name ?? it.productName ?? '',
      designer_id: it.designer_id ?? it.designerId ?? null,
      designer_name: it.designer_name ?? it.designerName ?? '',
    }
  }

  if (needsNormalize) {
      const debug_summary = raw.debug_summary ?? raw.debugSummary
        ? {
            ...(raw.debug_summary ?? {}),
            ...(raw.debugSummary ?? {}),
            items: Array.isArray(raw.debugSummary?.items)
              ? raw.debugSummary.items.map((d: any) => ({
                  order_id: d.order_id ?? d.orderId,
                  factory_id: d.factory_id ?? d.factoryId,
                  phase: d.phase,
                  product_id: d.product_id ?? d.productId,
                  product_name: d.product_name ?? d.productName,
                  designer_id: d.designer_id ?? d.designerId,
                  designer_name: d.designer_name ?? d.designerName,
                  work_price: d.work_price ?? d.workPrice,
                  currency: d.currency,
                  due_date: d.due_date ?? d.dueDate,
                  quantity: d.quantity,
                  overall_status: d.overall_status ?? d.overallStatus,
                  current_step_index: d.current_step_index ?? d.currentStepIndex ?? 1,
                }))
              : raw.debug_summary?.items,
          }
        : undefined

      return {
        count: raw.count,
        page: raw.page,
        page_size: raw.page_size ?? raw.pageSize,
        has_next: raw.has_next ?? raw.hasNext,
        results: Array.isArray(raw.results) ? raw.results.map(normalizeItem) : [],
        ...(debug_summary ? { debug_summary } : {}),
      }
    }

    // 이미 snake_case면 그대로 반환
    return raw
  },

  // Mongo 단일 주문 조회
  getMongoOrder: async (orderId: string) => {
  const raw = await apiClient.get<any>(`/manufacturing/orders-mongo/${orderId}/`)
  return normalizeMongoOrder(raw, orderId)
  },

  // Mongo 진행 단계 완료 업데이트
  updateMongoOrderProgress: async (orderId: string, completeStepIndex: number) => {
  const raw = await apiClient.patch<any>(`/manufacturing/orders-mongo/${orderId}/progress/`, { complete_step_index: completeStepIndex })
  return normalizeMongoOrder(raw, orderId)
  },
  // stage 완료는 page.tsx 에서 fetch 직접 호출 (PATCH { complete_step_index, complete_stage_index })

  /**
   * 디자이너 주문 목록 조회
   * @returns 디자이너 주문 목록
   */
  getDesignerOrders: async () => {
    return apiClient.get<OrderData[]>('/manufacturing/designer-orders/');
  },

  /**
   * 주문 상세 조회
   * @param orderId 주문 ID
   * @returns 주문 상세 정보
   */
  getOrder: async (orderId: number) => {
    return apiClient.get<OrderData>(`/manufacturing/orders/${orderId}/`);
  },

  /**
   * 주문 업데이트
   * @param orderId 업데이트할 주문 ID
   * @param orderData 업데이트할 데이터
   * @returns 업데이트된 주문 정보
   */
  updateOrder: async (orderId: number, orderData: Partial<OrderData>) => {
  return apiClient.patch<OrderData>(`/manufacturing/orders/${orderId}/`, orderData);
  },

  /**
   * 특정 주문에 대한 입찰 목록 조회
   * @param orderId 주문 ID
   * @returns 입찰 목록
   */
  getBidsByOrder: async (orderId: number) => {
    return apiClient.get(`/manufacturing/bids/by_order/?order_id=${orderId}`);
  },

  /**
   * 입찰 선정
   * @param bidId 입찰 ID
   * @returns 선정된 입찰 정보
   */
  selectBid: async (bidId: number) => {
  return apiClient.patch(`/manufacturing/bids/${bidId}/select/`);
  },

  /**
   * 공장 입찰 생성
   * @param bidData 입찰 데이터
   * @returns 생성된 입찰 정보
   */
  createBid: async (bidData: any) => {
    return apiClient.post('/manufacturing/bids/', bidData);
  },
  
  /**
   * 단일 제출: Product -> Order -> RequestOrder 생성(멀티파트)
   */
  submitManufacturing: async (formData: FormData) => {
    return apiClient.uploadFile('/manufacturing/submit/', formData, 'POST');
  },
};

/**
 * 주문 관련 API 함수 모음
 */
export const orderApi = {
  ...manufacturingApi
};

// 단일 Mongo 주문 응답 정규화 (order_id 누락 대비)
function normalizeMongoOrder(raw: any, fallbackOrderId?: string) {
  if (!raw || typeof raw !== 'object') return raw
  const order_id = raw.order_id ?? raw.orderId ?? fallbackOrderId
  const steps = Array.isArray(raw.steps)
    ? raw.steps.map((s: any) => ({
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
    : raw.steps
  return {
    ...raw,
    order_id,
    phase: raw.phase,
    factory_id: raw.factory_id ?? raw.factoryId,
    overall_status: raw.overall_status ?? raw.overallStatus,
    due_date: raw.due_date ?? raw.dueDate,
    quantity: raw.quantity,
    work_price: raw.work_price ?? raw.workPrice,
    last_updated: raw.last_updated ?? raw.lastUpdated,
    product_id: raw.product_id ?? raw.productId,
    product_name: raw.product_name ?? raw.productName,
    designer_id: raw.designer_id ?? raw.designerId,
    designer_name: raw.designer_name ?? raw.designerName,
    current_step_index: raw.current_step_index ?? raw.currentStepIndex ?? 1,
    steps,
  }
}
