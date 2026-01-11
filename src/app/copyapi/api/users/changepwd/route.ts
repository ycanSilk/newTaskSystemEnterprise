import { NextRequest, NextResponse } from 'next/server';
import config from '../../apiconfig/config.json';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';
// 从Cookie中获取token的函数
const getTokenFromCookie = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('PublishTask_token')?.value;
    return token || null;
  } catch (error) {
    console.error('无法从Cookie获取token:', error);
    return null;
  }
};

// 简单的密码验证函数
const validatePassword = (password: string): {
  isValid: boolean;
  message?: string;
} => {
  if (!password || password.trim() === '') {
    return { isValid: false, message: '密码不能为空' };
  }

  if (password.length < 6) {
    return { isValid: false, message: '密码长度至少6位' };
  }

  return { isValid: true };
};

export async function POST(req: NextRequest) {
  try {
    // 1. 从HttpOnly Cookie获取令牌
    const token = await getTokenFromCookie();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未提供身份验证令牌' },
        { status: 401 }
      );
    }
    
    // 2. 解析请求体
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, message: '请求数据格式错误' },
        { status: 400 }
      );
    }
    
    // 3. 验证请求参数
    // 支持currentPassword和oldPassword两种参数名，优先使用currentPassword
    const oldPassword = requestBody.currentPassword || requestBody.oldPassword;
    const newPassword = requestBody.newPassword;
    
    if (!oldPassword) {
      return NextResponse.json(
        { success: false, message: '请提供旧密码' },
        { status: 400 }
      );
    }
    
    if (!newPassword) {
      return NextResponse.json(
        { success: false, message: '请提供新密码' },
        { status: 400 }
      );
    }
    
    // 4. 验证密码
    const oldPasswordValidation = validatePassword(oldPassword);
    if (!oldPasswordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: `旧密码${oldPasswordValidation.message}` },
        { status: 400 }
      );
    }
    
    const newPasswordValidation = validatePassword(newPassword);
    if (!newPasswordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: `新密码${newPasswordValidation.message}` },
        { status: 400 }
      );
    }
    
    // 5. 调用外部API - 使用配置文件中的设置
    const externalApiUrl = `${config.baseUrl}${config.endpoints.user.changepwd}`;
    
    const externalResponse = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...config.headers,
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      }),
    });
    
    const externalData = await externalResponse.json();
    console.log('外部API返回的完整JSON响应:', JSON.stringify(externalData));
    
    // 添加跨域允许凭证的响应头
    const response = NextResponse.json(
      externalData,
      { status: externalResponse.status }
    );
    
    // 设置允许携带凭证的CORS头
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return response;
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}

// 拒绝其他HTTP方法，增强安全性
export function GET() {
  return NextResponse.json(
    { success: false, message: '不支持的请求方法' },
    { status: 405 }
  );
}

export function PUT() {
  return NextResponse.json(
    { success: false, message: '不支持的请求方法' },
    { status: 405 }
  );
}

export function DELETE() {
  return NextResponse.json(
    { success: false, message: '不支持的请求方法' },
    { status: 405 }
  );
}

