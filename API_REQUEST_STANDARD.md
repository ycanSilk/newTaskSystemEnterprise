# API请求和调用标准化文档

## 1. 项目概述

本项目采用前后端分离架构，前端使用Next.js框架，后端使用PHP开发。为了实现前后端通信的标准化和统一化，我们建立了一套完整的API请求和调用规范。

## 2. API架构

### 2.1 整体架构

```
前端组件 → API路由 → API处理函数 → API客户端 → 后端API
```

### 2.2 目录结构

```
src/
├── api/
│   ├── client/              # API客户端相关代码
│   │   ├── axiosInstance.ts  # Axios实例配置
│   │   ├── config.ts         # API配置
│   │   ├── errorHandler.ts   # 错误处理
│   │   ├── interceptors/     # 拦截器
│   │   │   ├── request.ts    # 请求拦截器
│   │   │   └── response.ts   # 响应拦截器
│   │   └── index.ts          # API客户端入口
│   ├── endpoints/           # API端点定义
│   │   ├── task/            # 任务相关端点
│   │   ├── users/           # 用户相关端点
│   │   └── wallet/          # 钱包相关端点
│   ├── handlers/            # API处理函数
│   │   ├── task/            # 任务相关处理函数
│   │   ├── users/           # 用户相关处理函数
│   │   └── wallet/          # 钱包相关处理函数
│   └── types/               # API类型定义
│       ├── common/          # 通用类型
│       ├── task/            # 任务相关类型
│       ├── users/           # 用户相关类型
│       └── wallet/          # 钱包相关类型
└── app/
    └── api/                 # Next.js API路由
        ├── task/            # 任务相关路由
        ├── users/           # 用户相关路由
        └── wallet/          # 钱包相关路由
```

## 3. API客户端设计

### 3.1 API客户端概述

API客户端负责处理与后端API的通信，包括请求发送、响应处理、错误处理和认证信息管理。

### 3.2 Axios实例配置

* 使用`axios.create()`创建实例，配置基础URL、超时时间和默认请求头
* 不发送Cookie，使用Next.js API路由作为中间层

### 3.3 请求拦截器

* 自动从Cookie获取Token并添加到请求头
* 支持多种Token键名，兼容旧版本
* 添加`Authorization`和`X-Token`请求头
* 添加请求ID和时间戳，用于日志追踪
* 开发环境打印请求日志

### 3.4 响应拦截器

* 统一处理响应数据格式
* 统一处理错误信息
* 开发环境打印响应日志

## 4. API处理函数规范

### 4.1 命名规范

* 函数名采用`handle`前缀 + 驼峰命名，如`handleGetTaskTemplates`
* 文件名与函数名对应，如`getTaskTemplatesHandler.ts`

### 4.2 函数签名

```typescript
export async function handleGetTaskTemplates(): Promise<NextResponse> {
  // 函数实现
}
```

### 4.3 实现规范

* 不手动获取Token，使用API客户端内置的Token处理
* 使用`apiClient`发送请求，不直接使用`axios`
* 遵循统一的错误处理机制
* 不直接返回原始响应，使用`NextResponse.json()`包装

### 4.4 示例代码

```typescript
import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { ENDPOINT } from '../../endpoints/xxx';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { ApiResponse } from '../../types/common';
import { ResponseData } from '../../types/xxx';

export async function handleGetXxx(): Promise<NextResponse> {
  try {
    const response = await apiClient.get<ResponseData>(ENDPOINT);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const apiError: ApiError = handleApiError(error);
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
```

## 5. API路由规范

### 5.1 目录结构

API路由文件位于`src/app/api/`目录下，按照功能模块组织，如：

```
src/app/api/task/getTaskTemplates/route.ts
```

### 5.2 路由处理函数

* 每个HTTP方法对应一个处理函数，如`GET`、`POST`、`PUT`、`DELETE`
* `GET`方法用于获取数据
* `POST`方法用于创建数据
* `PUT`方法用于更新数据
* `DELETE`方法用于删除数据

### 5.3 实现规范

* 简化路由处理函数，直接调用处理函数
* 不手动获取Token，由API客户端自动处理
* 添加不支持的HTTP方法处理，返回405错误
* 不直接处理业务逻辑，业务逻辑由处理函数实现

### 5.4 示例代码

```typescript
import { NextResponse } from 'next/server';
import { handleGetXxx } from '../../../../api/handlers/xxx/xxxHandler';

export async function GET(): Promise<NextResponse> {
  return handleGetXxx();
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 405,
      message: '方法不允许，请使用GET请求',
      timestamp: Date.now(),
      data: null
    },
    { status: 405 }
  );
}

// 其他HTTP方法类似
```

## 6. 类型定义规范

### 6.1 目录结构

类型定义文件位于`src/api/types/`目录下，按照功能模块组织。

### 6.2 命名规范

* 类型名采用Pascal命名法
* 响应类型以`Response`后缀，如`GetTaskTemplatesResponse`
* 数据类型以`Data`后缀，如`GetTaskTemplatesResponseData`

### 6.3 实现规范

* 使用`interface`定义对象类型
* 明确指定所有字段的类型
* 为可选字段添加`?`修饰符
* 导入外部类型，不重复定义

### 6.4 示例代码

```typescript
// 响应数据类型
interface TaskTemplate {
  id: number;
  type: 0 | 1;
  type_text: string;
  title: string;
  price: number;
  description1: string;
  description2: string;
  created_at: string;
  stage1?: TaskStage;
  stage2?: TaskStage;
  default_total_price?: number;
}

// API响应数据接口
export interface GetTaskTemplatesResponseData {
  code: number;
  message: string;
  data: TaskTemplate[];
  timestamp: number;
}

// API响应接口
export interface GetTaskTemplatesResponse {
  success: boolean;
  message: string;
  data: TaskTemplate[] | null;
}
```

## 7. RESTful API设计规范

### 7.1 资源命名

* 使用复数形式表示资源集合，如`/api/tasks`
* 使用单数形式表示单个资源，如`/api/tasks/1`
* 使用连字符`-`分隔单词，如`/api/task-templates`

### 7.2 HTTP方法

| HTTP方法 | 操作 | 示例 |
| --- | --- | --- |
| GET | 获取资源 | GET /api/tasks |
| POST | 创建资源 | POST /api/tasks |
| PUT | 更新资源 | PUT /api/tasks/1 |
| DELETE | 删除资源 | DELETE /api/tasks/1 |

### 7.3 状态码

| 状态码 | 含义 | 示例 |
| --- | --- | --- |
| 200 | 成功 | GET请求成功 |
| 201 | 创建成功 | POST请求成功 |
| 400 | 请求错误 | 参数错误 |
| 401 | 未授权 | 缺少Token |
| 403 | 禁止访问 | 权限不足 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 405 | 方法不允许 | 使用了不支持的HTTP方法 |
| 500 | 服务器错误 | 后端API错误 |

## 8. 中间件处理

### 8.1 Next.js中间件

* 用于全局Token验证和路由保护
* 位于`src/middleware.ts`
* 验证请求中的Token，未登录用户重定向到登录页
* 支持白名单配置，允许某些路由无需验证

### 8.2 API路由中间件

* 每个API路由文件都是一个中间件，处理特定的API请求
* 从Cookie获取Token，调用处理函数
* 返回标准化的响应格式

## 9. 错误处理规范

### 9.1 错误类型

* `AUTH_ERROR`：认证错误，如缺少Token、Token无效
* `VALIDATION_ERROR`：验证错误，如参数错误
* `API_ERROR`：API错误，如后端API返回错误
* `NETWORK_ERROR`：网络错误，如请求超时
* `UNKNOWN_ERROR`：未知错误

### 9.2 错误响应格式

```json
{
  "success": false,
  "code": 401,
  "message": "用户未登录",
  "timestamp": 1768189315,
  "data": null
}
```

### 9.3 错误处理流程

1. API客户端捕获错误
2. 调用`handleApiError`函数，将原始错误转换为标准化的`ApiError`对象
3. 调用`createErrorResponse`函数，创建标准化的错误响应
4. 返回错误响应给客户端

## 10. 代码风格规范

### 10.1 命名规范

* 变量名：驼峰命名，如`taskTemplates`
* 函数名：驼峰命名，如`handleGetTaskTemplates`
* 常量名：大写字母+下划线，如`PUBLISH_TASK_TEMPLATE_ENDPOINT`
* 类型名：Pascal命名法，如`TaskTemplate`

### 10.2 注释规范

* 为每个文件添加文件级注释，描述文件功能
* 为每个函数添加函数级注释，描述函数功能、参数和返回值
* 为复杂逻辑添加行级注释
* 使用JSDoc格式注释
* 为每一行代码都添加中文大白话解释级别注释

### 10.3 代码结构

* 每个文件只包含一个主要功能
* 避免嵌套过深
* 遵循单一职责原则

## 11. 最佳实践

1. **使用API客户端**：始终使用`apiClient`发送请求，不直接使用`axios`
2. **不手动获取Token**：依赖API客户端内置的Token处理
3. **使用类型定义**：为所有API请求和响应添加类型定义
4. **统一错误处理**：使用`handleApiError`和`createErrorResponse`处理错误
5. **简化API路由**：API路由只负责调用处理函数，不包含业务逻辑
6. **添加HTTP方法处理**：为所有API路由添加不支持的HTTP方法处理
7. **使用常量定义端点**：将API端点定义为常量，避免硬编码
8. **遵循RESTful设计**：按照RESTful规范设计API
9. **添加适当的日志**：在开发环境添加请求和响应日志，方便调试
10. **定期更新文档**：保持API文档与代码同步

## 12. 总结

本文档详细描述了项目的API请求和调用标准化规范，包括API架构、客户端设计、处理函数规范、路由规范、类型定义规范、RESTful API设计、中间件处理和错误处理规范等内容。

所有开发人员在进行API相关代码修改和创建时，必须严格遵循本规范，确保代码的一致性、可维护性和可读性。

## 13. 版本历史

* v1.0.0 (2026-01-14)：初始版本，定义了API请求和调用的基本规范
