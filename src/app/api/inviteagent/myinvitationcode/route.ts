import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
const config = require('../../apiconfig/config.json');

export const dynamic = 'force-dynamic';
// 主函数：处理POST请求
export async function GET(request: Request) {
  // 从Cookie获取token
  const cookieStore = await cookies();
  const tokenKeys = ['PublishTask_token'];
  let token: string | undefined;
  
  for (const key of tokenKeys) {
    token = cookieStore.get(key)?.value;
    if (token) break;
  }
  


  // 从请求头获取用户ID

   const userId = request.headers.get('X-User-Id') || '';

    console.log('从请求头获取到的userId:', userId);
  
  // token已在前面检查过
  
  // 解析请求体 - GET请求不需要请求体
  const requestData = {};
   
  // 构造请求URL，将orderId和reason参数添加到URL中
  const apiUrl = `${config.baseUrl}${config.endpoints.inviteagent.myinvitationcode}`;
  
  // 直接调用外部API并返回原始响应
  try {
    console.log('从请求头获取到的userId:', userId);
    // 构造请求头，添加用户ID
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    // 只有当userId有值时才添加X-User-Id头
    if (userId && userId.trim() !== '') {
      headers['X-User-Id'] = userId;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers
    });

    // 获取原始响应数据
    const responseData = await response.json();
    console.log('这是获取我的邀请码API的日志输出:');
    console.log('请求url', apiUrl);
    console.log('token:', token);
    console.log('前端传递过来的请求的userId:', userId);
    console.log('返回的原始数据', responseData);
    
    // 直接返回API的原始响应
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    return NextResponse.json({ 
      success: false, 
      message: '获取我的邀请码失败，请稍后重试' 
    }, { status: 500 });
  }
}

