/** @type {import('next').NextConfig} */
const TerserPlugin = require('terser-webpack-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
  analyzerMode: 'static',
  reportFilename: 'bundle-analysis.html',
});

const nextConfig = {
  eslint: {
    // 禁用Next.js默认的lint配置，使用项目自定义配置
    ignoreDuringBuilds: true
  },
  // 启用压缩
  compress: true,
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
      {
        protocol: 'http',
        hostname: '134.122.136.221',
        port: '4667',
        pathname: '/img/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // 禁用生产环境source maps
  productionBrowserSourceMaps: false,
  // PWA支持准备
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDevelopment 
              ? 'no-store, no-cache, must-revalidate, proxy-revalidate' 
              : 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: isDevelopment ? 'no-cache' : 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          // 防止MIME类型嗅探
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // 防止点击劫持攻击
          { key: 'X-Frame-Options', value: 'DENY' },
          // 开启严格的传输安全策略
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // 禁用浏览器默认的内容安全策略
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://134.122.136.221:4667; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable',
          },
        ],
      },
    ];
  },
  // 构建优化
  webpack: (config, { isServer }) => {
    // 启用持久化缓存
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };
    
    // 生产环境优化
    if (config.mode === 'production') {
      // 移除控制台日志
      config.optimization.minimizer?.forEach((minimizer) => {
        if (minimizer instanceof TerserPlugin) {
          minimizer.options.terserOptions = {
            ...minimizer.options.terserOptions,
            compress: {
              ...minimizer.options.terserOptions?.compress,
              drop_console: true,
            },
          };
        }
      });
    }
    
    return config;
  },
  // 启用SWC编译器
  swcMinify: true,
};

module.exports = withBundleAnalyzer(nextConfig);
