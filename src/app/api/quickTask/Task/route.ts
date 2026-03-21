// 快捷派单API路由

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { handleCreateQuickTask } from '@/api/handlers/quickTask/quickTaskHandler';

/**
 * POST - 创建快捷派单
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('POST 请求收到', request);
  try {
    // 读取请求体
    const data = await request.json();
    console.log('POST 请求数据', data);
    // 调用处理函数，传递读取到的数据
    return handleCreateQuickTask(data);
  } catch (error) {
    console.error('读取请求体失败:', error);
    return NextResponse.json(
      {
        success: false,
        code: 400,
        message: '请求体解析失败',
        timestamp: Date.now(),
        data: null
      },
      { status: 400 }
    );
  }
}

/**
 * GET - 方法不允许
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
 * PUT - 方法不允许
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
 * DELETE - 方法不允许
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
