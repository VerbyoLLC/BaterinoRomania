import type { NextConfig } from 'next'

const RAILWAY_API_BASE = 'https://baterinoromania-production.up.railway.app'

const nextConfig: NextConfig = {
  // Repo also has a root-level package-lock.json (unrelated Vercel Edge Middleware project);
  // pin the workspace root explicitly so Turbopack doesn't guess wrong.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.baterino.ro' },
      { protocol: 'https', hostname: 'www.baterino.ro' },
    ],
  },
  async rewrites() {
    return [
      // Client-side (browser) fetches use relative /api — same-origin, no CORS config needed.
      // Server Component fetches use the absolute RAILWAY_API_BASE via process.env.API_URL instead.
      { source: '/api/:path*', destination: `${RAILWAY_API_BASE}/api/:path*` },
    ]
  },
}

export default nextConfig
