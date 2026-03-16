// 我出售的租赁订单列表 - API处理函数
import { NextResponse } from 'next/server';
import apiClient from '@/api/client';
import { MY_SELLER_RENTAL_ORDER_LIST_ENDPOINT } from '@/api/endpoints/rental';
import { handleApiError, createErrorResponse } from '@/api/client/errorHandler';
import type { MySellerRentalOrderListResponseData } from '@/api/types/rental/order/mySellerRentalOrderListTypes';

/**
 * 获取我出售的租赁订单列表处理函数
 * @returns NextResponse - 包含订单列表的标准化响应
 */
export async function handleMySellerRentalOrderList(): Promise<NextResponse> {
  try {
    // 使用API客户端发送GET请求
    const response = await apiClient.get<MySellerRentalOrderListResponseData>(
      MY_SELLER_RENTAL_ORDER_LIST_ENDPOINT
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
