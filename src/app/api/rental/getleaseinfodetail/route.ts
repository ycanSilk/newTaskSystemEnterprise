import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
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
  
  // 从查询参数中获取leaseInfoId
  const url = new URL(request.url);
  const leaseInfoId = url.searchParams.get('leaseInfoId');
  console.log('从查询参数获取到的leaseInfoId:', leaseInfoId);
  console.log('完整的URL:', request.url);
  console.log('查询参数:', url.searchParams.toString());
  
  if (!leaseInfoId || leaseInfoId.trim() === '') {
    return NextResponse.json({ success: false, message: '缺少必要参数leaseInfoId' }, { status: 400 });
  }
  
  // 构造请求URL，将leaseInfoId作为path参数添加到URL中
  const apiUrl = `http://localhost:8083/api/rental/lease/${leaseInfoId}`;
  console.log('这是get出租信息详情API的日志输出:');
  console.log('请求url', apiUrl);
  console.log('token:', token);
  console.log('leaseInfoId:', leaseInfoId);
  // 直接调用外部API并返回原始响应
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        ...(config.headers || {}),
        'Authorization': `Bearer ${token}`
      }
    });

    // 获取原始响应数据
    const responseData = await response.json();
    console.log('这是get出租信息详情API的日志输出:');
    console.log('请求url', apiUrl);
    console.log('token:', token);
    console.log('返回的状态:', response.status);
    console.log('返回的原始数据', responseData);
    
    // 直接返回API的原始响应
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    return NextResponse.json({ 
      success: false, 
      message: '获取交易记录失败，请稍后重试' 
    }, { status: 500 });
  }
}