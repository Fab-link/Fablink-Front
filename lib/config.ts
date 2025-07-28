import App from "next/app";

export interface AppConfig {
    env: 'local' | 'development' | 'production'
    apiUrl: string
    apiTimeout: number
    uploadMaxSize: number
    debug: boolean
    feature: {
        analytics: boolean
        debugging: boolean
        experimentalFeatures: boolean
        mockApi: boolean
    }
    external: {}
    aws: {
        region: string
        s3Bucket: string
    }
}

const createConfig = (): AppConfig => {
    const env = (process.env.NEXT_PUBLIC_ENV || 'local') as AppConfig['env']

    const baseConfig: AppConfig = {
        env,
        apiUrl: (process.env.API_URL || 'http://localhost:8000/api'),
        apiTimeout: 30000,
        uploadMaxSize: parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE || '10485760'), // 10MB
        debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
        feature: {
            analytics: false,
            debugging: false,
            experimentalFeatures: false,
            mockApi: false
        },
        external: {},
        aws: { 
            region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
            s3Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'my-default-bucket'
        },
    }

    switch (env) {
        case "local":
            return {
                ...baseConfig,
                feature: {
                    ...baseConfig.feature,
                    debugging: true,
                    experimentalFeatures: true,
                    mockApi: true
                }
            }
        case "development":
            return {
                ...baseConfig,
                feature: {
                    ...baseConfig.feature,
                    analytics: true,
                    debugging: true,
                    experimentalFeatures: true,
                    mockApi: false
                }
            }
        case "production":
            return {
                ...baseConfig,
                feature: {
                    ...baseConfig.feature,
                    analytics: true,
                    debugging: false,
                    experimentalFeatures: false,
                    mockApi: false
                }
            }
        
        default:
            return baseConfig;
    }
}

export const config = createConfig()

export const isLocal = () => config.env === 'local'
export const isDevelopment = () => config.env === 'development'
export const isProduction = () => config.env === 'production'
export const isServer = () => typeof window === 'undefined'
export const isClient = () => typeof window !== 'undefined'

export const debugLog = (...args: any[]) => {
    if (config.debug && isClient()) {
        console.log('[DEBUG]', ...args)
    }
}
