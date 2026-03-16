// 短信验证码验证API路由
// 处理POST请求，调用对应的API处理函数

import { NextResponse } from 'next/server';
import { handleCheakSmsVerifyCode } from '@/api/handlers/sms/cheakSmsVerifyCodeHandlers';

/**
 * 处理POST请求，验证短信验证码
 * @param request 请求对象
 * @returns NextResponse API响应
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handleCheakSmsVerifyCode(request);
}

/**
 * 处理不支持的HTTP方法
 * @returns NextResponse 405错误响应
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
 * 处理不支持的HTTP方法
 * @returns NextResponse 405错误响应
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
 * 处理不支持的HTTP方法
 * @returns NextResponse 405错误响应
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
 * 处理不支持的HTTP方法
 * @returns NextResponse 405错误响应
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
