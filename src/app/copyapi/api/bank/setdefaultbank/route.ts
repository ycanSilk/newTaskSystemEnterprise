import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';
// 主函数：处理GET请求
export async function PUT(request: Request) {
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
  
  // 从请求体中获取cardId
  const requestBody = await request.json();
  const cardId = requestBody.cardId;
  
  if (!cardId) {
    return NextResponse.json({ success: false, message: '缺少银行卡ID' }, { status: 400 });
  }
  
  // 使用固定的API URL，包含cardId
  const apiUrl = `${config.baseUrl}/bank-cards/${cardId}/default`;
  
  // 直接调用外部API并返回原始响应
  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'X-User-Id': '', // 根据示例设置空字符串
        'Authorization': `Bearer ${token}`
      }
      // 没有请求体，Content-Length为0
    });
    
    console.log("这是后端文件src/app/api/public/bank/setdefaultbank/route.ts设置默认银行卡的API返回的日志输出:");
    console.log("请求url:", apiUrl);
    console.log("token:Bearer ", token);
    console.log("前端页面传递过来的cardId:", cardId); 
    console.log("响应状态:", response.status);
    console.log("响应头:", response.headers);

    
    // 获取原始响应数据
    const responseData = await response.json();
    
    // 直接返回API的原始响应
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    console.error('设置默认银行卡API调用失败:', apiError);
    // 提供更详细的错误信息
    if (apiError instanceof Error) {
      return NextResponse.json({ 
        success: false, 
        message: `设置默认银行卡失败: ${apiError.message}` 
      }, { status: 500 });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '设置默认银行卡失败，请稍后重试' 
      }, { status: 500 });
    }
  }
}

