// 创建求租信息API处理函数

import { NextResponse } from 'next/server';
import apiClient from '@/api/client';
import { CREATE_REQUEST_RENTAL_INFO_ENDPOINT } from '@/api/endpoints/rental';
import { ApiError, handleApiError, createErrorResponse } from '@/api/client/errorHandler';
import { CreateRequestRentalInfoParams, CreateRequestRentalInfoApiResponse, CreateRequestRentalInfoResponse } from '@/api/types/rental/requestRental/createRequestRentalInfoTypes';

/**
 * 创建求租信息API处理函数
 * @param params 创建求租信息的参数
 * @returns NextResponse对象
 */
export async function handleCreateRequestRentalInfo(params: CreateRequestRentalInfoParams): Promise<NextResponse> {
  try {
    // 使用apiClient发送POST请求，调用后端API
    const response = await apiClient.post<CreateRequestRentalInfoApiResponse>(
      CREATE_REQUEST_RENTAL_INFO_ENDPOINT,
      params
    );

    // 如果API调用成功，返回标准化的成功响应
    const successResponse: CreateRequestRentalInfoResponse = {
      success: true,
      message: response.data.message,
      data: response.data.data
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    // 处理API错误，转换为标准化的错误响应
    const apiError: ApiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}