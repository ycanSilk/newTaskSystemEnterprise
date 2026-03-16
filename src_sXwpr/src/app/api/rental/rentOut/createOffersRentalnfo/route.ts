// 创建出租报价API路由
import { NextResponse } from 'next/server';
import { handleCreateOffersRentalInfo } from '@/api/handlers/rental/rentOut/createOffersRentalnfoHandlers';

/**
 * POST请求处理函数 - 创建出租报价
 * @returns NextResponse
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handleCreateOffersRentalInfo(request);
}

/**
 * GET请求处理函数 - 方法不允许
 * @returns NextResponse
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
 * PUT请求处理函数 - 方法不允许
 * @returns NextResponse
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
 * DELETE请求处理函数 - 方法不允许
 * @returns NextResponse
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
 * PATCH请求处理函数 - 方法不允许
 * @returns NextResponse
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
 * HEAD请求处理函数 - 方法不允许
 * @returns NextResponse
 */
export async function HEAD(): Promise<NextResponse> {
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
 * OPTIONS请求处理函数 - 方法不允许
 * @returns NextResponse
 */
export async function OPTIONS(): Promise<NextResponse> {
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