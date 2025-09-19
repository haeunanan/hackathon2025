/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // /api/* → 백엔드 서버(포트 4000)로 프록시
      { source: '/api/:path*', destination: 'http://localhost:4000/:path*' },
    ];
  },
};

export default nextConfig;
