import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    domains: ['openweathermap.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
      }
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default config