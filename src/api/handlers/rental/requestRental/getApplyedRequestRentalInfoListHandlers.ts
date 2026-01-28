import { NextResponse } from 'next/server';
import apiClient from '../../../client';
import { GET_APPLIED_REQUEST_RENTAL_INFO_LIST_ENDPOINT } from '../../../endpoints/rental';
import { ApiError, handleApiError, createErrorResponse } from '../../../client/errorHandler';
import { GetApplyedRequestRentalInfoListResponseData, GetApplyedRequestRentalInfoListResponse } from '../../../types/rental/requestRental/getApplyedRequestRentalInfoListTypes';

/**
 * 处理获取已申请的求租信息列表
 * @param page - 页码
 * @param pageSize - 每页大小
 * @returns 标准化的API响应
 */
export async function handleGetApplyedRequestRentalInfoList(
  page: number,
  pageSize: number
): Promise<NextResponse> {
  try {
    // 构建查询参数
    const params = {
      page,
      page_size: pageSize
    };
    
    // 使用apiClient发送GET请求
    const response = await apiClient.get<GetApplyedRequestRentalInfoListResponseData>(
      GET_APPLIED_REQUEST_RENTAL_INFO_LIST_ENDPOINT,
      { params }
    );
    
    // 转换为标准化的响应格式
    const standardizedResponse: GetApplyedRequestRentalInfoListResponse = {
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
