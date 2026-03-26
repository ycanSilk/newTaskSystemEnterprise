import { NextRequest, NextResponse } from 'next/server';
// 按照后端目录架构，导入handlers中的处理函数
import { handleGetRechargeList } from '../../../../api/handlers/recharge/getRechargeListHandler';

/**
 * 处理获取充值记录请求
 * 调用handleGetRechargeList函数，获取用户充值记录
 * @param request Next.js请求对象
 * @returns Next.js响应对象
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleGetRechargeList(request);
}

/**
 * 处理其他HTTP方法请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 1001,
      message: '请求方法错误，请使用GET请求',
      timestamp: Date.now(),
      data: []
    },
    { status: 405 }
  );
}

/**
 * 处理其他HTTP方法请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
 */
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 1001,
      message: '请求方法错误，请使用GET请求',
      timestamp: Date.now(),
      data: []
    },
    { status: 405 }
  );
}

/**
 * 处理其他HTTP方法请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
 */
export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 1001,
      message: '请求方法错误，请使用GET请求',
      timestamp: Date.now(),
      data: []
    },
    { status: 405 }
  );
}
