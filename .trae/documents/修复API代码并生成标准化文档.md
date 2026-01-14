# API请求和调用标准化修复计划

## 问题分析

之前生成的代码不符合项目的API标准化规范，主要问题是：

1. `getTaskTemplatesHandler.ts` 手动获取token，而API客户端已内置token处理
2. `route.ts` 中间件文件不需要手动处理token，直接调用API即可
3. 未遵循项目现有的API架构和命名规范

## 修复方案

### 1. 修复 `getTaskTemplatesHandler.ts` 文件

* 移除手动获取token的逻辑，使用API客户端内置的token处理

* 简化函数签名，不需要传入token参数

* 遵循项目统一的错误处理机制

* 函数命名改为 `handleGetTaskTemplates`

### 2. 修复 `route.ts` 文件

* 简化路由处理函数，直接调用处理函数

* 移除手动获取token的逻辑

* 添加不支持的HTTP方法处理，返回405错误

* 移除不必要的日志记录

### 3. 生成API请求和调用标准化文档

* 文档名称：`API_REQUEST_STANDARD.md`

* 文档位置：项目根目录

* 文档内容包括：

  * API客户端架构

  * API处理函数规范

  * API路由规范

  * 类型定义规范

  * RESTful API设计

  * 中间件处理

  * 错误处理规范

## 修复代码示例

### `src/api/handlers/task/getTaskTemplatesHandler.ts`

```typescript
// Task模块 - 获取任务模板请求处理逻辑
import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { PUBLISH_TASK_TEMPLATE_ENDPOINT } from '../../endpoints/task';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { ApiResponse } from '../../types/common';
import { GetTaskTemplatesResponseData } from '../../types/task/getTaskTemplatesTypes';

export async function handleGetTaskTemplates(): Promise<NextResponse> {
  try {
    const response = await apiClient.get<GetTaskTemplatesResponseData>(PUBLISH_TASK_TEMPLATE_ENDPOINT);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const apiError: ApiError = handleApiError(error);
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
```

### `src/app/api/task/getTaskTemplates/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { handleGetTaskTemplates } from '../../../../api/handlers/task/getTaskTemplatesHandler';

export async function GET(): Promise<NextResponse> {
  return handleGetTaskTemplates();
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

export async function PUT(): Promise<NextResponse> {
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

export async function DELETE(): Promise<NextResponse> {
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
```

## 预期结果

* 修复后的代码符合项目的API标准化规范

* API客户端自动处理token，无需手动传递

* 路由文件简化，直接调用处理函数

* 生成完整的API请求和调用标准化文档，指导后续开发

