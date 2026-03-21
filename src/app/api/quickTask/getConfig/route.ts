// 快捷派单配置获取API路由

import { NextResponse } from 'next/server';
import { handleGetQuickTaskConfig } from '@/api/handlers/quickTask/getConfigHandler';

/**
 * GET - 获取快捷派单配置
 */
export async function GET(): Promise<NextResponse> {
  return handleGetQuickTaskConfig();
}

/**
 * POST - 方法不允许
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
 * PUT - 方法不允许
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
 * DELETE - 方法不允许
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
