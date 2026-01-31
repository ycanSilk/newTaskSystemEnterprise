// 获取任务列表API处理函数
// 该文件实现了获取任务列表API的处理逻辑，遵循API_REQUEST_STANDARD.md的规范

import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { GET_PUBLISHED_TASKS_LIST_ENDPOINT } from '../../endpoints/task';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import type { GetTasksListResponse } from '../../types/task/getTasksListTypes';
import type { ApiResponse } from '../../types/common';

/**
 * 获取任务列表API处理函数
 * @param request - Next.js请求对象，包含请求参数和相关信息
 * @returns NextResponse - 标准化的API响应
 */
export async function handleGetTasksList(request: Request): Promise<NextResponse> {
  try {
    // 解析请求URL，获取查询参数
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    // 构建API请求URL，包含status参数
    let apiUrl = GET_PUBLISHED_TASKS_LIST_ENDPOINT;
    if (status) {
      apiUrl += `?status=${status}`;
    }
    
    // 使用apiClient发送GET请求，不手动处理Token，依赖API客户端内置的Token处理
    // 这里使用ApiResponse类型，包含完整的响应结构
    const response = await apiClient.get<ApiResponse<GetTasksListResponse>>(
      apiUrl
    );
    
    // 直接返回标准化的API响应
    // 响应拦截器已经处理了标准化，所以直接返回即可
    console.log('获取任务列表API响应:', response.data);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 统一处理错误，转换为标准化的ApiError对象
    const apiError: ApiError = handleApiError(error);
    
    // 创建标准化的错误响应
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 返回错误响应，使用错误对象中的状态码
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
