// 上下架出租信息处理函数

// 导入Next.js响应对象
import { NextResponse } from 'next/server';
// 导入API客户端
import apiClient from '@/api/client';
// 导入端点定义
import { TOGGLE_OFFERS_RENTAL_INFO_STATUS_ENDPOINT } from '@/api/endpoints/rental';
// 导入错误处理相关函数
import { handleApiError, createErrorResponse } from '@/api/client/errorHandler';
// 导入类型定义
import { 
  ToggleOffersRentalInfoStatusApiResponse, 
  ToggleOffersRentalInfoStatusRequest, 
  ToggleOffersRentalInfoStatusResponseData 
} from '@/api/types/rental/rentOut/toggleOffersRentalInfoStatusTypes';
// 导入通用类型
import { ApiResponse } from '@/api/types/common';

/**
 * 上下架出租信息处理函数
 * @param requestBody - 包含offer_id和status的请求体
 * @returns NextResponse对象，包含上下架结果
 */
export async function handleToggleOffersRentalInfoStatus(
  requestBody: ToggleOffersRentalInfoStatusRequest
): Promise<NextResponse> {
  try {
    // 使用API客户端发送请求
    const response = await apiClient.post<ToggleOffersRentalInfoStatusApiResponse>(
      TOGGLE_OFFERS_RENTAL_INFO_STATUS_ENDPOINT,
      requestBody
    );
    
    // 处理后端返回的响应，转换为标准化的ApiResponse格式
    const normalizedResponse: ApiResponse<ToggleOffersRentalInfoStatusResponseData> = {
      success: response.data.code === 0,
      code: response.data.code,
      message: response.data.message,
      data: response.data.data,
      timestamp: response.data.timestamp
    };
    
    // 返回标准化的响应
    return NextResponse.json(normalizedResponse, { status: response.status });
  } catch (error) {
    // 处理错误
    const apiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    
    // 返回错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}