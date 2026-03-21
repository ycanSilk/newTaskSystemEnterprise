// 快捷派单配置更新处理函数

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import apiClient from '../../client';
import { UPDATE_QUICK_TASK_CONFIG_ENDPOINT } from '../../endpoints/quickTask';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { UpdateQuickTaskConfigRequest, UpdateQuickTaskConfigResponseData, UpdateQuickTaskConfigResponse } from '../../types/quickTask/updateConfigTypes';

/**
 * 更新快捷派单配置
 * @param request NextRequest - 请求对象
 * @returns NextResponse - 标准化的API响应
 */
export async function handleUpdateQuickTaskConfig(request: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestData: UpdateQuickTaskConfigRequest = await request.json();
    
    // 调用API更新快捷派单配置
    const response = await apiClient.post<UpdateQuickTaskConfigResponseData>(
      UPDATE_QUICK_TASK_CONFIG_ENDPOINT,
      requestData
    );
    
    // 构建成功响应
    const successResponse: UpdateQuickTaskConfigResponse = {
      success: true,
      message: response.data.message,
      data: response.data.data
    };
    
    // 返回成功响应
    return NextResponse.json(successResponse, { status: response.status });
  } catch (error) {
    // 处理错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse: UpdateQuickTaskConfigResponse = createErrorResponse(apiError);
    
    // 返回错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
