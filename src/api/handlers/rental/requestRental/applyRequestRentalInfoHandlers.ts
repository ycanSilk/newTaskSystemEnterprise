import { NextResponse } from 'next/server';
import apiClient from '../../../client';
import { APPLY_REQUEST_RENTAL_INFO_ENDPOINT } from '../../../endpoints/rental';
import { ApiError, handleApiError, createErrorResponse } from '../../../client/errorHandler';
import { ApplyRequestRentalInfoResponseData, ApplyRequestRentalInfoRequest, ApplyRequestRentalInfoResponse } from '../../../types/rental/requestRental/applyRequestRentalInfoTypes';

/**
 * 处理求租信息应征申请
 * @param requestBody - 应征申请请求参数
 * @returns 标准化的API响应
 */
export async function handleApplyRequestRentalInfo(requestBody: ApplyRequestRentalInfoRequest): Promise<NextResponse> {
  try {
    // 使用apiClient发送POST请求
    const response = await apiClient.post<ApplyRequestRentalInfoResponseData>(
      APPLY_REQUEST_RENTAL_INFO_ENDPOINT,
      requestBody
    );
    
    // 转换为标准化的响应格式
    const standardizedResponse: ApplyRequestRentalInfoResponse = {
      success: response.data.code === 0,
      message: response.data.message,
      data: response.data.data
    };
    
    // 返回标准化的响应
    return NextResponse.json(standardizedResponse, { status: 200 });
  } catch (error) {
    // 统一处理错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    
    // 返回错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
