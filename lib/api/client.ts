import { config, debugLog, isProduction } from '@/lib/config'
import { Tokens } from '@/types/auth'

class ApiClient {
    private apiUrl: string
    private timeout: number
    private defaultHeaders: Record<string, string>

    constructor() {
        this.apiUrl = config.apiUrl
        this.timeout = config.apiTimeout || 60000 // 기본 60초로 증가
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

        debugLog('API Client initialized with base URL:', {
            apiUrl: this.apiUrl,
            timeout: this.timeout,
            env: config.env
        })
    }

    private getAuthHeaders(): Record<string, string> {
        // 세션 스토리지에서 토큰 가져오기 (서버 재시작 시 사라짐)
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
        return {};
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.apiUrl}${endpoint}`

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const config: RequestInit = {
            ...options,
            signal: controller.signal,
            headers: {
                ...this.defaultHeaders,
                ...this.getAuthHeaders(),
                ...options.headers,
            }
        }

        try {
            debugLog('API 요청:', { method: options.method || 'GET', url, headers: config.headers, body: options.body })
            
            const response = await fetch(url, config)
            clearTimeout(timeoutId)

            debugLog('API 응답:', { status: response.status, statusText: response.statusText })

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`
                try {
                    const responseClone = response.clone()
                    const errorData = await responseClone.json()
                    errorMessage = errorData.message || errorData.detail || errorMessage
                    debugLog('API 오류 응답:', errorData)
                } catch {
                    try {
                        const errorText = await response.text()
                        errorMessage = errorText || errorMessage
                    } catch {
<<<<<<< Updated upstream
                        // response body를 읽을 수 없는 경우 기본 메시지 사용
=======
                        // Response body를 읽을 수 없는 경우 기본 메시지 사용
>>>>>>> Stashed changes
                    }
                }
                throw new Error(errorMessage)
            }

            const data = await response.json()
            debugLog('API 성공 응답:', data)
            return data
        } catch (error: any) {
            clearTimeout(timeoutId)
            debugLog('API 요청 실패:', error)
            
            // AbortError 처리
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.')
            }
            
            // 네트워크 오류 처리
            if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
                throw new Error('네트워크 연결을 확인해주세요.')
            }
            
            throw error
        }
    }

    async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        let url = endpoint
        if (params) {
            const searchParams = new URLSearchParams(params)
            url += `?${searchParams.toString()}`
        }
        return this.request<T>(url, { method: 'GET' })
    }

    async post<T>(endpoint: string, body: Record<string, any>): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        })
    }

    async put<T>(endpoint: string, body: Record<string, any>): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        })
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' })
    }

    async uploadFile<T>(endpoint: string, formData: FormData, method: 'POST' | 'PUT' | 'PATCH' = 'POST'): Promise<T> {
        const authHeaders = this.getAuthHeaders()

        debugLog('파일 업로드 요청:', { method, endpoint, authHeaders })
        
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            method: method,
            headers: {
                ...authHeaders,
                // Content-Type을 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
            },
            body: formData
        })

        if (!response.ok) {
            let errorMessage = `File upload failed! status: ${response.status}`
            try {
                const errorData = await response.json()
                errorMessage = errorData.message || errorData.detail || errorMessage
            } catch {
                // JSON 파싱 실패 시 기본 메시지 사용
            }
            throw new Error(errorMessage)
        }

        return await response.json()
    }
}

// singleton instance
export const apiClient = new ApiClient()
