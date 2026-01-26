// src/app/api/workOrder/creatWorkOrder/route.ts
import { NextResponse } from 'next/server';
import { handleCreateWorkOrder } from '@/api/handlers/workorder/creatWorkOrderHandlers';

/**
 * 处理POST请求 - 创建工单
 * @param request - 请求对象，包含创建工单的参数
 * @returns NextResponse - 标准化的API响应
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handleCreateWorkOrder(request);
}

/**
 * 处理GET请求 - 不允许使用GET方法
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
 * 处理PUT请求 - 不允许使用PUT方法
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
 * 处理DELETE请求 - 不允许使用DELETE方法
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

/**
 * 处理PATCH请求 - 不允许使用PATCH方法
 * @returns NextResponse - 405错误响应
 */
export async function PATCH(): Promise<NextResponse> {
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
 * 处理OPTIONS请求 - 允许跨域请求
 * @returns NextResponse - 200响应
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: true,
      code: 200,
      message: 'OPTIONS方法允许',
      timestamp: Date.now(),
      data: null
    },
    { status: 200 }
  );
}
