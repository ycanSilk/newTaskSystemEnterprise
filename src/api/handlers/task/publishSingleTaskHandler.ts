// 发布单个任务API处理函数
// 该文件实现了发布单个任务API的处理逻辑，遵循API_REQUEST_STANDARD.md的规范

import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { PUBLISH_SINGLE_TASK_ENDPOINT } from '../../endpoints/task';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import type { PublishSingleTaskRequest, PublishSingleTaskResponse, ApiResponse } from '../../types/task/publishSingleTaskTypes';

/**
 * 发布单个任务API处理函数
 * @param request - Next.js请求对象，包含请求体和相关信息
 * @returns NextResponse - 标准化的API响应
 */
export async function handlePublishSingleTask(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体，获取发布任务所需的数据
    const requestData: PublishSingleTaskRequest = await request.json();
    
    // 使用apiClient发送POST请求，不手动处理Token，依赖API客户端内置的Token处理
    const response = await apiClient.post<PublishSingleTaskResponse>(
      PUBLISH_SINGLE_TASK_ENDPOINT,
      requestData
    );
    
    // 从响应中提取数据
    const { code, message, data, timestamp } = response.data;
    
    // 创建标准化的API响应
    const apiResponse: ApiResponse<typeof data> = {
      success: code === 0,
      code,
      message,
      timestamp,
      data: code === 0 ? data : null
    };
    
    // 返回标准化的JSON响应
    return NextResponse.json(apiResponse, { status: response.status });
  } catch (error) {
    // 统一处理错误，转换为标准化的ApiError对象
    const apiError: ApiError = handleApiError(error);
    
    // 创建标准化的错误响应
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 返回错误响应，使用错误对象中的状态码
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
