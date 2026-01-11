import { NextRequest, NextResponse } from 'next/server';
import { handleRegister } from '../../../../api/handlers/auth/registerHandler';

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleRegister(req);
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      code: 405, 
      message: '请使用POST方法进行注册',
      timestamp: Date.now()
    }, 
    { status: 405 }
  );
}
