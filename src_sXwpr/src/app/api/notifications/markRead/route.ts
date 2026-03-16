// 标记通知为已读API路由
// 遵循API_REQUEST_STANDARD.md的规范，作为中间件调用处理函数

import { NextResponse } from 'next/server';
import { handleMarkRead } from '@/api/handlers/notifications/markReadHandlers';
import { MarkReadRequestBody } from '@/api/types/notifications/markReadTypes';

/**
 * POST请求处理函数
 * @param request - NextRequest对象
 * @returns NextResponse - 包含标记结果的标准化响应
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 获取并解析请求体
    const requestBody: MarkReadRequestBody = await request.json();
    
    // 验证请求体
    if (requestBody.id === undefined && (!requestBody.ids || requestBody.ids.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          message: '参数错误，id或ids必须至少提供一个',
          timestamp: Date.now(),
          data: null
        },
        { status: 400 }
      );
    }
    
    // 调用处理函数标记通知为已读
    return handleMarkRead(requestBody);
  } catch (error) {
    // 处理请求体解析错误
    return NextResponse.json(
      {
        success: false,
        code: 400,
        message: '请求体格式错误',
        timestamp: Date.now(),
        data: null
      },
      { status: 400 }
    );
  }
}

/**
 * GET请求处理函数 - 不支持
 * @returns NextResponse - 405错误响应
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 405,
      message: '方法不允许，请使用POST请求',
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
      message: '方法不允许，请使用POST请求',
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
      message: '方法不允许，请使用POST请求',
      timestamp: Date.now(),
      data: null
    },
    { status: 405 }
  );
}