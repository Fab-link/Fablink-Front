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
  unit_price?: number;
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
  unit_price: number;
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
    return apiClient.request<ProductData>(`/manufacturing/products/${productId}/`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
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
   * 주문 목록 조회 (공장주용)
   * @returns 주문 목록
   */
  getOrders: async () => {
    return apiClient.get<OrderData[]>('/manufacturing/factory-orders/');
  },

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
    return apiClient.request<OrderData>(`/manufacturing/orders/${orderId}/`, {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
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
    return apiClient.request(`/manufacturing/bids/${bidId}/select/`, {
      method: 'PATCH',
    });
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
