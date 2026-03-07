// 获取放大镜任务列表API处理函数
// 用于处理获取放大镜任务列表的API请求，调用后端API并返回标准化响应

// 导入NextResponse，用于返回标准化的HTTP响应
import { NextResponse } from 'next/server';
// 导入API客户端，用于发送请求到后端API
import apiClient from '../../client';
// 导入获取放大镜任务列表的端点常量
import { GET_MAGNIFIER_TASK_LIST_ENDPOINT } from '../../endpoints/task/index';
// 导入错误处理相关的函数
import { handleApiError, createErrorResponse } from '../../client/errorHandler';
// 导入获取放大镜任务列表的请求和响应类型
import type { GetMagnifierTaskListRequest, GetMagnifierTaskListApiResponse } from '../../types/task/getMagnifierTaskListTypes';

/**
 * 处理获取放大镜任务列表的API请求
 * @param request 请求对象，包含查询参数
 * @returns 返回标准化的HTTP响应
 */
export async function handleGetMagnifierTaskList(request: Request): Promise<NextResponse> {
  try {
    // 从URL中解析查询参数
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    
    // 构建请求参数
    const requestParams: GetMagnifierTaskListRequest = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined,
      b_user_id: searchParams.get('b_user_id') ? parseInt(searchParams.get('b_user_id')!) : undefined,
      status: searchParams.get('status') ? parseInt(searchParams.get('status')!) : undefined,
    };
    
    // 使用API客户端发送GET请求到获取放大镜任务列表端点
    const response = await apiClient.get<GetMagnifierTaskListApiResponse>(
      GET_MAGNIFIER_TASK_LIST_ENDPOINT,
      {
        params: requestParams
      }
    );
    
    // 返回标准化的响应，使用后端API返回的数据
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 处理错误，将原始错误转换为标准化的ApiError对象
    const apiError = handleApiError(error);
    // 创建标准化的错误响应
    const errorResponse = createErrorResponse(apiError);
    // 返回标准化的错误响应
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
