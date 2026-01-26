// 创建求租信息API路由

import { NextRequest, NextResponse } from 'next/server';
import { handleCreateRequestRentalInfo } from '../../../../../api/handlers/rental/requestRental/createRequestRentalInfoHandlers';

/**
 * POST请求处理函数 - 创建求租信息
 * @param request NextRequest对象
 * @returns NextResponse对象
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 从请求体中获取参数
    const params = await request.json();
    // 调用处理函数创建求租信息
    return await handleCreateRequestRentalInfo(params);
  } catch (error) {
    // 处理请求解析错误
    return NextResponse.json(
      {
        success: false,
        code: 400,
        message: '请求参数格式错误',
        timestamp: Date.now(),
        data: null
      },
      { status: 400 }
    );
  }
}

/**
 * GET请求处理函数 - 不支持，返回405错误
 * @returns NextResponse对象
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
 * PUT请求处理函数 - 不支持，返回405错误
 * @returns NextResponse对象
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
 * DELETE请求处理函数 - 不支持，返回405错误
 * @returns NextResponse对象
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
 * PATCH请求处理函数 - 不支持，返回405错误
 * @returns NextResponse对象
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