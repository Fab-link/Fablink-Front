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
  customer_email?: string;
  shipping_address?: string;
  shipping_method?: string;
  shipping_cost?: number;
  notes?: string;
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
   * 주문 목록 조회
   * @returns 주문 목록
   */
  getOrders: async () => {
    return apiClient.get<OrderData[]>('/manufacturing/orders/');
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
};

/**
 * 주문 관련 API 함수 모음
 */
export const orderApi = {
  ...manufacturingApi
};
