// 创建出租报价API处理函数
import { NextResponse } from 'next/server';
import apiClient from '@/api/client';
import { CREATE_OFFERS_RENTAL_INFO_ENDPOINT } from '@/api/endpoints/rental/index';
import { ApiError, handleApiError, createErrorResponse } from '@/api/client/errorHandler';
import { CreateOffersRentalInfoRequest, CreateOffersRentalInfoResponse } from '@/api/types/rental/rentOut/createOffersRentalnfoTypes';

/**
 * 创建出租报价处理函数
 * @param request 请求对象
 * @returns NextResponse
 */
export async function handleCreateOffersRentalInfo(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestData: CreateOffersRentalInfoRequest = await request.json();
    
    // 使用apiClient发送POST请求
    const response = await apiClient.post<CreateOffersRentalInfoResponse>(
      CREATE_OFFERS_RENTAL_INFO_ENDPOINT,
      requestData
    );
    
    // 返回标准化响应
    return NextResponse.json(
      {
        success: true,
        message: response.data.message,
        data: response.data.data,
        code: response.data.code,
        timestamp: response.data.timestamp
      },
      { status: 200 }
    );
  } catch (error) {
    // 处理错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}