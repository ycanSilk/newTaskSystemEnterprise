// 获取工单列表API处理函数
// 负责调用后端API获取工单列表数据，并进行标准化处理

import { NextResponse } from 'next/server';
import apiClient, { handleApiError, createErrorResponse } from '../../client';
import { GET_WORK_ORDER_LIST_ENDPOINT } from '../../endpoints/workorder';
import { RawGetWorkOrderListResponse, GetWorkOrderListParams } from '../../types/workorder/getWorkOrderListTypes';

/**
 * 获取工单列表API处理函数
 * @param params 请求参数，包含分页、角色和状态过滤
 * @returns NextResponse 标准化的API响应
 */
export async function handleGetWorkOrderList(params: GetWorkOrderListParams): Promise<NextResponse> {
  try {
    // 使用API客户端发送GET请求，获取原始响应
    const response = await apiClient.get<RawGetWorkOrderListResponse>(GET_WORK_ORDER_LIST_ENDPOINT, {
      params
    });

    // 解构原始响应数据
    const { code, message, data, timestamp } = response.data;

    // 根据原始响应code判断请求是否成功
    if (code === 0) {
      // 请求成功，返回标准化成功响应
      return NextResponse.json({
        success: true,
        code,
        message,
        data,
        timestamp
      }, { status: 200 });
    } else {
      // 请求失败，返回标准化错误响应
      return NextResponse.json({
        success: false,
        code,
        message,
        data: null,
        timestamp
      }, { status: 200 });
    }
  } catch (error) {
    // 捕获并处理API错误
    const apiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    
    // 返回标准化错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
