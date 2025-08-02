import { apiClient } from './client';

// Product 데이터 타입 (필요에 따라 확장)
export interface ProductData {
  id?: number;
  name?: string;
  season?: string;
  target_customer?: string;
  concept?: string;
  image_path?: File | null;
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
};

export interface QuantityScheduleData {
  size: string;
  quantity: number;
  due_date: string;
}

export const updateQuantitySchedule = async (productId: number, data: QuantityScheduleData) => {
  return apiClient.request<{message: string; data: QuantityScheduleData}>(
    `/manufacturing/products/${productId}/quantity-schedule/`, 
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
};