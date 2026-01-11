import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';
// 主函数：处理GET请求
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
  
  // 使用示例中的固定API地址
  const apiUrl = `${config.baseUrl}${config.endpoints.bank.getdefaultbankcard}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-User-Id': '', // 根据示例设置空字符串
        'Authorization': `Bearer ${token}`
      }
    });
    // 获取原始响应数据
    const responseData = await response.json();
    console.log("这是获取默认银行卡API返回的日志输出:");
    console.log("请求url:", apiUrl);
    console.log("token:Bearer ", token);
    console.log("返回的数据:", response);
    console.log("返回的数据:", responseData);

    // 检查API返回的成功状态，即使HTTP状态码是200
    if (!responseData.success && responseData.code === 500) {
      console.error('外部API返回错误:', responseData.message);
      return NextResponse.json(responseData, { status: 500 });
    }
    
    // 直接返回API的原始响应
    return NextResponse.json(responseData, { status: response.status || 200 });
  } catch (apiError) {
    console.error('API调用错误:', apiError);
    return NextResponse.json({ 
      success: false, 
      message: '获取银行卡列表失败，请稍后重试' 
    }, { status: 500 });
  }
}

