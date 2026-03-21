// 快捷派单配置获取处理函数

import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { GET_QUICK_TASK_CONFIG_ENDPOINT } from '../../endpoints/quickTask';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { GetQuickTaskConfigResponseData, GetQuickTaskConfigResponse } from '../../types/quickTask/getConfigTypes';

/**
 * 获取快捷派单配置
 * @returns NextResponse - 标准化的API响应
 */
export async function handleGetQuickTaskConfig(): Promise<NextResponse> {
  try {
    // 调用API获取快捷派单配置
    const response = await apiClient.get<GetQuickTaskConfigResponseData>(GET_QUICK_TASK_CONFIG_ENDPOINT);
    
    // 构建成功响应
    const successResponse: GetQuickTaskConfigResponse = {
      success: true,
      message: response.data.message,
      data: response.data.data
    };
    
    // 返回成功响应
    return NextResponse.json(successResponse, { status: response.status });
  } catch (error) {
    // 处理错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse: GetQuickTaskConfigResponse = createErrorResponse(apiError);
    
    // 返回错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
