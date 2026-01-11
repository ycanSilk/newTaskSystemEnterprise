import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';
/**
 * 验证支付密码的API路由
 * 功能：验证用户提供的支付密码是否与账户中存储的密码匹配
 * 路由：POST /api/wallet/validate-security-password
 */
export async function POST(request: Request) {
  try {

    
    // 从Cookie中获取token作为备选
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get('PublishTask_token');
    let token = '';
    token = cookieToken?.value || '';
    
    // 验证token是否存在
    if (!token) {
      return NextResponse.json(
        { success: false, message: '认证失败，请先登录' },
        { status: 401 }
      );
    }
    
    // 2. 从URL查询参数中获取password参数
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    console.log("前端传递过来的支付密码：", password);
    // 验证password参数是否存在
    if (!password) {
      return NextResponse.json(
        { success: false, message: '支付密码不能为空' },
        { status: 400 }
      );
    }
    
    // 3. 调用外部API验证支付密码
    const apiUrl = `${config.baseUrl}${config.endpoints.wallet.validatepwd}?password=${password}`;
    console.log("调用的支付密码验证API URL:", apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(config.headers || {})
      }
    });
    
    // 4. 处理API响应
    const responseData = await response.json();
    console.log('支付密码验证API响应:', responseData);
    
    // 根据API响应返回相应的结果
    return NextResponse.json(responseData, { status: response.status });
    
  } catch (error) {
    // 5. 错误处理
    console.error('验证支付密码时发生错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 处理不支持的HTTP方法
 */
export async function GET() {
  return NextResponse.json(
    { success: false, message: '不支持GET方法，请使用POST' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: '不支持PUT方法，请使用POST' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: '不支持DELETE方法，请使用POST' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}