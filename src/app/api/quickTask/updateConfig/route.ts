// 快捷派单配置更新API路由

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { handleUpdateQuickTaskConfig } from '@/api/handlers/quickTask/updateConfigHandler';

/**
 * POST - 更新快捷派单配置
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleUpdateQuickTaskConfig(request);
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
