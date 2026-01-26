import { NextResponse } from 'next/server';
import apiClient from '@/api/client';
import { TOGGLE_REQUEST_RENTAL_INFO_STATUS_ENDPOINT } from '@/api/endpoints/rental';
import { handleApiError, createErrorResponse } from '@/api/client/errorHandler';
import type { ToggleRequestRentalInfoStatusRequest, ToggleRequestRentalInfoStatusResponse } from '@/api/types/rental/requestRental/toggleRequestRentalInfoStatusTypes';
import type { ApiError } from '@/api/client/errorHandler';

/**
 * 处理上下架求租信息请求
 * @param request - 请求对象，包含上下架求租信息的参数
 * @returns NextResponse - 标准化的API响应
 */
export async function handleToggleRequestRentalInfoStatus(request: Request): Promise<NextResponse> {
  try {
    // 从请求中获取JSON数据
    const requestData: ToggleRequestRentalInfoStatusRequest = await request.json();
    
    // 使用API客户端发送请求到后端API
    const response = await apiClient.post<ToggleRequestRentalInfoStatusResponse>(
      TOGGLE_REQUEST_RENTAL_INFO_STATUS_ENDPOINT,
      requestData
    );
    
    // 返回标准化的响应
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 处理错误，将原始错误转换为标准化的ApiError对象
    const apiError: ApiError = handleApiError(error);
    // 创建标准化的错误响应
    const errorResponse = createErrorResponse(apiError);
    // 返回错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
