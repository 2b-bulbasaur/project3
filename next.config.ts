import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
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