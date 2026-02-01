# 前端项目优化与缓存优化标准方案

## 1. 优化背景与目标

### 1.1 背景
在现代前端开发中，性能优化和缓存策略是确保应用良好用户体验的关键因素。特别是对于基于Next.js的H5移动端优先项目，需要在不同设备、网络环境下保持稳定的性能表现。

### 1.2 优化目标
- **性能提升**：减少首屏加载时间，提高页面响应速度
- **缓存优化**：合理利用浏览器缓存和服务端缓存
- **部署优化**：简化部署流程，提高部署效率
- **稳定性**：增强应用在不同环境下的稳定性
- **可维护性**：提升代码可维护性，便于后续开发和迭代

## 2. 技术栈分析

### 2.1 核心技术栈
- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **状态管理**：Zustand
- **UI组件库**：Ant Design
- **HTTP客户端**：Axios
- **样式**：Tailwind CSS

### 2.2 技术特点
- **服务器端渲染**：Next.js SSR/SSG能力
- **客户端交互**：React hooks和组件化开发
- **API集成**：Axios拦截器和错误处理
- **移动端适配**：H5移动端优先设计

## 3. 核心优化方案

### 3.1 API请求优化

#### 3.1.1 缓存策略实现

**配置步骤**：
1. **缓存策略定义**：创建`src/api/client/cacheStrategy.ts`
   ```typescript
   // 缓存级别枚举
   export enum CacheLevel {
     NONE = 'none',     // 不缓存
     SHORT = 'short',   // 短期缓存（5分钟）
     MEDIUM = 'medium', // 中期缓存（30分钟）
     LONG = 'long',     // 长期缓存（1小时）
     SESSION = 'session' // 会话缓存（24小时）
   }
   
   // HTTP方法对应的默认缓存策略
   export const HTTP_METHOD_CACHE_STRATEGIES: Record<string, CacheLevel> = {
     GET: CacheLevel.SHORT,
     POST: CacheLevel.NONE,
     PUT: CacheLevel.NONE,
     DELETE: CacheLevel.NONE,
     PATCH: CacheLevel.NONE,
     HEAD: CacheLevel.SHORT,
     OPTIONS: CacheLevel.NONE
   };
   ```

2. **API路径缓存策略**：
   ```typescript
   // 预设API路径缓存策略
   export const PRESET_API_CACHE_CONFIGS: ApiPathCacheConfig[] = [
     // 用户相关
     {
       pattern: '/api/users/me',
       level: CacheLevel.MEDIUM,
       methods: ['GET']
     },
     // 任务相关
     {
       pattern: '/api/task/*',
       level: CacheLevel.SHORT,
       methods: ['GET']
     }
   ];
   ```

#### 3.1.2 API客户端增强

**配置步骤**：
1. **增强的Axios实例**：修改`src/api/client/axiosInstance.ts`
   ```typescript
   // 创建增强的axios实例，支持缓存
   class EnhancedAxiosInstance {
     private instance: AxiosInstance;
     
     constructor(instance: AxiosInstance) {
       this.instance = instance;
     }
     
     // GET请求（支持缓存）
     async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
       const cacheConfig = config?.cacheControl;
       const enabled = cacheConfig?.enabled !== false;
       
       if (enabled && !cacheConfig?.forceRefresh) {
         // 尝试从缓存获取数据
         // ...
       }
       
       // 发送实际请求
       const response = await this.instance.get<T>(url, config);
       
       // 缓存响应数据
       if (enabled) {
         // ...
       }
       
       return response;
     }
     
     // POST请求（处理缓存更新）
     async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
       const response = await this.instance.post<T>(url, data, config);
       // 处理缓存更新
       this.handleCacheUpdate(url, 'POST');
       return response;
     }
   }
   ```

2. **缓存控制配置**：
   ```typescript
   // 缓存配置类型
   export interface CacheControlConfig {
     enabled?: boolean;
     level?: CacheLevel;
     dependencies?: string[];
     forceRefresh?: boolean;
   }
   ```

#### 3.1.3 智能轮询管理

**配置步骤**：
1. **轮询管理器**：创建`src/utils/pollingManager.ts`
   ```typescript
   // 添加轮询任务
   pollingManager.addTask({
     id: 'task-list-polling',
     url: '/api/task/pool',
     interval: 30000, // 30秒
     priority: PollingPriority.MEDIUM,
     smartInterval: true,
     incrementalUpdate: true,
     onSuccess: (data) => {
       console.log('Task list updated:', data);
     },
     onError: (error) => {
       console.error('Polling error:', error);
     }
   });
   
   // 启动轮询
   pollingManager.startTask('task-list-polling');
   ```

2. **智能调整**：
   - 页面可见性检测：页面不可见时降低轮询频率
   - 网络状态检测：弱网络环境减少轮询
   - 优先级管理：按优先级顺序启动任务

#### 3.1.4 页面级缓存管理

**配置步骤**：
1. **路由缓存**：创建`src/utils/routeCache.ts`
   ```typescript
   // 使用React Hook
   import { useRouteCache } from '@/utils/routeCache';
   
   function MyComponent() {
     const { isCached, cachePage, navigateWithCache } = useRouteCache();
     
     // 缓存当前页面
     const handleCache = () => {
       cachePage({ /* 页面状态 */ });
     };
     
     // 导航并缓存
     const handleNavigate = () => {
       navigateWithCache('/next-page');
     };
     
     return (
       <div>
         <p>页面是否有缓存: {isCached ? '是' : '否'}</p>
         <button onClick={handleCache}>缓存页面</button>
         <button onClick={handleNavigate}>导航</button>
       </div>
     );
   }
   ```

2. **自动缓存**：
   - 自动缓存离开的页面状态
   - 恢复进入的页面状态
   - 支持滚动位置、标题等的恢复

#### 3.1.5 拦截器优化

**配置步骤**：
1. **请求拦截器**：修改`src/api/client/interceptors/request.ts`
   ```typescript
   // 处理缓存策略
   if (config.url) {
     const method = (config.method || 'GET').toUpperCase();
     const cacheStrategy = getCacheStrategy(config.url, method);
     
     // 添加缓存控制头信息
     if (method === 'GET') {
       if (cacheStrategy.level !== 'none') {
         config.headers['X-Cache-Level'] = cacheStrategy.level;
         config.headers['X-Cache-Expiry'] = cacheStrategy.expiry.toString();
       }
     } else {
       // 对于写操作，添加缓存失效头
       config.headers['X-Cache-Invalidate'] = 'true';
     }
   }
   ```

2. **响应拦截器**：修改`src/api/client/interceptors/response.ts`
   ```typescript
   // 处理缓存
   if (response.config?.url) {
     const method = (response.config.method || 'GET').toUpperCase();
     
     if (method === 'GET') {
       // 处理GET请求的缓存
       const cacheStrategy = getCacheStrategy(response.config.url, method);
       if (cacheStrategy.enabled) {
         // 缓存逻辑
       }
     } else {
       // 处理写操作的缓存失效
       if (response.config.headers?.['X-Cache-Invalidate'] === 'true') {
         const url = response.config.url;
         const patterns = generateInvalidationPatterns(url);
         handleWriteOperation(patterns);
       }
     }
   }
   ```

#### 3.1.6 最佳实践

**使用示例**：
1. **GET请求缓存**：
   ```typescript
   // 使用缓存策略
   const response = await apiClient.get('/api/task/pool', {
     cacheControl: {
       level: CacheLevel.SHORT,
       dependencies: ['/api/task/*']
     }
   });
   ```

2. **写操作缓存更新**：
   ```typescript
   // POST请求会自动更新相关缓存
   const response = await apiClient.post('/api/task/submit', {
     taskId: 1,
     content: '完成任务'
   });
   ```

3. **智能轮询**：
   ```typescript
   // 添加轮询任务
   addPollingTask({
     id: 'notifications',
     url: '/api/notifications',
     interval: 60000, // 1分钟
     priority: PollingPriority.LOW,
     smartInterval: true,
     incrementalUpdate: true,
     onSuccess: (data) => {
       // 更新通知列表
     }
   });
   ```

4. **页面级缓存**：
   ```typescript
   // 在组件中使用
   const { navigateWithCache } = useRouteCache();
   
   // 导航并缓存当前页面
   const handleNavigate = () => {
     navigateWithCache('/task-detail/1');
   };
   ```

**优势**：
- **性能提升**：减少重复API请求，提高响应速度
- **用户体验**：前进后退操作秒加载，保持页面状态
- **网络优化**：智能调整轮询频率，减少网络负载
- **缓存一致性**：写操作自动更新相关缓存
- **可扩展性**：模块化设计，易于扩展和维护

### 3.2 构建优化

#### 3.2.1 Standalone模式部署
**配置步骤**：
1. 在`next.config.js`中启用standalone模式
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'standalone', // 启用standalone模式
     // 其他配置...
   };
   ```

2. 修改`package.json`脚本，使用standalone启动方式
   ```json
   "scripts": {
     "start": "cross-env NODE_ENV=production PORT=8890 node .next/standalone/server.js",
     "start:clean": "rimraf .next && cross-env NODE_ENV=production next build && cross-env NODE_ENV=production PORT=8890 node .next/standalone/server.js",
     "deploy:prod": "cross-env NODE_ENV=production PORT=8890 npm run build:clean && cross-env NODE_ENV=production PORT=8890 node .next/standalone/server.js"
   }
   ```

**优势**：
- 减少部署包大小（仅包含必要依赖）
- 提高启动速度
- 简化服务器环境配置
- 增强部署稳定性

#### 3.1.2 构建配置优化
**配置步骤**：
1. 禁用生产环境source maps
   ```javascript
   productionBrowserSourceMaps: false,
   ```

2. 启用SWC代码压缩
   ```javascript
   swcMinify: true,
   ```

3. 配置图片优化
   ```javascript
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
   ```

4. 部署模式选择
   - **推荐**：使用 `next start` 命令部署，避免使用 `output: 'standalone'` 配置
   - **原因**：standalone 模式可能导致静态资源路径问题，使用标准 `next start` 更稳定

   ```javascript
   // 不推荐的配置
   // output: 'standalone', // 可能导致静态资源加载问题
   ```

### 3.2 缓存策略优化

#### 3.2.1 HTTP缓存头配置
**配置步骤**：
在`next.config.js`中配置缓存头
```javascript
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
```

#### 3.2.2 客户端缓存策略
**实施步骤**：
1. **Token存储优化**：使用localStorage + Cookie双重存储
   ```typescript
   // 存储token
   localStorage.setItem('token', token);
   document.cookie = `token=${token}; path=/; max-age=86400`;
   
   // 获取token
   const getToken = () => {
     return localStorage.getItem('token') || getCookie('token');
   };
   ```

2. **API请求缓存**：使用Axios拦截器实现请求缓存
   ```typescript
   // 请求拦截器中添加缓存逻辑
   axios.interceptors.request.use(
     config => {
       // 检查缓存
       const cacheKey = generateCacheKey(config);
       const cachedData = getCache(cacheKey);
       if (cachedData) {
         return Promise.resolve({ data: cachedData });
       }
       return config;
     }
   );
   ```

### 3.3 性能优化

#### 3.3.1 代码分割与懒加载
**实施步骤**：
1. 使用React.lazy和Suspense实现组件懒加载
   ```typescript
   import React, { lazy, Suspense } from 'react';
   
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   
   function App() {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <HeavyComponent />
       </Suspense>
     );
   }
   ```

2. 使用Next.js的动态导入
   ```typescript
   import dynamic from 'next/dynamic';
   
   const DynamicComponent = dynamic(
     () => import('./DynamicComponent'),
     { ssr: false }
   );
   ```

#### 3.3.2 图片优化
**实施步骤**：
1. 使用Next.js Image组件（适用于本地和HTTPS外部图片）
   ```typescript
   import Image from 'next/image';
   
   function MyImage() {
     return (
       <Image
         src="/path/to/image.jpg"
         width={300}
         height={600}
         alt="Description"
         priority
       />
     );
   }
   ```

2. 外部HTTP图片处理（重要）
   - **问题**：Next.js Image组件会将外部图片通过 `/_next/image` API处理，对于HTTP图片会失败
   - **解决方案**：使用原生 img 标签直接加载外部HTTP图片

   ```typescript
   // 推荐：使用原生img标签加载外部HTTP图片
   const ExternalImage = ({ src, alt }) => {
     return (
       <img 
         src={src} 
         alt={alt} 
         className="object-contain max-w-full max-h-full"
       />
     );
   };
   
   // 图片查看器示例
   const ImageViewer = ({ selectedImage, onClose }) => {
     return (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
         <div className="relative max-w-[90vw] max-h-[90vh]">
           {selectedImage && (
             <img 
               src={selectedImage} 
               alt="预览图片" 
               className="object-contain max-w-full max-h-full"
             />
           )}
         </div>
       </div>
     );
   };
   ```

3. 图片服务器配置
   - 在 `next.config.js` 中添加图片服务器配置
   - 确保包含所有可能的图片来源域名

   ```javascript
   images: {
     remotePatterns: [
       {
         protocol: 'http',
         hostname: '134.122.136.221',
         port: '4667',
         pathname: '/img/**',
       },
       // 其他图片服务器...
     ],
   },
   ```

#### 3.3.3 骨架屏实现
**实施步骤**：
创建通用骨架屏组件
```typescript
import React from 'react';

const Skeleton = ({ width, height, className }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    />
  );
};

export default Skeleton;
```

### 3.4 跨设备兼容性优化

#### 3.4.1 剪贴板功能兼容
**实施步骤**：
使用现代Clipboard API并提供传统方法作为 fallback
```typescript
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // 现代浏览器
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 传统方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (error) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    return false;
  }
};
```

#### 3.4.2 响应式设计
**实施步骤**：
1. 使用Tailwind CSS的响应式类
   ```html
   <div className="w-full md:w-1/2 lg:w-1/3">
     <!-- 内容 -->
   </div>
   ```

2. 针对移动端的特殊处理
   ```typescript
   const isMobile = useMediaQuery('(max-width: 768px)');
   
   return (
     <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
       {/* 内容 */}
     </div>
   );
   ```

### 3.5 错误处理优化

#### 3.5.1 全局错误边界
**实施步骤**：
创建ErrorBoundary组件
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### 3.5.2 API错误处理
**实施步骤**：
在Axios响应拦截器中统一处理错误
```typescript
axios.interceptors.response.use(
  response => response,
  error => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误
      switch (error.response.status) {
        case 401:
          // 未授权处理
          handleUnauthorized();
          break;
        case 404:
          // 资源不存在处理
          handleNotFound();
          break;
        case 500:
          // 服务器错误处理
          handleServerError();
          break;
        default:
          // 其他错误处理
          handleOtherError(error);
      }
    } else if (error.request) {
      // 请求发送但未收到响应
      handleNetworkError();
    } else {
      // 请求配置错误
      handleRequestError(error);
    }
    return Promise.reject(error);
  }
);
```

### 3.6 部署优化

#### 3.6.1 标准部署模式（推荐）
**实施步骤**：
1. 配置next.config.js（移除standalone配置）
   ```javascript
   const nextConfig = {
     // 移除 standalone 配置
     // output: 'standalone', // 可能导致静态资源加载问题
   };
   ```

2. 构建项目
   ```bash
   npm run build:clean
   ```

3. 启动服务（使用标准next start命令）
   ```bash
   NODE_ENV=production PORT=8890 npx next start
   ```

4. 推荐的package.json脚本
   ```json
   "scripts": {
     "start": "cross-env NODE_ENV=production PORT=8890 npx next start",
     "start:clean": "rimraf .next && cross-env NODE_ENV=production next build && cross-env NODE_ENV=production PORT=8890 npx next start",
     "deploy:prod": "cross-env NODE_ENV=production PORT=8890 npm run build:clean && cross-env NODE_ENV=production PORT=8890 npx next start"
   }
   ```

**优势**：
- 避免static资源路径问题
- 简化部署流程
- 提高部署稳定性
- 与Next.js官方推荐做法一致

#### 3.6.2 PM2进程管理
**实施步骤**：
1. 创建ecosystem.config.js（使用标准next start命令）
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'app-name',
         script: 'npx',
         args: 'next start',
         instances: 'max',
         exec_mode: 'cluster',
         env: {
           NODE_ENV: 'production',
           PORT: 8890,
         },
         log_file: './logs/combined.log',
         out_file: './logs/out.log',
         error_file: './logs/error.log',
         max_memory_restart: '2G',
         autorestart: true,
         watch: false,
         cwd: '.', // 确保在项目根目录运行
       }
     ]
   };
   ```

2. 启动服务
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## 4. 实施步骤

### 4.1 准备阶段
1. **代码审查**：分析现有代码，识别性能瓶颈
2. **环境配置**：确保开发环境和生产环境配置正确
3. **依赖检查**：更新和优化项目依赖

### 4.2 实施阶段
1. **配置优化**：修改next.config.js和相关配置文件
2. **代码重构**：实施代码分割、懒加载等优化
3. **缓存策略**：配置HTTP缓存头和客户端缓存
4. **错误处理**：添加错误边界和统一错误处理
5. **部署配置**：设置standalone模式和PM2管理

### 4.3 验证阶段
1. **性能测试**：使用Lighthouse等工具测试性能
2. **兼容性测试**：在不同设备和浏览器上测试
3. **压力测试**：模拟高并发场景测试稳定性
4. **部署测试**：测试部署流程和服务启动

## 5. 最佳实践

### 5.1 开发最佳实践
1. **代码规范**：使用ESLint和Prettier保持代码规范
2. **类型安全**：使用TypeScript确保类型安全
3. **测试覆盖**：编写单元测试和集成测试
4. **文档完善**：保持代码和配置文档的完善

### 5.2 部署最佳实践
1. **自动化部署**：使用CI/CD工具实现自动化部署
2. **版本管理**：使用Git进行代码版本管理
3. **环境隔离**：严格分离开发、测试和生产环境
4. **监控告警**：设置服务监控和告警机制

### 5.3 缓存最佳实践
1. **缓存策略**：根据资源类型设置不同的缓存策略
2. **缓存失效**：合理设置缓存失效时间
3. **缓存清理**：提供缓存清理机制
4. **缓存监控**：监控缓存使用情况

## 6. 工具与资源

### 6.1 性能测试工具
- **Lighthouse**：Google的性能测试工具
- **WebPageTest**：网站性能测试
- **Chrome DevTools**：浏览器开发工具

### 6.2 监控工具
- **New Relic**：应用性能监控
- **Datadog**：综合监控平台
- **Sentry**：错误监控

### 6.3 部署工具
- **PM2**：Node.js进程管理
- **Docker**：容器化部署
- **GitHub Actions**：CI/CD工具

## 7. 总结

通过实施本优化方案，可以显著提升基于Next.js的前端项目性能和稳定性。特别是在以下方面：

1. **性能提升**：通过代码分割、懒加载和图片优化，减少首屏加载时间
2. **缓存优化**：通过HTTP缓存头和客户端缓存，减少重复请求
3. **部署简化**：通过标准`next start`命令和PM2管理，简化部署流程，避免静态资源加载问题
4. **图片处理优化**：通过原生img标签处理外部HTTP图片，解决Next.js Image组件的限制
5. **稳定性增强**：通过错误处理、监控和规范的部署流程，提高应用稳定性
6. **可维护性提升**：通过规范的代码结构和文档，提高代码可维护性

## 8. 常见问题解决方案

### 8.1 图片加载问题
**问题**：外部HTTP图片无法通过Next.js Image组件加载
**原因**：Next.js Image组件会将外部图片通过`/_next/image`API处理，对于HTTP图片会失败
**解决方案**：使用原生img标签直接加载外部HTTP图片

### 8.2 静态资源404错误
**问题**：部署后静态资源文件404
**原因**：使用`output: 'standalone'`配置时，静态资源路径可能出现问题
**解决方案**：移除standalone配置，使用标准`next start`命令部署

### 8.3 CSP限制问题
**问题**：图片被Content Security Policy阻止
**原因**：CSP配置可能不允许特定来源的图片
**解决方案**：在CSP配置中添加相应的图片来源

```javascript
// next.config.js中的CSP配置
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self'; connect-src 'self' https: http:",
}
```

本方案适用于使用Next.js 14、TypeScript、React等技术栈的前端项目，可根据具体项目需求进行适当调整。特别适合H5移动端优先的项目，能够在不同设备和网络环境下提供稳定的用户体验。
