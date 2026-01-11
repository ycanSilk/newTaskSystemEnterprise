// 支付钱包模块 - 检查支付密码请求处理逻辑
// 这个文件包含了处理检查支付密码请求的核心逻辑

// 导入Next.js的请求和响应类型
import { NextRequest, NextResponse } from 'next/server';
// 导入API客户端实例，用于发送HTTP请求
import apiClient from '../../client';
// 导入错误处理相关的函数和类型
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
// 导入通用API响应类型
import { ApiResponse } from '../../types/common';
// 导入设置支付密码的后端API端点
import { SET_WALLET_PWD_ENDPOINT } from '../../endpoints/paymentWallet';
// 导入设置支付密码的类型定义
import { SetWalletPwdRequest, SetWalletPwdResponse } from '../../types/paymentWallet/setWalletPwdTypes';

/**
 * 处理设置支付密码请求
 * @param req - Next.js请求对象，包含客户端发送的请求信息
 * @returns Next.js响应对象，包含设置结果或错误信息
 */
export async function handleSetWalletPwd(req: NextRequest): Promise<NextResponse> {
  try {
    // 从请求体中获取password字段
    const requestData = await req.json() as SetWalletPwdRequest;
    
    // 调用API客户端发送POST请求到设置支付密码端点
    // 使用SET_WALLET_PWD_ENDPOINT常量作为URL路径
    // 传递requestData作为请求体
    // 类型参数SetWalletPwdResponse表示期望的响应数据类型
    const response = await apiClient.post<SetWalletPwdResponse>(SET_WALLET_PWD_ENDPOINT, requestData);
    
    // 创建标准化的响应对象
    // 当后端返回code: 0时，success为true，否则为false
    const standardResponse: ApiResponse = {
      success: response.data.code === 0,
      code: response.data.code,
      message: response.data.message,
      data: response.data.data,
      timestamp: response.data.timestamp
    };
    
    // 返回标准化的响应给客户端
    return NextResponse.json(standardResponse, { status: response.status });
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
