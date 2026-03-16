// API处理函数：获取求租市场列表
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import apiClient from '@/api/client';
import { GET_REQUEST_RENTAL_MARKET_LIST_ENDPOINT } from '@/api/endpoints/rental';
import { ApiError, handleApiError, createErrorResponse } from '@/api/client/errorHandler';
import { GetRequestRentalMarketListResponse } from '@/api/types/rental/requestRental/getRequestRentalMarketListTypes';

/**
 * 获取求租市场列表的API处理函数
 * @param request - NextRequest对象，用于获取查询参数
 * @returns Promise<NextResponse> - 标准化的API响应
 */
export async function handleGetRequestRentalMarketList(request: NextRequest): Promise<NextResponse> {
  try {
    // 从查询参数中获取分页信息
    const page = request.nextUrl.searchParams.get('page') || '1';
    const pageSize = request.nextUrl.searchParams.get('page_size') || '20';
    const mynumber = request.nextUrl.searchParams.get('my') || '';
    
    // 构建请求URL，添加分页参数
    const requestUrl = `${GET_REQUEST_RENTAL_MARKET_LIST_ENDPOINT}?page=${page}&page_size=${pageSize}&my=${mynumber}`;
    
    // 使用API客户端发送GET请求
    const response = await apiClient.get<GetRequestRentalMarketListResponse>(requestUrl);
    
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
