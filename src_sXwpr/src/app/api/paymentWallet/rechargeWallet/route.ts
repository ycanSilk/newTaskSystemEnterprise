import { NextRequest, NextResponse } from 'next/server';
// 按照后端目录架构，导入handlers中的处理函数
import { handleRechargeWallet } from '../../../../api/handlers/paymentWallet/rechargeWalletHandler';

/**
 * 处理充值请求
 * 调用handleRechargeWallet函数，处理用户的充值请求
 * @param req - Next.js请求对象
 * @returns Next.js响应对象
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleRechargeWallet(req);
}

/**
 * 处理其他HTTP方法请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
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
 * 处理其他HTTP方法请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
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
 * 处理其他HTTP方法请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
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
