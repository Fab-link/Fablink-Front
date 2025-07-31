import { config, debugLog, isProduction } from '@/lib/config'
import { Tokens } from '@/types/auth'

class ApiClient {
    private apiUrl: string
    private timeout: number
    private defaultHeaders: Record<string, string>

    constructor() {
        this.apiUrl = config.apiUrl
        this.timeout = config.apiTimeout
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
        const tokensJson = localStorage.getItem('authTokens')
        if (tokensJson) {
            try {
                const tokens: Tokens = JSON.parse(tokensJson)
                return { Authorization: `Bearer ${tokens.access}` }
            } catch (error) {
                debugLog('토큰 파싱 오류:', error)
                // 잘못된 토큰 데이터 제거
                localStorage.removeItem('authTokens')
            }
        }
        return {}
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
            debugLog('API 요청:', { method: options.method || 'GET', url, headers: config.headers })
            
            const response = await fetch(url, config)
            clearTimeout(timeoutId)

            debugLog('API 응답:', { status: response.status, statusText: response.statusText })

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.message || errorData.detail || errorMessage
                    debugLog('API 오류 응답:', errorData)
                } catch {
                    const errorText = await response.text()
                    errorMessage = errorText || errorMessage
                }
                throw new Error(errorMessage)
            }

            const data = await response.json()
            debugLog('API 성공 응답:', data)
            return data
        } catch (error) {
            clearTimeout(timeoutId)
            debugLog('API 요청 실패:', error)
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

    async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
        const tokensJson = localStorage.getItem('authTokens')
        let authHeaders = {}
        
        if (tokensJson) {
            try {
                const tokens: Tokens = JSON.parse(tokensJson)
                authHeaders = { Authorization: `Bearer ${tokens.access}` }
            } catch (error) {
                debugLog('파일 업로드 시 토큰 파싱 오류:', error)
            }
        }

        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            method: 'POST',
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
                const errorText = await response.text()
                errorMessage = errorText || errorMessage
            }
            throw new Error(errorMessage)
        }

        return await response.json()
    }
}

// singleton instance
export const apiClient = new ApiClient()
