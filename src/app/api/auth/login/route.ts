import { NextRequest, NextResponse } from 'next/server';
import { handleLogin } from '@/api/handlers/auth/loginHandler';

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('POST登录请求:', req);
  return handleLogin(req);

}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      code: 405, 
      message: '请使用POST方法进行登录',
      timestamp: Date.now()
    }, 
    { status: 405 }
  );
}
