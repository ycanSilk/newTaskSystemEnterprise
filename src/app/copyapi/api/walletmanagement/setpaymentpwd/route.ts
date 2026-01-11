import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  // 获取token
  const cookieStore = await cookies();
  const tokenKeys = ['PublishTask_token'];
  let token: string | undefined;
  
  for (const key of tokenKeys) {
    token = cookieStore.get(key)?.value;
    if (token) break;
  }
  
  if (!token) {
    return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
  }
  
  try {
    // 直接使用前端发送的数据结构
    const data = await request.json();
    
    // 简单验证 - 只检查必填字段是否存在
    if (!data.securityPassword || !data.confirmPassword) {
      return NextResponse.json({ success: false, message: '支付密码和确认密码不能为空' }, { status: 400 });
    }
    
    if (data.securityPassword !== data.confirmPassword) {
      return NextResponse.json({ success: false, message: '两次输入的密码不一致' }, { status: 400 });
    }
    
    // 直接转发前端的数据结构给外部API，不做转换
    const apiUrl = `${config.baseUrl}${config.endpoints.wallet.setpaymentpwd}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(config.headers || {})
      },
      body: JSON.stringify(data) // 直接发送原始数据
    });
    
    const responseData = await response.json();
    console.log('外部API响应:', responseData); // 移到return之前
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('处理请求错误:', error);
    return NextResponse.json({ success: false, message: '服务器内部错误' }, { status: 500 });
  }
}

// 处理其他HTTP方法
export async function GET() {
  return NextResponse.json({ success: false, message: '不支持GET方法，请使用POST' }, { 
    status: 405, 
    headers: { 'Allow': 'POST' } 
  });
}

export async function PUT() {
  return NextResponse.json({ success: false, message: '不支持PUT方法，请使用POST' }, { 
    status: 405, 
    headers: { 'Allow': 'POST' } 
  });
}

export async function DELETE() {
  return NextResponse.json({ success: false, message: '不支持DELETE方法，请使用POST' }, { 
    status: 405, 
    headers: { 'Allow': 'POST' } 
  });
}