/** @type {import('next').NextConfig} */
const TerserPlugin = require('terser-webpack-plugin');

const nextConfig = {
  eslint: {
    // 禁用Next.js默认的lint配置，使用项目自定义配置
    ignoreDuringBuilds: true
  },
  experimental: {
    typedRoutes: true,
  },
  // API代理配置，用于解决跨域问题
  // 统一开发环境和生产环境的API代理配置
  async rewrites() {
    // 使用统一的API地址，确保环境一致性
    const apiBaseUrl = process.env.API_BASE_URL || 'http://134.122.136.221:4667';
    
    return [
      { source: '/api/auth/me', destination: '/api/auth/me' }, // 不转发到外部服务器
      { source: '/api/users/register', destination: `${apiBaseUrl}/api/users/register` },
      { source: '/api/users/login', destination: `${apiBaseUrl}/api/users/login` },
      { source: '/api/users', destination: `${apiBaseUrl}/api/users` },
      { source: '/api/:path*', destination: `${apiBaseUrl}/api/:path*` },
    ]
  },
  // H5移动端优化
  compiler: {
    // 保留所有环境的日志输出，便于调试和问题排查
  },
  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.douyin.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.douyin-task.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // PWA支持准备
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // 防止MIME类型嗅探
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // 防止点击劫持攻击
          { key: 'X-Frame-Options', value: 'DENY' },
          // 开启严格的传输安全策略
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // 禁用浏览器默认的内容安全策略
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;