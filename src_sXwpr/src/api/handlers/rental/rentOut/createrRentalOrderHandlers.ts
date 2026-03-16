// 出租信息下单接口处理函数
import { NextResponse } from 'next/server';
import apiClient from '@/api/client';
import { CREATE_RENTAL_ORDER_ENDPOINT } from '@/api/endpoints/rental';
import { ApiError, handleApiError, createErrorResponse } from '@/api/client/errorHandler';
import { CreateRentalOrderRequest, CreateRentalOrderResponse } from '@/api/types/rental/rentOut/createrRentalOrderTypes';

/**
 * 出租信息下单接口处理函数
 * @param request - 请求对象
 * @returns NextResponse - 响应对象
 */
export async function handleCreateRentalOrder(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestData: CreateRentalOrderRequest = await request.json();
    
    // 发送请求到后端API
    const response = await apiClient.post<CreateRentalOrderResponse>(CREATE_RENTAL_ORDER_ENDPOINT, requestData);
    
    // 处理响应
    if (response.data.code === 0) {
      // 成功响应
      return NextResponse.json({
        success: true,
        message: response.data.message,
        data: response.data.data,
        code: response.data.code,
        timestamp: response.data.timestamp
      }, { status: 200 });
    } else {
      // 失败响应
      return NextResponse.json({
        success: false,
        message: response.data.message,
        data: null,
        code: response.data.code,
        timestamp: response.data.timestamp
      }, { status: 400 });
    }
  } catch (error) {
    // 处理错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
