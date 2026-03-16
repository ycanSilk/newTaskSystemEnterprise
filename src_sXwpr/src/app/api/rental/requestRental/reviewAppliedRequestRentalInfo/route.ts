// 审核求租信息应征申请 - API路由
import { NextResponse } from 'next/server';
import { handleReviewAppliedRequestRentalInfo } from '../../../../../api/handlers/rental/requestRental/reviewAppliedRequestRentalInfoHandlers';

/**
 * POST - 审核求租信息应征申请
 * @param request - Next.js请求对象
 * @returns NextResponse - 包含审核结果的标准化响应
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestBody = await request.json();
    
    // 调用处理函数
    return await handleReviewAppliedRequestRentalInfo(requestBody);
  } catch (error) {
    // 处理请求解析错误
    return NextResponse.json(
      {
        success: false,
        code: 400,
        message: '请求参数格式错误，请检查JSON格式',
        timestamp: Date.now(),
        data: null
      },
      { status: 400 }
    );
  }
}

/**
 * GET - 不允许使用GET请求
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
 * PUT - 不允许使用PUT请求
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
 * DELETE - 不允许使用DELETE请求
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
