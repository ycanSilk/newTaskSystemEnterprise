# 前端API架构重构计划（优化版）

## 1. 现有API调用代码分析与文档化

### 1.1 当前架构概述

* **框架**: Next.js 14 + TypeScript

* **API调用模式**: Next.js API路由作为中间代理层，转发请求到实际后端API

* **认证方式**: JWT Token存储在HTTP Only Cookie中

* **配置管理**: 集中式配置文件(`src/app/api/apiconfig/config.json`)

### 1.2 现有API路由文件分析

* **目录结构**: `src/app/api/[模块]/[功能]/route.ts`

* **模块分类**: auth, bank, inviteagent, rental, task, users, walletmanagement

* **HTTP方法支持**: 主要为POST和GET

* **Token处理**: 从Cookie获取，支持多Token键名

* **响应处理**: 部分有标准化封装，部分直接返回原始响应

### 1.3 主要问题点

* API调用逻辑分散在多个路由文件中

* 缺少统一的错误处理和重试机制

* 没有统一的API客户端封装

* 响应格式不一致

* 代码重复度高

* 各路由文件实现方式不统一

## 2. 新API请求架构设计方案（优化版）

### 2.1 设计原则

* **保留Next.js中间层**: 前端通过Next.js API路由调用后端API，提高安全性

* **统一API客户端**: 封装axios实例，提供统一的请求方法

* **标准化响应处理**: 统一响应格式和错误处理

* **类型安全**: 完整的TypeScript类型定义

* **可扩展性**: 支持中间件和插件机制

* **环境变量配置**: 使用环境变量管理敏感配置

* **HTTP Only Cookie认证**: 保持现有认证方式

### 2.2 优化后的目录结构

```
src/
├── api/
│   ├── client/              # API客户端核心实现
│   │   ├── index.ts         # 主入口，导出API客户端实例
│   │   ├── axiosInstance.ts # axios实例配置
│   │   ├── config.ts        # 配置管理，统一导出环境变量配置
│   │   ├── interceptors/    # 请求/响应拦截器
│   │   │   ├── request.ts
│   │   │   └── response.ts
│   │   └── errorHandler.ts  # 统一错误处理
│   ├── endpoints/           # API端点定义（按功能域深度划分）
│   │   ├── auth/
│   │   │   ├── index.ts     # 导出所有auth相关端点
│   │   │   ├── login.ts
│   │   │   ├── register.ts
│   │   │   ├── logout.ts
│   │   │   └── refreshToken.ts
│   │   ├── bank/
│   │   │   ├── index.ts
│   │   │   ├── addBankCard.ts
│   │   │   └── ...
│   │   ├── inviteagent/
│   │   │   ├── index.ts
│   │   │   └── ...
│   │   ├── rental/
│   │   │   ├── index.ts
│   │   │   └── ...
│   │   ├── task/
│   │   │   ├── index.ts
│   │   │   └── ...
│   │   ├── users/
│   │   │   ├── index.ts
│   │   │   └── ...
│   │   └── walletmanagement/
│   │       ├── index.ts
│   │       └── ...
│   ├── handlers/            # 请求处理逻辑层（原services/，更精准的命名）
│   │   ├── auth/
│   │   │   ├── loginHandler.ts
│   │   │   ├── registerHandler.ts
│   │   │   └── ...
│   │   ├── bank/
│   │   ├── inviteagent/
│   │   ├── rental/
│   │   ├── task/
│   │   ├── users/
│   │   └── walletmanagement/
│   ├── types/               # API类型定义（按功能域深度划分）
│   │   ├── common.ts        # 通用类型
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   ├── register.ts
│   │   │   └── ...
│   │   ├── bank/
│   │   └── ...
│   └── utils/               # 工具函数
│       ├── urlBuilder.ts    # URL构建工具
│       └── requestHelpers.ts # 请求辅助函数
└── app/
    └── api/                 # 原有Next.js API路由
        ├── auth/
        │   ├── login/
        │   │   └── route.ts # 使用新的请求处理逻辑
        │   └── register/
        │       └── route.ts # 使用新的请求处理逻辑
        ├── ...              # 其他模块路由
```

### 2.3 核心组件设计优化

#### 2.3.1 配置管理（使用环境变量）

* 从`.env.local`文件读取配置

* 统一导出配置，避免硬编码

* 支持不同环境（开发、生产）配置

* 示例：

```typescript
// src/api/client/config.ts
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '5000'),
  headers: {
    accept: '*/*',
    'Content-Type': 'application/json',
  },
};
```

#### 2.3.2 端点定义优化

* 按功能域深度划分，每个功能一个文件

* 集中导出所有端点

* 支持动态路径参数

* 示例：

```typescript
// src/api/endpoints/auth/login.ts
export const LOGIN_ENDPOINT = '/biz/user/login';

// src/api/endpoints/auth/index.ts
export { LOGIN_ENDPOINT } from './login';
export { REGISTER_ENDPOINT } from './register';
export { LOGOUT_ENDPOINT } from './logout';
export { REFRESH_TOKEN_ENDPOINT } from './refreshToken';
```

#### 2.3.3 请求处理逻辑层（handlers）

* 更精准的命名，避免与后端服务概念混淆

* 按模块和功能域划分目录

* 每个功能一个处理函数

* 示例：

```typescript
// src/api/handlers/auth/loginHandler.ts
import { NextRequest, NextResponse } from 'next/server';
import apiClient from '../../client';
import { LOGIN_ENDPOINT } from '../../endpoints/auth';
import { LoginRequest, LoginResponse } from '../../types/auth/login';

export async function handleLogin(req: NextRequest): Promise<NextResponse> {
  try {
    const requestData: LoginRequest = await req.json();
    const response = await apiClient.post(LOGIN_ENDPOINT, requestData);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 统一错误处理
    return NextResponse.json(
      { code: 500, message: '登录失败', timestamp: Date.now() },
      { status: 500 }
    );
  }
}
```

## 3. 分阶段实施步骤

### 3.1 第一阶段: 架构搭建与核心组件开发 (1-2天)

1. 创建新的API目录结构
2. 实现API客户端核心功能
3. 配置axios实例和拦截器
4. 实现统一错误处理机制
5. 定义通用类型和工具函数
6. 实现环境变量配置管理

### 3.2 第二阶段: API端点和类型定义 (2-3天)

1. 将现有API配置转换为新的端点定义（按功能域划分）
2. 为每个API端点创建TypeScript类型（按功能域划分）
3. 实现各模块的API端点配置
4. 适配新的后端API响应格式

### 3.3 第三阶段: 请求处理逻辑层实现 (2-3天)

1. 创建各模块的请求处理逻辑函数（按功能域划分）
2. 实现标准化的请求和响应处理
3. 封装重复的代码逻辑
4. 实现请求处理逻辑与路由处理的分离

### 3.4 第四阶段: API路由文件重构 (3-4天)

1. 逐步修改现有API路由文件
2. 使用新的请求处理逻辑函数
3. 测试每个路由的正确性
4. 确保现有功能正常工作

### 3.5 第五阶段: 前端组件适配 (2-3天)

1. 优化前端组件的API调用方式
2. 确保前端组件能正确处理标准化响应
3. 测试前端功能的完整性

### 3.6 第六阶段: 测试和验证 (2-3天)

1. 单元测试API客户端核心功能
2. 集成测试各API路由
3. 端到端测试核心业务流程
4. 性能测试和优化

## 4. 接口适配与数据转换策略

### 4.1 数据转换层设计

* 在响应拦截器中实现数据转换

* 统一处理不同格式的后端响应

* 支持新旧响应格式的兼容

### 4.2 接口适配方案

* 保持现有API路由的URL不变

* 内部使用新的API客户端和请求处理逻辑函数

* 确保向后兼容

### 4.3 向后兼容性保障

* 保留旧的API调用方式作为fallback

* 实现平滑过渡

* 详细的测试计划

## 5. 测试计划与验证方法

### 5.1 测试策略

* **单元测试**: 测试API客户端核心功能、拦截器、错误处理

* **集成测试**: 测试API路由和请求处理逻辑函数

* **端到端测试**: 测试完整业务流程

* **性能测试**: 测试API调用性能和并发处理

### 5.2 测试工具

* **单元测试**: Jest + React Testing Library

* **集成测试**: Supertest + Axios Mock Adapter

* **端到端测试**: Cypress

* **性能测试**: Lighthouse + Loadtest

### 5.3 验证标准

* 所有现有功能正常工作

* API调用成功率达到100%

* 响应格式统一

* 代码覆盖率达到80%以上

* 没有类型错误

## 6. 潜在风险评估与应对措施

### 6.1 风险1: 现有功能回归

* **应对措施**: 编写全面的测试用例，进行回归测试

* **缓解策略**: 逐步修改API路由文件，每次只修改一个模块

### 6.2 风险2: API调用失败

* **应对措施**: 实现完善的错误处理和重试机制

* **缓解策略**: 保留旧的API调用方式作为fallback

### 6.3 风险3: 性能问题

* **应对措施**: 优化API客户端配置，添加缓存机制

* **缓解策略**: 监控API调用性能，及时调整配置

### 6.4 风险4: 类型定义不完整

* **应对措施**: 编写完整的TypeScript类型定义，使用严格模式

* **缓解策略**: 逐步完善类型定义，优先处理核心模块

### 6.5 风险5: 开发时间超出预期

* **应对措施**: 制定详细的开发计划，设置里程碑

* **缓解策略**: 优先实现核心功能，其他功能逐步完善

## 7. 重构后的维护与扩展指南

### 7.1 代码规范

* 遵循TypeScript最佳实践

* 使用ESLint和Prettier保持代码风格一致

* 编写清晰的注释和文档

### 7.2 扩展指南

* 添加新API端点的步骤

* 添加新模块的步骤

* 配置新的拦截器或中间件

### 7.3 维护建议

* 定期更新依赖包

* 监控API调用性能和错误率

* 持续完善测试用例

* 定期进行代码审查

### 7.4 文档管理

* 维护API文档

* 更新类型定义文档

* 编写使用示例和教程

* 记录API变更日志

## 8. 核心代码实现示例

### 8.1 API客户端配置示例（优化版）

```typescript
// src/api/client/config.ts
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '5000'),
  headers: {
    accept: '*/*',
    'Content-Type': 'application/json',
  },
};

// src/api/client/axiosInstance.ts
import axios from 'axios';
import { apiConfig } from './config';
import { requestInterceptor } from './interceptors/request';
import { responseInterceptor } from './interceptors/response';

const axiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
});

// 添加拦截器
axiosInstance.interceptors.request.use(requestInterceptor);
axiosInstance.interceptors.response.use(responseInterceptor);

export default axiosInstance;
```

### 8.2 请求处理逻辑函数示例（优化版）

```typescript
// src/api/handlers/auth/loginHandler.ts
import { NextRequest, NextResponse } from 'next/server';
import apiClient from '../../client';
import { LOGIN_ENDPOINT } from '../../endpoints/auth';
import { LoginRequest, LoginResponse } from '../../types/auth/login';

export async function handleLogin(req: NextRequest): Promise<NextResponse> {
  try {
    const requestData: LoginRequest = await req.json();
    const response = await apiClient.post(LOGIN_ENDPOINT, requestData);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 统一错误处理
    return NextResponse.json(
      { code: 500, message: '登录失败', timestamp: Date.now() },
      { status: 500 }
    );
  }
}
```

### 8.3 API路由文件简化示例（优化版）

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleLogin } from '../../../../api/handlers/auth/loginHandler';

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleLogin(req);
}
```

## 9. 结论

通过本次重构，我们将建立一套统一、高效、安全的API请求架构，保留Next.js中间层的安全性，同时提高代码的可维护性和可扩展性。新架构将采用统一的API客户端封装，标准化的响应处理，完整的TypeScript类型定义，以及环境变量配置管理，使API调用更加简单、安全和可靠。

重构后，各API路由文件将更加简洁，代码重复度将大大降低，同时保持与现有业务逻辑的兼容性。新架构将为后续的功能扩展和维护提供良好的基础。
