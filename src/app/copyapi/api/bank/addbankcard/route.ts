import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';
// 主函数：处理GET请求
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
  
  // 解析请求体
  let requestData;
  try {
    requestData = await request.json();
  } catch (parseError) {
    return NextResponse.json({ success: false, message: '无效的请求数据格式' }, { status: 400 });
  }
  
  // 构建新的请求体，包含所需的参数
  const newRequestBody = {
    "cardholderName": requestData.cardholderName || "",
    "cardNumber": requestData.cardNumber || "",
    "bank": requestData.bank || "",
    "issuingBank": requestData.issuingBank || ""
  };
  
  // 使用固定的API URL
  const apiUrl = `${config.baseUrl}${config.endpoints.bank.addbankcard}`;
  
  // 直接调用外部API并返回原始响应
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-User-Id': '', // 根据示例设置空字符串
        'Authorization': `Bearer ${token}`,
        ...(config.headers || {}),
      },
      body: JSON.stringify(newRequestBody)
    });

    // 获取原始响应数据
    const responseData = await response.json();
    console.log("这是添加银行卡的API返回的日志输出:");
    console.log("请求url:", apiUrl);
    console.log("token:Bearer ", token);
    console.log("请求参数:", newRequestBody);
    console.log("响应状态:", response.status);
    console.log("响应头:", response.headers);
    console.log("返回的数据:", responseData);
    
    // 直接返回外部API的原始响应
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    console.error('API调用失败:', apiError);
    // 提供更详细的错误信息
    if (apiError instanceof Error) {
      return NextResponse.json({ 
        success: false, 
        message: `添加银行卡失败: ${apiError.message}` 
      }, { status: 500 });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '添加银行卡失败，请稍后重试' 
      }, { status: 500 });
    }
  }
}

