import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { GET_FLOW_LIST_ENDPOINT } from '../../endpoints/statistics';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { GetStatisticFlowListResponse, FrontendGetStatisticFlowListResponse, GetStatisticFlowListParams } from '../../types/statistics/getStatisticFlowListTypes';

/**
 * 获取流水列表处理函数
 * @param params 请求参数
 * @returns NextResponse
 */
export async function handleGetStatisticFlowList(params: GetStatisticFlowListParams = {}): Promise<NextResponse> {
  try {
    // 发送GET请求，传递查询参数
    const response = await apiClient.get<GetStatisticFlowListResponse>(GET_FLOW_LIST_ENDPOINT, {
      params
    });

    // 构建前端响应格式
    const frontendResponse: FrontendGetStatisticFlowListResponse = {
      success: true,
      message: response.data.message,
      data: response.data.data
    };

    // 返回成功响应
    return NextResponse.json(frontendResponse, { status: response.status });
  } catch (error) {
    // 处理API错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse: FrontendGetStatisticFlowListResponse = createErrorResponse(apiError);
    
    // 返回错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
