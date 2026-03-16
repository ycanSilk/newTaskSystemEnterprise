// Auth模块 - 检查Token处理函数
// 这个文件实现了检查Token有效性的业务逻辑，用于处理检查Token请求
import { NextRequest, NextResponse } from 'next/server';
import apiClient from '../../client';
import { CHECK_TOKEN_ENDPOINT } from '../../endpoints/auth/login';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { CheckTokenApiResponse } from '../../types/auth/checkTokenTypes';

/**
 * 处理检查Token请求
 * @param req - Next.js请求对象，包含设备ID信息
 * @returns NextResponse - 包含检查Token结果的响应对象
 */
export async function handleCheckToken(req: NextRequest): Promise<NextResponse> {
  try {
    // 从请求中获取设备ID
    const deviceId = req.cookies.get('device_id')?.value || '';
    
    // 使用apiClient发送检查Token请求
    // apiClient会自动从Cookie获取Token并添加到请求头
    const response = await apiClient.get<CheckTokenApiResponse>(`${CHECK_TOKEN_ENDPOINT}?device_id=${deviceId}`);
    
    // 返回标准化的成功响应
    return NextResponse.json({
      success: true,
      code: response.data.code,
      message: response.data.message,
      timestamp: response.data.timestamp,
      data: response.data.data
    }, { status: 200 });
  } catch (error) {
    // 处理错误，转换为标准化的错误响应
    const apiError: ApiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    
    // 返回标准化的错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
