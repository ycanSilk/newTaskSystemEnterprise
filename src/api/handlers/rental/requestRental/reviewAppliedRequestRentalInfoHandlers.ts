// 审核求租信息应征申请 - API处理函数
import { NextResponse } from 'next/server';
import apiClient from '../../../client';
import { REVIEW_APPLIED_REQUEST_RENTAL_INFO_ENDPOINT } from '../../../endpoints/rental';
import { handleApiError, createErrorResponse } from '../../../client/errorHandler';
import type { ReviewAppliedRequestRentalInfoRequest, ReviewAppliedRequestRentalInfoResponse } from '../../../types/rental/requestRental/reviewAppliedRequestRentalInfoTypes';

/**
 * 审核求租信息应征申请处理函数
 * @param requestBody 审核请求参数
 * @returns NextResponse - 包含审核结果的标准化响应
 */
export async function handleReviewAppliedRequestRentalInfo(
  requestBody: ReviewAppliedRequestRentalInfoRequest
): Promise<NextResponse> {
  try {
    // 使用API客户端发送请求
    const response = await apiClient.post<ReviewAppliedRequestRentalInfoResponse>(
      REVIEW_APPLIED_REQUEST_RENTAL_INFO_ENDPOINT,
      requestBody
    );

    // 处理成功响应
    const responseData = response.data;
    
    // 返回标准化的成功响应
    return NextResponse.json({
      success: true,
      message: responseData.message,
      data: responseData.data,
      code: responseData.code,
      timestamp: responseData.timestamp
    }, { status: 200 });
  } catch (error) {
    // 统一处理错误
    const apiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    
    // 返回标准化的错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
