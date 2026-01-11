import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
const config = require('../../apiconfig/config.json');

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
  
  // 从URL查询参数中获取rentRequestId
  const url = new URL(request.url);
  const orderRequestId = url.searchParams.get('orderRequestId');
  
  if (!orderRequestId) {
    return NextResponse.json({ success: false, message: '缺少必要参数orderRequestId' }, { status: 400 });
  }
  
  // 构造请求URL，将orderId和reason参数添加到URL中
  const apiUrl = `http://localhost:8083/api/rental/orders/${orderRequestId}`;
  
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
    let responseData;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      console.error('解析响应数据失败:', jsonError);
      return NextResponse.json({ 
        success: false, 
        message: '解析响应数据失败' 
      }, { status: 500 });
    }
    
    console.log('这是get求租信息详情API的日志输出:');
    console.log('请求url', apiUrl);
    console.log('token:', token);
    console.log('返回的状态:', response.status);
    console.log('返回的原始数据', responseData);
    
    // 直接返回API的原始响应
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    console.error('API调用失败:', apiError);
    return NextResponse.json({ 
      success: false, 
      message: '获取求租信息详情失败，请稍后重试' 
    }, { status: 500 });
  }
}