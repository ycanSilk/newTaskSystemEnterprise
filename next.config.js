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
          // 启用XSS保护
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // 内容安全策略 (CSP) - 防止XSS和数据注入攻击
        { 
          key: 'Content-Security-Policy', 
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-src 'self' https:; object-src 'none';"
        },
          // 严格传输安全 (HSTS) - 强制使用HTTPS
          { 
            key: 'Strict-Transport-Security', 
            value: 'max-age=63072000; includeSubDomains; preload' 
          },
          // 引用策略 - 控制引用头信息
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // 功能策略 - 控制浏览器API的使用
        { 
          key: 'Permissions-Policy', 
          value: 'camera=(), microphone=(), geolocation=(), payment=(), fullscreen=(), autoplay=()'
        },
        // 缓存策略 - 优化静态资源缓存
        { 
          key: 'Cache-Control', 
          value: 'public, max-age=31536000, immutable' 
        },
        ],
      },
    ];
  },
  // 环境变量
  env: {
    CUSTOM_APP_NAME: '抖音派单系统',
    CUSTOM_APP_VERSION: '2.0.0',
  },
  // 构建配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 生产环境下启用代码混淆
    if (!dev && !isServer) {
      // 移除默认的TerserPlugin配置
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (minimizer) => minimizer.constructor.name !== 'TerserPlugin'
      );
      
      // 添加自定义的TerserPlugin配置
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            // 启用混淆
            compress: {
              // 删除控制台日志（可选）
              drop_console: true,
              // 删除调试器语句
              drop_debugger: true,
              // 其他压缩选项
              passes: 2,
            },
            // 混淆选项
            mangle: {
              // 启用变量名混淆
              toplevel: true,
              // 启用函数名混淆
              keep_fnames: false,
              // 启用属性名混淆
              keep_classnames: false,
              // 自定义混淆后的变量名
              reserved: ['$', 'jQuery', 'React', 'ReactDOM'],
            },
            // 输出选项
            output: {
              // 禁用注释
              comments: false,
              // 禁用格式化
              beautify: false,
              // 保留版权信息（可选）
              // comments: /^!/,
            },
            // 启用source map（可选，生产环境建议关闭）
            sourceMap: false,
          },
          // 并行处理
          parallel: true,
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;