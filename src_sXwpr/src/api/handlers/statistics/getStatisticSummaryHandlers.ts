import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { GET_PERIOD_SUMMARY_ENDPOINT } from '../../endpoints/statistics';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { GetStatisticSummaryResponse, FrontendGetStatisticSummaryResponse, GetStatisticSummaryParams } from '../../types/statistics/getStatisticSummaryTypes';

/**
 * 获取周期统计处理函数
 * @param params 请求参数
 * @returns NextResponse
 */
export async function handleGetStatisticSummary(params: GetStatisticSummaryParams = {}): Promise<NextResponse> {
  try {
    // 发送GET请求，传递查询参数
    const response = await apiClient.get<GetStatisticSummaryResponse>(GET_PERIOD_SUMMARY_ENDPOINT, {
      params
    });

    // 构建前端响应格式
    const frontendResponse: FrontendGetStatisticSummaryResponse = {
      success: true,
      message: response.data.message,
      data: response.data.data
    };

    // 返回成功响应
    return NextResponse.json(frontendResponse, { status: response.status });
  } catch (error) {
    // 处理API错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse: FrontendGetStatisticSummaryResponse = createErrorResponse(apiError);
    
    // 返回错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
