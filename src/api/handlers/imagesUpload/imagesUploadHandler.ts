// 图片上传API处理函数

// 导入Next.js的请求和响应类型
import { NextRequest, NextResponse } from 'next/server';
// 导入API客户端实例
import apiClient from '@/api/client';
// 导入API配置
import { apiConfig } from '@/api/client/config';
// 导入上传图片端点常量
import { UPLOAD_IMAGE_ENDPOINT } from '@/api/endpoints/imagesUpload';
// 导入错误处理相关的函数、类型和枚举
import { ApiError, ApiErrorType, handleApiError, createErrorResponse } from '@/api/client/errorHandler';
// 导入通用API响应类型
import { ApiResponse } from '@/api/types/common';

/**
 * 处理上传图片请求
 * @param request - Next.js请求对象
 * @returns Next.js响应对象，包含上传图片结果或错误信息
 */
export const imagesUploadHandler = async (request: NextRequest): Promise<NextResponse> => {
  try {
    // 获取请求内容类型
    const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
    
    // 读取请求体作为Buffer
    const body = await request.arrayBuffer();
    const fileBuffer = Buffer.from(body);
    
    // 调用API客户端发送POST请求到上传图片端点
    // 标准化axios客户端会自动从cookie获取token并添加到请求头
    const response = await apiClient.post<ApiResponse>(UPLOAD_IMAGE_ENDPOINT, fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString()
      }
    });
    
    // 返回响应给客户端
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('图片上传失败:', error);
    
    // 捕获并处理请求过程中发生的错误
    const apiError: ApiError = handleApiError(error);
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 返回错误响应给客户端
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
};
