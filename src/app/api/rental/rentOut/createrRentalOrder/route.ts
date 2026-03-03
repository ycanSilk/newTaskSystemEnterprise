// 出租信息下单接口路由
import { NextResponse } from 'next/server';
import { handleCreateRentalOrder } from '@/api/handlers/rental/rentOut/createrRentalOrderHandlers';

/**
 * POST - 出租信息下单接口
 * @returns NextResponse - 响应对象
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handleCreateRentalOrder(request);
}

/**
 * GET - 方法不允许
 * @returns NextResponse - 响应对象
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
 * @returns NextResponse - 响应对象
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
 * @returns NextResponse - 响应对象
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
