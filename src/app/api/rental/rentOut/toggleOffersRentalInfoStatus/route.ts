// 上下架出租信息API路由

// 导入Next.js响应对象
import { NextResponse } from 'next/server';
// 导入处理函数
import { handleToggleOffersRentalInfoStatus } from '@/api/handlers/rental/rentOut/toggleOffersRentalInfoStatusHandlers';
// 导入类型定义
import { ToggleOffersRentalInfoStatusRequest } from '@/api/types/rental/rentOut/toggleOffersRentalInfoStatusTypes';

/**
 * POST方法处理函数
 * 上下架出租信息
 * @returns NextResponse对象，包含上下架结果
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestBody = await request.json() as ToggleOffersRentalInfoStatusRequest;
    
    // 调用处理函数
    return await handleToggleOffersRentalInfoStatus(requestBody);
  } catch (error) {
    // 返回错误响应
    return NextResponse.json(
      {
        success: false,
        code: 400,
        message: '请求参数错误',
        timestamp: Date.now(),
        data: null
      },
      { status: 400 }
    );
  }
}

/**
 * GET方法处理函数
 * 不支持GET请求
 * @returns NextResponse对象，包含错误信息
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
 * PUT方法处理函数
 * 不支持PUT请求
 * @returns NextResponse对象，包含错误信息
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
 * DELETE方法处理函数
 * 不支持DELETE请求
 * @returns NextResponse对象，包含错误信息
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
 * PATCH方法处理函数
 * 不支持PATCH请求
 * @returns NextResponse对象，包含错误信息
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