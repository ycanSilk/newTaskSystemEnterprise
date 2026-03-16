import { NextResponse } from 'next/server';
import { handleUpdateRequestRentalInfo } from '../../../../../api/handlers/rental/requestRental/updateRequestRentalInfoHandlers';

/**
 * 更新求租信息API路由处理
 * POST: 处理更新求租信息请求
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const params = await request.json();
    return await handleUpdateRequestRentalInfo(params);
  } catch (error) {
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
 * GET方法不支持
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
 * PUT方法不支持
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
 * DELETE方法不支持
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
 * PATCH方法不支持
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
