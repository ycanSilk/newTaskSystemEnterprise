// 关闭工单API路由
// 用于处理关闭工单的API请求，支持POST方法
// 其他HTTP方法将返回405错误

import { NextResponse } from 'next/server';
import { handleCloseWorkOrder } from '@/api/handlers/workorder/closeWorkOrderHandlers';

/**
 * POST方法处理函数
 * 用于关闭工单
 * @returns NextResponse 对象，包含API响应数据
 */
export async function POST(request: Request): Promise<NextResponse> {
  // 调用handleCloseWorkOrder函数处理关闭工单请求
  return handleCloseWorkOrder(request);
}

/**
 * GET方法处理函数
 * 关闭工单不支持GET方法，返回405错误
 * @returns NextResponse 对象，包含错误响应数据
 */
export async function GET(): Promise<NextResponse> {
  // 返回405错误，方法不允许
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
 * PUT方法处理函数
 * 关闭工单不支持PUT方法，返回405错误
 * @returns NextResponse 对象，包含错误响应数据
 */
export async function PUT(): Promise<NextResponse> {
  // 返回405错误，方法不允许
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
 * DELETE方法处理函数
 * 关闭工单不支持DELETE方法，返回405错误
 * @returns NextResponse 对象，包含错误响应数据
 */
export async function DELETE(): Promise<NextResponse> {
  // 返回405错误，方法不允许
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