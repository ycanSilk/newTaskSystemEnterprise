// API处理函数：获取求租信息详情
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import apiClient from '@/api/client';
import { GET_REQUEST_RENTAL_INFO_DETAIL_ENDPOINT } from '@/api/endpoints/rental';
import { ApiError, ApiErrorType, handleApiError, createErrorResponse } from '@/api/client/errorHandler';
import { GetRequestRentalInfoDetailResponse } from '@/api/types/rental/requestRental/getRequestRentalInfoDetail';

/**
 * 获取求租信息详情的API处理函数
 * @param request - NextRequest对象，用于获取查询参数
 * @returns Promise<NextResponse> - 标准化的API响应
 */
export async function handleGetRequestRentalInfoDetail(request: NextRequest): Promise<NextResponse> {
  try {
    // 从查询参数中获取demand_id
    const demandId = request.nextUrl.searchParams.get('demand_id');
    
    if (!demandId) {
      return NextResponse.json(
        createErrorResponse({ type: ApiErrorType.PARAM_ERROR, status: 400, message: '缺少必要参数demand_id', code: 400 }),
        { status: 400 }
      );
    }
    
    // 构建请求URL，添加demand_id参数
    const requestUrl = `${GET_REQUEST_RENTAL_INFO_DETAIL_ENDPOINT}?demand_id=${demandId}`;
    
    // 使用API客户端发送GET请求
    const response = await apiClient.get<GetRequestRentalInfoDetailResponse>(requestUrl);
    
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
