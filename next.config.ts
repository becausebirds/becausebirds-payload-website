import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['194.163.176.129'],
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    unoptimized: false,
    localPatterns: [
      {
        pathname: '/api/media/**',
      },
      {
        pathname: '/api/bird-media/**',
      },
      {
        pathname: '/media/**',
      },
      {
        pathname: '/birdmedia/**',
      },
    ],
    remotePatterns: [
      {
        protocol: new URL(NEXT_PUBLIC_SERVER_URL).protocol.replace(':', '') as 'http' | 'https',
        hostname: new URL(NEXT_PUBLIC_SERVER_URL).hostname,
        pathname: '/api/media/**',
      },
      {
        protocol: new URL(NEXT_PUBLIC_SERVER_URL).protocol.replace(':', '') as 'http' | 'https',
        hostname: new URL(NEXT_PUBLIC_SERVER_URL).hostname,
        pathname: '/api/bird-media/**',
      },
      {
        protocol: new URL(NEXT_PUBLIC_SERVER_URL).protocol.replace(':', '') as 'http' | 'https',
        hostname: new URL(NEXT_PUBLIC_SERVER_URL).hostname,
        pathname: '/media/**',
      },
      {
        protocol: new URL(NEXT_PUBLIC_SERVER_URL).protocol.replace(':', '') as 'http' | 'https',
        hostname: new URL(NEXT_PUBLIC_SERVER_URL).hostname,
        pathname: '/birdmedia/**',
      },
    ],
    qualities: [75],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
