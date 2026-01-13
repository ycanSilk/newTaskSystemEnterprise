import { NextRequest, NextResponse } from 'next/server';
// 按照后端目录架构，导入handlers中的处理函数
import { handleGetWalletBalance } from '../../../../api/handlers/paymentWallet/getWalletBalanceHandler';

/**
 * 处理获取钱包余额和交易明细请求
 * 调用handleGetWalletBalance函数，获取用户钱包余额和交易明细
 * @returns Next.js响应对象
 */
export async function GET(): Promise<NextResponse> {
  return handleGetWalletBalance();
  console.log('请求对象:', NextRequest);
  console.log('请求处理结果:', NextResponse.json);
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
