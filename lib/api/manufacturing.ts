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
   * 통합 orders 목록 (Mongo) 페이징 조회 (role 기반 필터는 백엔드 처리 가정)
   */
  getOrders: async (params?: { page?: number; page_size?: number; status?: string; debug?: boolean | string }) => {
    const query: Record<string, string> = {}
    if (params?.page) query.page = String(params.page)
    if (params?.page_size) query.page_size = String(params.page_size)
    if (params?.status) query.status = params.status
    if (typeof params?.debug !== 'undefined') {
      const v = String(params.debug).toLowerCase()
      if (['1','true','yes'].includes(v)) query.debug = '1'
    }
  const raw = await apiClient.get<any>('/manufacturing/orders/', query)
    const normalizeItem = (it: any) => {
      if (!it || typeof it !== 'object') return it
      const steps = Array.isArray(it.steps) ? it.steps : []
      // 서버 응답이 productInfo (nested) 형태일 때 내부 필드에서 보조 매핑
      const productInfo = it.productInfo || it.product_info || {}
      return {
        order_id: it.order_id ?? it.orderId,
        product_id: it.product_id ?? it.productId ?? productInfo.id ?? null,
        product_name: it.product_name ?? it.productName ?? productInfo.name ?? '',
        quantity: it.quantity ?? productInfo.quantity,
        designer_id: it.designer_id ?? it.designerId ?? productInfo.designer ?? null,
        designer_name: it.designer_name ?? it.designerName ?? '',
        factory_id: it.factory_id ?? it.factoryId ?? '',
        factory_name: it.factory_name ?? it.factoryName ?? '',
        work_price: it.work_price ?? it.unit_price ?? null,
        current_step_index: it.current_step_index ?? it.currentStepIndex ?? 1,
        overall_status: it.overall_status ?? it.overallStatus ?? '',
        phase: it.phase,
        order_date: it.order_date ?? it.orderDate ?? productInfo.createdAt ?? '',
        due_date: it.due_date ?? it.dueDate ?? productInfo.dueDate ?? '',
        last_updated: it.last_updated ?? it.lastUpdated ?? '',
        steps,
        // 원본 productInfo 보존 (후속 화면에서 추가 정보 사용 가능)
        productInfo: productInfo,
      }
    }
    return {
      count: raw?.count ?? 0,
      page: raw?.page ?? 1,
      page_size: raw?.page_size ?? 20,
      has_next: raw?.has_next ?? false,
      results: Array.isArray(raw?.results) ? raw.results.map(normalizeItem) : [],
      debug_summary: raw?.debug_summary || raw?.debugSummary,
    }
  },

  /**
   * 공장 견적 요청 목록 (RequestOrder 기반)
   * 필터링: sample_pending / product_pending 상태만 백엔드에서 반환
   */
  getFactoryQuotes: async () => {
    const raw = await apiClient.get<any>('/manufacturing/factory/quotes/')
    const list = Array.isArray(raw?.results) ? raw.results : []
    return list.map((o: any) => ({
      ...o,
      orderId: o.order_id ?? o.orderId,
      requestOrderId: o.request_order_id,
      status: o.status,
      quantity: o.quantity,
      createdAt: o.createdAt,
      productInfo: o.productInfo || {},
      customerName: o.customerName,
      customerContact: o.customerContact,
      shippingAddress: o.shippingAddress,
    }))
  },

  // 현재 factory 사용자의 특정 order 에 대한 입찰 존재 여부
  hasFactoryBid: async (orderId: string | number) => {
    return apiClient.get<{has_bid: boolean; bid_id?: number}>(`/manufacturing/bids/has_bid/`, { order_id: String(orderId) })
  },

  // Mongo 단일 주문 조회
  getMongoOrder: async (orderId: string) => {
  const raw = await apiClient.get<any>(`/manufacturing/orders/${orderId}/`)
  return normalizeMongoOrder(raw, orderId)
  },

  // Mongo 진행 단계 완료 업데이트
  updateMongoOrderProgress: async (orderId: string, completeStepIndex: number) => {
  const raw = await apiClient.patch<any>(`/manufacturing/orders/${orderId}/progress/`, { complete_step_index: completeStepIndex })
  return normalizeMongoOrder(raw, orderId)
  },
  // stage 완료는 page.tsx 에서 fetch 직접 호출 (PATCH { complete_step_index, complete_stage_index })

  /**
   * 디자이너 주문 목록 조회
   * @returns 디자이너 주문 목록
   */
  // getDesignerOrders deprecated: unified getOrders 사용

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
    // 루트 백엔드는 unit_price를 기대하므로 work_price가 오면 호환 매핑
    const payload = { ...bidData }
    if (typeof payload.unit_price === 'undefined' && typeof payload.work_price !== 'undefined') {
      payload.unit_price = payload.work_price
    }
    return apiClient.post('/manufacturing/bids/', payload)
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
