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
    // FormData를 사용하는 경우, apiClient의 uploadFile 메서드나
    // 별도의 fetch 로직을 사용해야 합니다. 여기서는 일반적인 PATCH를 가정하고,
    // apiClient에 파일 업로드를 위한 메서드가 필요할 수 있습니다.
    // 우선 기존 post 메서드를 활용하되, 실제로는 파일 업로드용 메서드를 호출해야 합니다.
    return apiClient.post<ProductData>(`/manufacturing/products/${productId}/`, formData);
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
