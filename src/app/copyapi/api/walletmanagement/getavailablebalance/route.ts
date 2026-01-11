import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';
// 主函数：处理GET请求
export async function GET() {
  // 从Cookie获取token
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
  
  // 简化API URL构建，直接拼接baseUrl和endpoint
  const apiUrl = `${config.baseUrl}${config.endpoints.wallet.availablebalance}`;
  
  // 直接调用外部API并返回原始响应
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      ...(config.headers || {}),
      'Authorization': `Bearer ${token}`
    }
  });
  
  // 获取原始响应数据
  const responseData = await response.json();
  
  // 直接返回API的原始响应
  return NextResponse.json(responseData, { status: response.status });
}

// 处理其他HTTP方法
export async function POST() {
  return NextResponse.json({ success: false, message: '不支持POST方法，请使用GET' }, { 
    status: 405, 
    headers: { 'Allow': 'GET' } 
  });
}

export async function PUT() {
  return NextResponse.json({ success: false, message: '不支持PUT方法，请使用GET' }, { 
    status: 405, 
    headers: { 'Allow': 'GET' } 
  });
}

export async function DELETE() {
  return NextResponse.json({ success: false, message: '不支持DELETE方法，请使用GET' }, { 
    status: 405, 
    headers: { 'Allow': 'GET' } 
  });
}