// 关闭工单API处理函数
// 用于处理关闭工单的API请求
import { NextResponse } from 'next/server';
import apiClient from '@/api/client';
import { CLOSE_WORK_ORDER_ENDPOINT } from '@/api/endpoints/workorder';
import { handleApiError, createErrorResponse } from '@/api/client/errorHandler';
import { CloseWorkOrderRequest, CloseWorkOrderResponseData } from '@/api/types/workorder/closeWorkOrderTypes';

/**
 * 关闭工单API处理函数
 * @param request 请求对象，包含关闭工单的参数
 * @returns NextResponse 对象，包含API响应数据
 */
export async function handleCloseWorkOrder(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体，获取关闭工单的参数
    const requestBody: CloseWorkOrderRequest = await request.json();
    
    // 调用API客户端发送POST请求，关闭工单
    const response = await apiClient.post<CloseWorkOrderResponseData>(CLOSE_WORK_ORDER_ENDPOINT, requestBody);
    
    // 返回成功响应，使用NextResponse.json包装
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 处理错误，将原始错误转换为标准化的ApiError对象
    const apiError = handleApiError(error);
    // 创建标准化的错误响应
    const errorResponse = createErrorResponse(apiError);
    // 返回错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}