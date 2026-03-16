import { NextResponse } from 'next/server';
import { handleApplyRequestRentalInfo } from '../../../../../api/handlers/rental/requestRental/applyRequestRentalInfoHandlers';
import { ApplyRequestRentalInfoRequest } from '../../../../../api/types/rental/requestRental/applyRequestRentalInfoTypes';

/**
 * 处理求租信息应征申请的POST请求
 * @returns 标准化的API响应
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestBody: ApplyRequestRentalInfoRequest = await request.json();
    
    // 调用处理函数
    return handleApplyRequestRentalInfo(requestBody);
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
 * 处理GET请求（不支持）
 * @returns 405错误响应
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
 * 处理PUT请求（不支持）
 * @returns 405错误响应
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
 * 处理DELETE请求（不支持）
 * @returns 405错误响应
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
