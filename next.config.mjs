/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 정적 사이트 생성을 위한 설정
  output: 'export',
  trailingSlash: true,
  // 이미지 최적화 비활성화 (정적 export에서 필요)
  images: {
    unoptimized: true,
  },
}

export default nextConfig
