import { NextResponse } from 'next/server';
import { handleSendMessage } from '../../../../api/handlers/workorder/sendMessageHandlers';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestData = await request.json();
    
    // 调用处理函数发送消息
    return await handleSendMessage(requestData);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: 400,
        message: '请求参数错误，请检查请求格式',
        timestamp: Date.now(),
        data: null
      },
      { status: 400 }
    );
  }
}

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
