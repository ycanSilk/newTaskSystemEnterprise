// Auth模块 - 注册请求处理逻辑
// 这个文件包含了处理注册请求的核心逻辑

// 导入Next.js的请求和响应类型
import { NextRequest, NextResponse } from 'next/server';
// 导入API客户端实例，用于发送HTTP请求
import apiClient from '../../client';
// 导入注册请求和响应的类型定义
import { RegisterRequest, RegisterResponse } from '../../types/auth/registerTypes';
// 导入错误处理相关的函数和类型
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
// 导入通用API响应类型
import { ApiResponse } from '../../types/common';

// 导入注册端点常量
// 注册请求要发送到的后端API地址
import { REGISTER_ENDPOINT } from '../../endpoints/auth/login';




/**
 * 处理注册请求
 * @param req - Next.js请求对象，包含客户端发送的注册数据
 * @returns Next.js响应对象，包含注册结果或错误信息
 */
export async function handleRegister(req: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求体，获取客户端发送的注册数据
    // 将请求体转换为RegisterRequest类型，确保数据格式正确
    const requestData: RegisterRequest = await req.json();
    
    // 调用API客户端发送POST请求到注册端点
    // 使用REGISTER_ENDPOINT常量作为URL，requestData作为请求体
    // 类型参数RegisterResponse表示期望的响应数据类型
    const response = await apiClient.post<RegisterResponse>(REGISTER_ENDPOINT, requestData);
    
    // 创建标准化的响应对象
    // 当后端返回code: 0时，success为true，否则为false
    const standardResponse = {
      code: response.data.code,
      message: response.data.message,
      data: response.data.data,
      timestamp: response.data.timestamp,
      success: response.data.code === 0
    };
    
    // 返回标准化的响应给客户端，不保存token到cookie
    // 注册时不设置token到cookie，只有登录时才设置
    return NextResponse.json(standardResponse, { status: response.status });
  } catch (error) {
    // 捕获并处理请求过程中发生的错误
    // 使用handleApiError函数将原始错误转换为标准化的ApiError对象
    const apiError: ApiError = handleApiError(error);
    
    // 使用createErrorResponse函数创建标准化的错误响应
    // 这个响应包含了错误信息、状态码和时间戳
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 返回错误响应给客户端
    // 使用apiError.status作为HTTP状态码，errorResponse作为响应体
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}