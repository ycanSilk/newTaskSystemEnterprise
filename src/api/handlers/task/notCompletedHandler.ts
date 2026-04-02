// 获取未完成任务列表API处理函数
import { NextRequest, NextResponse } from 'next/server';
import apiClient from '../../client';
import { NOT_COMPLETED_ENDPOINT } from '../../endpoints/task';
import { logger } from '../../../utils/simpleLogger';
import { NotCompletedResponse } from '../../types/task/notCompletedTypes';

export async function handleGetNotCompletedTasks(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || '0'; // 默认状态为0（未完成）
    const page = url.searchParams.get('page') || '1';
    const pageSize = url.searchParams.get('page_size') || '20';
    const keyword = url.searchParams.get('keyword');
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    
    logger.audit('tasks', '获取未完成任务列表开始', { status, page, pageSize, keyword, ip });

    // 使用 NOT_COMPLETED_ENDPOINT 端点
    let apiUrl = NOT_COMPLETED_ENDPOINT;
    const params = new URLSearchParams();
    params.append('status', status); // 状态0表示未完成
    params.append('page', page);
    params.append('page_size', pageSize);
    if (keyword) params.append('keyword', keyword);
    
    const queryString = params.toString();
    if (queryString) apiUrl += `?${queryString}`;

    const response = await apiClient.get<NotCompletedResponse>(apiUrl);
    
    // 返回标准化的响应格式
    return NextResponse.json({
      code: response.data.code || 0,
      message: response.data.message || '获取成功',
      data: response.data.data || {
        tasks: [],
        pagination: {
          current_page: parseInt(page),
          page_size: parseInt(pageSize),
          total: 0,
          total_pages: 0
        }
      },
      timestamp: response.data.timestamp || Math.floor(Date.now() / 1000)
    }, { status: response.status });
    
  } catch (error) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    logger.audit('tasks', '获取未完成任务列表异常', { error: error instanceof Error ? error.message : error, ip });
    
    // 返回标准化的错误响应
    return NextResponse.json({
      code: 500,
      message: '获取未完成任务列表失败',
      data: {
        tasks: [],
        pagination: {
          current_page: 1,
          page_size: 20,
          total: 0,
          total_pages: 0
        }
      },
      timestamp: Math.floor(Date.now() / 1000)
    }, { status: 500 });
  }
}
