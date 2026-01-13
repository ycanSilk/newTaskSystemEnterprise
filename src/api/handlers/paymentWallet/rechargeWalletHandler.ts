// 支付钱包模块 - 充值请求处理逻辑
// 这个文件包含了处理充值请求的核心逻辑

// 导入Next.js的请求和响应类型
import { NextRequest, NextResponse } from 'next/server';
// 导入API客户端实例，用于发送HTTP请求
import apiClient from '../../client';
// 导入充值的后端API端点
import { RECHARGE_WALLET_ENDPOINT } from '../../endpoints/paymentWallet';
// 导入错误处理相关的函数和类型
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
// 导入通用API响应类型
import { ApiResponse } from '../../types/common';
// 导入充值请求和响应的类型定义
import { RechargeWalletRequest, RechargeWalletResponse } from '../../types/paymentWallet/rechargeWalletTypes';

/**
 * 处理充值请求
 * @param req - Next.js请求对象
 * @returns Next.js响应对象，包含充值结果或错误信息
 */
export async function handleRechargeWallet(req: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求体，获取充值参数
    const requestBody: RechargeWalletRequest = await req.json();
    
    // 调用API客户端发送POST请求到充值端点
    // 使用RECHARGE_WALLET_ENDPOINT常量作为URL
    // 类型参数ApiResponse<RechargeWalletResponse>表示期望的响应数据类型
    const response = await apiClient.post<ApiResponse<RechargeWalletResponse>>(RECHARGE_WALLET_ENDPOINT, requestBody);
    
    // 返回响应给客户端
    // 使用NextResponse.json方法，将响应数据和状态码返回
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 捕获并处理请求过程中发生的错误
    // 使用handleApiError函数将原始错误转换为标准化的ApiError对象
    const apiError: ApiError = handleApiError(error);
    // 使用createErrorResponse函数创建标准化的错误响应
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 返回错误响应给客户端
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
