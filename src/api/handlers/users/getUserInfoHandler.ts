// 用户信息API处理函数

// 导入Next.js的请求和响应类型
import { NextRequest, NextResponse } from 'next/server';
// 导入API客户端实例
import apiClient from '../../client/axiosInstance';
// 导入获取用户信息端点常量
import { GET_USER_INFO_ENDPOINT } from '../../endpoints/users';
// 导入获取用户信息的响应类型
import { GetUserInfoResponse } from '../../types/users/getUserInfoTypes';
// 导入错误处理相关的函数、类型和枚举
import { ApiError, ApiErrorType, handleApiError, createErrorResponse } from '../../client/errorHandler';
// 导入通用API响应类型
import { ApiResponse } from '../../types/common';

/**
 * 处理获取用户信息请求
 * @param token - 用户认证token
 * @returns Next.js响应对象，包含用户信息或错误信息
 */
export const getUserInfoHandler = async (token: string): Promise<NextResponse> => {
  try {
    // 如果没有token，返回未登录状态
    if (!token) {
      const apiError: ApiError = {
        type: ApiErrorType.AUTH_ERROR,
        code: 401,
        message: '用户未登录',
        status: 401
      };
      const errorResponse: ApiResponse = createErrorResponse(apiError);
      return NextResponse.json(errorResponse, { status: apiError.status });
    }
    
    // 调用API客户端发送GET请求到获取用户信息端点，使用X-Token请求头
    const response = await apiClient.get<GetUserInfoResponse>(GET_USER_INFO_ENDPOINT, {
      headers: {
        'X-Token': token
      }
    });
    
    // 返回响应给客户端
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 捕获并处理请求过程中发生的错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 返回错误响应给客户端
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
};
