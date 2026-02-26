// 支付钱包模块 - 获取钱包余额和交易明细请求处理逻辑
// 这个文件包含了处理获取钱包余额和交易明细请求的核心逻辑

// 导入Next.js的请求和响应类型
import { NextRequest, NextResponse } from 'next/server';
// 导入API客户端实例，用于发送HTTP请求
import apiClient from '../../client';
// 导入获取钱包余额和交易明细的后端API端点
import { GET_WALLET_BALANCE_ENDPOINT } from '../../endpoints/paymentWallet';
// 导入错误处理相关的函数和类型
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
// 导入通用API响应类型
import { ApiResponse } from '../../types/common';
// 导入获取钱包余额和交易明细的响应类型
import { GetWalletBalanceResponse } from '../../types/paymentWallet/getWalletBalanceTypes';

/**
 * 处理获取钱包余额和交易明细请求
 * @param request Next.js请求对象
 * @returns Next.js响应对象，包含钱包余额、交易明细或错误信息
 */
export async function handleGetWalletBalance(request: NextRequest): Promise<NextResponse> {
  try {
    // 从请求URL中获取分页参数
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const page_size = url.searchParams.get('page_size') || '20';
    
    // 构建带分页参数的请求URL
    const endpointWithParams = `${GET_WALLET_BALANCE_ENDPOINT}?page=${page}&page_size=${page_size}`;
    
    // 调用API客户端发送GET请求到获取钱包余额和交易明细端点
    const response = await apiClient.get<ApiResponse<GetWalletBalanceResponse>>(endpointWithParams);
    
    // 返回响应给客户端
    return NextResponse.json(response.data, { status: response.status });
    
  } catch (error) {
    // 捕获并处理请求过程中发生的错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 返回错误响应给客户端
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
