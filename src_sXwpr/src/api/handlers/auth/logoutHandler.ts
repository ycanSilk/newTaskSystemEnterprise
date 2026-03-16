// Auth模块 - 退出登录处理函数
// 这个文件实现了退出登录的业务逻辑，用于处理用户退出登录请求
import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { LOGOUT_ENDPOINT } from '../../endpoints/auth/login';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { LogoutResponse, ApiResponse } from '../../types/auth/logoutTypes';
import { apiConfig } from '../../client/config';

/**
 * 处理退出登录请求
 * @returns NextResponse - 包含退出登录结果的响应对象
 */
export async function handleLogout(): Promise<NextResponse> {
  try {
    // 使用apiClient发送退出登录请求
    const response = await apiClient.post<LogoutResponse>(LOGOUT_ENDPOINT);
    
    // 创建响应对象
    const successResponse = NextResponse.json({
      success: true,
      code: response.data.code,
      message: response.data.message,
      timestamp: response.data.timestamp,
      data: response.data.data
    }, { status: 200 });
    
    // 清除cookie中的token
    successResponse.cookies.delete(apiConfig.auth.tokenCookieName);
    
    // 返回响应
    return successResponse;
  } catch (error) {
    // 处理错误，转换为标准化的错误响应
    const apiError: ApiError = handleApiError(error);
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 创建错误响应对象
    const errorNextResponse = NextResponse.json(errorResponse, { status: apiError.status });
    
    // 即使在错误情况下也清除token
    errorNextResponse.cookies.delete(apiConfig.auth.tokenCookieName);
    
    // 返回标准化的错误响应
    return errorNextResponse;
  }
}
