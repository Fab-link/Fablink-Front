import { config, debugLog, isProduction } from '@/lib/config'
import { set } from 'date-fns'

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
        const token = localStorage.getItem('authToken')
        if (token) {
            return { Authorization: `Token ${token}` }
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
            const response = await fetch(url, config)

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            return await response.json() 
        } catch (error) {
            console.error('API request failed:', error)
            throw error
        }
    }

    async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' })
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

    async uploadFile<T>(endpoint: string, fromData: FormData): Promise<T> {
        const token = localStorage.getItem('authToken')

        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Token ${token}` }),
                // Content-Type을 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
            },
            body: fromData
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`File upload failed! status: ${response.status}, message: ${errorText}`)
        }

        return await response.json()
    }
}

// singleton instance
export const apiClient = new ApiClient()
