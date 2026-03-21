// 快捷派单处理函数

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import apiClient from '../../client';
import { CREATE_QUICK_TASK_ENDPOINT } from '../../endpoints/quickTask';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { CreateQuickTaskRequest, CreateQuickTaskResponseData, CreateQuickTaskResponse } from '../../types/quickTask/quickTaskTypes';

/**
 * 创建快捷派单
 * @param requestData CreateQuickTaskRequest - 请求数据
 * @returns NextResponse - 标准化的API响应
 */
export async function handleCreateQuickTask(requestData: CreateQuickTaskRequest): Promise<NextResponse> {
  try {
    console.log('创建快捷派单请求数据', requestData);
    // 调用API创建快捷派单
    const response = await apiClient.post<CreateQuickTaskResponseData>(
      CREATE_QUICK_TASK_ENDPOINT,
      requestData
    );
    console.log('真正请求API的结果', response.data);
    
    // 构建成功响应
    const successResponse: CreateQuickTaskResponse = {
      success: true,
      message: response.data.message,
      data: response.data.data
    };
    
    // 返回成功响应
    return NextResponse.json(successResponse, { status: response.status });
  } catch (error) {
    // 处理错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse: CreateQuickTaskResponse = createErrorResponse(apiError);
    
    // 返回错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
