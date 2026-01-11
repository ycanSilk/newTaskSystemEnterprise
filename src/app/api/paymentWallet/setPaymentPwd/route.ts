import { NextRequest, NextResponse } from 'next/server';
// 按照后端目录架构，导入handlers中的处理函数
import { handleSetWalletPwd } from '../../../../api/handlers/paymentWallet/setWalletPwdHandler';

/**
 * 处理设置支付密码请求
 * 调用handleSetWalletPwd函数，设置用户支付密码
 * @param req - Next.js请求对象
 * @returns Next.js响应对象
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleSetWalletPwd(req);
}

/**
 * 处理GET请求
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
 * 处理PUT请求
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
 * 处理DELETE请求
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
