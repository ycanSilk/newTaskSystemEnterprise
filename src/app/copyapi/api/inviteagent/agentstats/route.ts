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
  
  if (!token) {
    return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
  }
  
  // 从请求头中获取X-User-Id
  const userId = request.headers.get('X-User-Id') || '';
   
  // 构造请求URL
  const apiUrl = `${config.baseUrl}${config.endpoints.inviteagent.agentstats}`;
  
  // 直接调用外部API并返回原始响应
  try {
    const response = await fetch(apiUrl, { 
      method: 'GET',
      headers: {
        'X-User-Id': userId,
        'Authorization': `Bearer ${token}`
      }
    });

    // 获取原始响应数据
    const responseData = await response.json();

    // 直接返回API的原始响应
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    console.error('调用外部API失败:', apiError);
    return NextResponse.json({ 
      success: false, 
      message: '获取代理人统计数据失败，请稍后重试' 
    }, { status: 500 });
  }
}

