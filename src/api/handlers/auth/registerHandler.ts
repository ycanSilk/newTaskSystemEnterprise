// Auth模块 - 注册请求处理逻辑
import { NextRequest, NextResponse } from 'next/server';
import apiClient from '../../client';
import { RegisterRequest, RegisterResponse } from '../../types/auth/registerTypes';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { ApiResponse } from '../../types/common';
import { logger } from '../../../utils/simpleLogger';
import { REGISTER_ENDPOINT } from '../../endpoints/auth/login';

export async function handleRegister(req: NextRequest): Promise<NextResponse> {
  try {
    const requestData: RegisterRequest = await req.json();
    
    const clientIp = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    
    logger.audit('register', '开始', {
      username: requestData.username,
      email: requestData.email,
      phone: requestData.phone,
      ip: clientIp
    });
    
    const response = await apiClient.post<RegisterResponse>(REGISTER_ENDPOINT, requestData);
    
    const standardResponse = {
      code: response.data.code,
      message: response.data.message,
      data: response.data.data,
      timestamp: response.data.timestamp,
      success: response.data.code === 0
    };
    
    const isSuccess = response.data.code === 0;
    
    logger.audit('register', isSuccess ? '成功' : '失败', {
      username: requestData.username,
      code: response.data.code,
      message: response.data.message,
      ip: clientIp
    });
    
    return NextResponse.json(standardResponse, { status: response.status });
  } catch (error) {
    const clientIp = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    
    const apiError: ApiError = handleApiError(error);
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    logger.audit('register', '异常', {
      error: apiError.message,
      status: apiError.status,
      code: apiError.code,
      ip: clientIp
    });
    
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
