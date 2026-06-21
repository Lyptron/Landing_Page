import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'recharts', 'gsap', '@react-three/drei'],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.lyptron.com' }],
        destination: 'https://lyptron.com/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
