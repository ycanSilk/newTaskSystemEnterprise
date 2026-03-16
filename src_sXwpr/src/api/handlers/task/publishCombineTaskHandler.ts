// 发布组合任务API处理函数
// 用于处理发布组合任务的API请求，调用后端API并返回标准化响应

// 导入NextResponse，用于返回标准化的HTTP响应
import { NextResponse } from 'next/server';
// 导入API客户端，用于发送请求到后端API
import apiClient from '../../client';
// 导入发布组合任务的端点常量
import { PUBLISH_COMBINED_TASK_ENDPOINT } from '../../endpoints/task/index';
// 导入错误处理相关的函数
import { handleApiError, createErrorResponse } from '../../client/errorHandler';
// 导入发布组合任务的请求和响应类型
import type { PublishCombineTaskRequest, PublishCombineTaskBackendResponse } from '../../types/task/publishCombineTaskTypes';

/**
 * 处理发布组合任务的API请求
 * @param request 请求对象，包含发布组合任务的参数
 * @returns 返回标准化的HTTP响应
 */
export async function handlePublishCombineTask(request: Request): Promise<NextResponse> {
  try {
    // 从请求体中解析出发布组合任务的参数
    const requestData: PublishCombineTaskRequest = await request.json();
    
    // 使用API客户端发送POST请求到发布组合任务端点
    const response = await apiClient.post<PublishCombineTaskBackendResponse>(
      PUBLISH_COMBINED_TASK_ENDPOINT,
      requestData
    );
    
    // 返回标准化的响应，使用后端API返回的数据
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 处理错误，将原始错误转换为标准化的ApiError对象
    const apiError = handleApiError(error);
    // 创建标准化的错误响应
    const errorResponse = createErrorResponse(apiError);
    // 返回标准化的错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
