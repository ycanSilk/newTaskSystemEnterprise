// API处理函数：获取出租信息详情
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import apiClient from '@/api/client';
import { GET_OFFERS_RENTAL_INFO_DETAIL_ENDPOINT } from '@/api/endpoints/rental';
import { ApiError, handleApiError, createErrorResponse } from '@/api/client/errorHandler';
import { GetOffersRentalInfoDetailResponseData } from '@/api/types/rental/rentOut/getOffersRentalInfoDetailTypes';

/**
 * 获取出租信息详情的API处理函数
 * @param request - NextRequest对象，用于获取查询参数
 * @returns Promise<NextResponse> - 标准化的API响应
 */
export async function handleGetOffersRentalInfoDetail(request: NextRequest): Promise<NextResponse> {
  try {
    // 从查询参数中获取offer_id
    const offerId = request.nextUrl.searchParams.get('offer_id');
    
    if (!offerId) {
      return NextResponse.json(
        {
          code: 400,
          message: '缺少必要的参数offer_id',
          data: null,
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }
    
    // 使用API客户端发送GET请求，附带offer_id参数
    const response = await apiClient.get<GetOffersRentalInfoDetailResponseData>(
      `${GET_OFFERS_RENTAL_INFO_DETAIL_ENDPOINT}?offer_id=${offerId}`
    );
    
    // 返回标准化的成功响应
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 处理API错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    
    // 返回标准化的错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
