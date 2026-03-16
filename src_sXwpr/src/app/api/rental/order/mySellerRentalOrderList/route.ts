// 我出售的租赁订单列表 - API路由
import { NextResponse } from 'next/server';
import { handleMySellerRentalOrderList } from '@/api/handlers/rental/order/mySellerRentalOrderListHandlers';

/**
 * GET - 获取我出售的租赁订单列表
 * @returns NextResponse - 包含订单列表的标准化响应
 */
export async function GET(): Promise<NextResponse> {
  return handleMySellerRentalOrderList();
}

/**
 * POST - 不允许使用POST请求
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
 * PUT - 不允许使用PUT请求
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
 * DELETE - 不允许使用DELETE请求
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
