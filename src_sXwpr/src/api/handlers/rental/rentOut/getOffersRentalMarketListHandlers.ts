// 获取出租市场列表处理函数

// 导入Next.js响应对象
import { NextResponse } from 'next/server';
// 导入API客户端
import apiClient from '../../../client';
// 导入端点定义
import { GET_OFFERS_RENTAL_MARKET_LIST_ENDPOINT } from '../../../endpoints/rental';
// 导入错误处理相关函数
import { handleApiError, createErrorResponse } from '../../../client/errorHandler';
// 导入类型定义
import { GetOffersRentalMarketListApiResponse, GetOffersRentalMarketListResponseData } from '../../../types/rental/rentOut/getOffersRentalMarketListTypes';
// 导入通用类型
import { ApiResponse } from '../../../types/common';

/**
 * 获取出租市场列表处理函数
 * @param my - 是否获取当前用户的出租信息，1表示是，空字符串或其他值表示否
 * @returns NextResponse对象，包含出租市场列表数据
 */
export async function handleGetOffersRentalMarketList(my: string = ''): Promise<NextResponse> {
  try {
    // 使用API客户端发送请求，传递my参数
    const response = await apiClient.get<GetOffersRentalMarketListApiResponse>(
      GET_OFFERS_RENTAL_MARKET_LIST_ENDPOINT,
      {
        params: {
          my: my
        }
      }
    );
    
    // 处理后端返回的响应，转换为标准化的ApiResponse格式
    const normalizedResponse: ApiResponse<GetOffersRentalMarketListResponseData> = {
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
