import { NextResponse } from 'next/server';
import apiClient from '../../client';
import { SEND_MESSAGE_ENDPOINT } from '../../endpoints/workorder';
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
import { SendMessageRequest, SendMessageResponseData } from '../../types/workorder/sendMessageTypes';

/**
 * 发送工单消息处理函数
 * @param {SendMessageRequest} requestData - 发送消息的请求数据
 * @returns {Promise<NextResponse>} - 标准化的API响应
 */
export async function handleSendMessage(requestData: SendMessageRequest): Promise<NextResponse> {
  try {
    const response = await apiClient.post<SendMessageResponseData>(SEND_MESSAGE_ENDPOINT, requestData);
    
    return NextResponse.json({
      success: response.data.code === 0,
      message: response.data.message || '消息发送成功',
      data: response.data.code === 0 ? response.data.data : null,
      timestamp: response.data.timestamp || Date.now()
    }, { status: 200 });
  } catch (error) {
    const apiError: ApiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
