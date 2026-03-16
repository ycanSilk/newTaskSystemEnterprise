// Task模块 - 获取待审核任务列表处理函数
// 这个文件实现了获取待审核任务列表的业务逻辑，用于处理获取待审核任务列表请求
import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { GET_PENDING_TASKS_LIST_ENDPOINT } from '../../endpoints/task';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { PendingTasksListApiResponse, ApiResponse } from '../../types/task/pendingTasksListTypes';

/**
 * 处理获取待审核任务列表请求
 * @returns NextResponse - 包含待审核任务列表结果的响应对象
 */
export async function handlePendingTasksList(): Promise<NextResponse> {
  try {
    // 使用apiClient发送获取待审核任务列表请求
    const response = await apiClient.get<PendingTasksListApiResponse>(GET_PENDING_TASKS_LIST_ENDPOINT);
    
    // 返回标准化的成功响应
    return NextResponse.json({
      success: true,
      code: response.data.code,
      message: response.data.message,
      timestamp: response.data.timestamp,
      data: response.data.data
    }, { status: 200 });
  } catch (error) {
    // 处理错误，转换为标准化的错误响应
    const apiError: ApiError = handleApiError(error);
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 返回标准化的错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
