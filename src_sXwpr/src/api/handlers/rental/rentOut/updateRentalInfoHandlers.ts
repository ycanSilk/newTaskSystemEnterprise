// 更新出租信息处理函数
import { NextResponse } from 'next/server';
import apiClient from '../../../client';
import { UPDATE_OFFERS_RENTAL_INFO_ENDPOINT } from '../../../endpoints/rental/index';
import { ApiError, ApiErrorType, handleApiError, createErrorResponse } from '../../../client/errorHandler';
import { UpdateRentalInfoRequest, UpdateRentalInfoResponse } from '../../../types/rental/rentOut/updateRentalInfoTypes';

/**
 * 更新出租信息处理函数
 * @param request - 请求对象，包含更新出租信息的参数
 * @returns NextResponse - 包含更新结果的响应
 */
export async function handleUpdateRentalInfo(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestData: UpdateRentalInfoRequest = await request.json();
    
    // 发送更新出租信息请求
    const response = await apiClient.post<UpdateRentalInfoResponse>(
      UPDATE_OFFERS_RENTAL_INFO_ENDPOINT,
      requestData
    );
    
    // 处理响应数据
    const { code, message, data, timestamp } = response.data;
    
    // 检查响应是否成功
    if (code !== 0) {
      // 创建错误响应
      const errorResponse = createErrorResponse({
        type: ApiErrorType.PARAM_ERROR,
        status: 400,
        message: message || '更新出租信息失败',
        code: code
      });
      
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // 创建成功响应
    const successResponse = {
      success: true,
      message: message || '信息更新成功',
      data: data,
      code: code,
      timestamp: timestamp
    };
    
    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    // 处理错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
