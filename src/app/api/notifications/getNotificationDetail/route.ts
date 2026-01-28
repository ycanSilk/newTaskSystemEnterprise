// 获取通知详情API路由
// 遵循API_REQUEST_STANDARD.md的规范，作为中间件调用处理函数

import { NextResponse } from 'next/server';
import { handleGetNotificationDetail } from '@/api/handlers/notifications/getNotificationDetailHandlers';

/**
 * GET请求处理函数
 * @param request - NextRequest对象
 * @returns NextResponse - 包含通知详情的标准化响应
 */
export async function GET(request: Request): Promise<NextResponse> {
  // 从URL中获取id参数
  const url = new URL(request.url);
  const idStr = url.searchParams.get('id');
  
  // 验证id参数
  if (!idStr || isNaN(Number(idStr))) {
    return NextResponse.json(
      {
        success: false,
        code: 400,
        message: '参数错误，id必须是有效的数字',
        timestamp: Date.now(),
        data: null
      },
      { status: 400 }
    );
  }
  
  const id = Number(idStr);
  
  // 调用处理函数获取通知详情
  return handleGetNotificationDetail(id);
}

/**
 * POST请求处理函数 - 不支持
 * @returns NextResponse - 405错误响应
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 405,
      message: '方法不允许，请使用GET请求',
      timestamp: Date.now(),
      data: null
    },
    { status: 405 }
  );
}

/**
 * PUT请求处理函数 - 不支持
 * @returns NextResponse - 405错误响应
 */
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 405,
      message: '方法不允许，请使用GET请求',
      timestamp: Date.now(),
      data: null
    },
    { status: 405 }
  );
}

/**
 * DELETE请求处理函数 - 不支持
 * @returns NextResponse - 405错误响应
 */
export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 405,
      message: '方法不允许，请使用GET请求',
      timestamp: Date.now(),
      data: null
    },
    { status: 405 }
  );
}