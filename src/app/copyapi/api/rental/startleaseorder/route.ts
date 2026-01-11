import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';
// 主函数：处理POST请求
export async function POST(request: Request) {
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
  
  // 从URL查询参数中获取orderId
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');
  console.log('orderId:', orderId);
  if (!orderId) {
    console.log('缺少必要参数orderId');
    return NextResponse.json({ success: false, message: '缺少必要参数orderId' }, { status: 400 });
  }


  
  // 构造请求URL，将orderId和reason参数添加到URL中
  const apiUrl = `http://localhost:8083/api/rental/orders/${orderId}/start`;
  
  // 直接调用外部API并返回原始响应
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // 获取原始响应数据
    const responseData = await response.json();
    console.log('这是支付租赁订单API的日志输出:');
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

