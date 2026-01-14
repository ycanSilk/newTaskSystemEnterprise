// Task模块 - 获取任务模板请求处理逻辑
// 这个文件包含了处理获取任务模板请求的核心逻辑

// 导入Next.js的响应类型
import { NextResponse } from 'next/server';
// 导入API客户端实例，用于发送HTTP请求
import apiClient from '../../client';
// 导入获取任务模板端点常量
import { PUBLISH_TASK_TEMPLATE_ENDPOINT } from '../../endpoints/task';
// 导入错误处理相关的函数和类型
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
// 导入通用API响应类型
import { ApiResponse } from '../../types/common';
// 导入获取任务模板的响应类型
import { GetTaskTemplatesResponseData } from '../../types/task/getTaskTemplatesTypes';

/**
 * 处理获取任务模板请求
 * @returns Next.js响应对象，包含任务模板列表或错误信息
 */
export async function handleGetTaskTemplates(): Promise<NextResponse> {
  try {
    // 调用API客户端发送GET请求到获取任务模板端点
    // API客户端内置了token处理，会自动从cookie中获取token并添加到请求头
    const response = await apiClient.get<GetTaskTemplatesResponseData>(PUBLISH_TASK_TEMPLATE_ENDPOINT);
    
    // 返回响应给客户端
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 捕获并处理请求过程中发生的错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 返回错误响应给客户端
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}