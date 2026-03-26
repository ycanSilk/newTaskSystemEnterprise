// 获取任务列表API处理函数
import { NextRequest, NextResponse } from 'next/server';
import apiClient from '../../client';
import { GET_PUBLISHED_TASKS_LIST_ENDPOINT } from '../../endpoints/task';
import { logger } from '../../../utils/simpleLogger';

export async function handleGetTasksList(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const page = url.searchParams.get('page') || '1';
    const pageSize = url.searchParams.get('page_size') || '20';
    const keyword = url.searchParams.get('keyword');
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    
    logger.audit('tasks', '获取任务列表开始', { status, page, pageSize, keyword, ip });

    let apiUrl = GET_PUBLISHED_TASKS_LIST_ENDPOINT;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', page);
    if (pageSize) params.append('page_size', pageSize);
    if (keyword) params.append('keyword', keyword);
    
    const queryString = params.toString();
    if (queryString) apiUrl += `?${queryString}`;

    const response = await apiClient.get(apiUrl);
    return NextResponse.json(response.data, { status: response.status });
    
  } catch (error) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    logger.audit('tasks', '获取任务列表异常', { error: error instanceof Error ? error.message : error, ip });
    return NextResponse.json({ success: false, code: 500, message: '获取任务列表失败' }, { status: 500 });
  }
}
