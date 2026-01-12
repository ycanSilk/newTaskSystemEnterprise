import { NextRequest, NextResponse } from 'next/server';
// 按照后端目录架构，导入handlers中的处理函数
import { handleCheckWalletPwd } from '../../../../api/handlers/paymentWallet/checkWalletPwdHandler';

/**
 * 处理检查支付密码请求
 * 调用handleCheckWalletPwd函数，检查用户是否设置了支付密码
 * @param req - Next.js请求对象
 * @returns Next.js响应对象
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return handleCheckWalletPwd(req);
}
console.log('GET /api/paymentWallet/checkWalletPwd 收到请求');
console.log(NextResponse.json)
/**
 * 处理其他HTTP方法请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
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
 * 处理其他HTTP方法请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
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
 * 处理其他HTTP方法请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
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
