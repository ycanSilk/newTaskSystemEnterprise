// Task模块 - 审核任务处理函数
// 这个文件实现了审核任务的业务逻辑，用于处理审核任务请求
import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { APPROVE_TASK_ENDPOINT } from '../../endpoints/task';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { ReviewTaskRequest, ReviewTaskResponseData, ApiResponse } from '../../types/task/reviewTaskTypes';

/**
 * 处理审核任务请求
 * @param request - 请求对象，包含审核任务的相关信息
 * @returns NextResponse - 包含审核结果的响应对象
 */
export async function handleReviewTask(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体，获取审核任务参数
    const requestData: ReviewTaskRequest = await request.json();
    
    // 使用apiClient发送审核任务请求
    const response = await apiClient.post<ReviewTaskResponseData>(APPROVE_TASK_ENDPOINT, requestData);
    
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
