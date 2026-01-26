// 获取出租市场列表API路由

// 导入Next.js响应对象
import { NextResponse } from 'next/server';
// 导入处理函数
import { handleGetOffersRentalMarketList } from '@/api/handlers/rental/rentOut/getOffersRentalMarketListHandlers';

/**
 * GET方法处理函数
 * 获取出租市场列表
 * @returns NextResponse对象，包含出租市场列表数据
 */
export async function GET(): Promise<NextResponse> {
  try {
    // 直接调用处理函数，不需要传递参数
    return await handleGetOffersRentalMarketList();
  } catch (error) {
    // 返回错误响应
    return NextResponse.json(
      {
        success: false,
        code: 500,
        message: '服务器内部错误',
        timestamp: Date.now(),
        data: null
      },
      { status: 500 }
    );
  }
}

/**
 * POST方法处理函数
 * 不支持POST请求
 * @returns NextResponse对象，包含错误信息
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
 * PUT方法处理函数
 * 不支持PUT请求
 * @returns NextResponse对象，包含错误信息
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
 * DELETE方法处理函数
 * 不支持DELETE请求
 * @returns NextResponse对象，包含错误信息
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

/**
 * PATCH方法处理函数
 * 不支持PATCH请求
 * @returns NextResponse对象，包含错误信息
 */
export async function PATCH(): Promise<NextResponse> {
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
