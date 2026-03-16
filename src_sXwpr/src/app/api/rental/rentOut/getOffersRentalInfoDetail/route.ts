// API路由：获取出租信息详情
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { handleGetOffersRentalInfoDetail } from '@/api/handlers/rental/rentOut/getOffersRentalInfoDetailHandlers';

/**
 * GET请求处理：获取出租信息详情
 * @param request - NextRequest对象，用于获取查询参数
 * @returns Promise<NextResponse> - 标准化的API响应
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleGetOffersRentalInfoDetail(request);
}

/**
 * POST请求处理：不支持的HTTP方法
 * @returns Promise<NextResponse> - 405错误响应
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
 * PUT请求处理：不支持的HTTP方法
 * @returns Promise<NextResponse> - 405错误响应
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
 * DELETE请求处理：不支持的HTTP方法
 * @returns Promise<NextResponse> - 405错误响应
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
