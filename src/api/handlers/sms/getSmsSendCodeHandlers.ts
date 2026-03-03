// 短信验证码发送API处理函数
// 处理获取短信验证码的请求，调用后端API并返回标准化响应

import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { SMS_SEND_CODE_ENDPOINT } from '../../endpoints/sms';
import { handleApiError, createErrorResponse } from '../../client/errorHandler';
import { GetSmsSendCodeRequest, GetSmsSendCodeResponse } from '../../types/sms/getSmsSendCodeTypes';

/**
 * 处理获取短信验证码请求
 * @param request 请求对象
 * @returns NextResponse 标准化的API响应
 */
export async function handleGetSmsSendCode(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestData: GetSmsSendCodeRequest = await request.json();
    
    // 调用后端API发送短信验证码
    const response = await apiClient.post<GetSmsSendCodeResponse>(
      SMS_SEND_CODE_ENDPOINT,
      requestData
    );
    
    // 返回标准化的响应
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const apiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
