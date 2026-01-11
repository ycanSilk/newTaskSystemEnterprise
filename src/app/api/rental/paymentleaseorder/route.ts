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
  const orderId = url.searchParams.get('orderNo');
  console.log('orderNo:', orderId);
 
  
  // 构造请求URL，将orderId和reason参数添加到URL中
  const apiUrl = `${config.apiBaseUrl}/api/rental/orders/${orderId}/pay`;
  console.log('调用的支付订单API URL:', apiUrl);
  
  // 直接调用外部API并返回原始响应
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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
    console.error('外部支付API调用失败:', apiError);
    return NextResponse.json({ 
      success: false, 
      message: '支付处理失败，请稍后重试' 
    }, { status: 500 });
  }
}

