import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// 导入API配置
import config from '../../apiconfig/config.json';

// 定义登录请求参数接口
interface LoginRequest {
  username: string;
  password: string;
}

// 定义响应接口
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// 基础验证函数
function validateLoginData(data: LoginRequest): { isValid: boolean; error?: string } {
  // 检查必填字段
  if (!data.username || !data.password) {
    return { isValid: false, error: '用户名和密码为必填项' };
  }

  if (data.username.length < 4 || data.username.length > 16) {
    return { isValid: false, error: '用户名必须包含4-16个字符，且只能包含字母、数字和下划线' };
  }

  // 验证密码长度
  if (data.password.length < 6 || data.password.length > 20) {
    return { isValid: false, error: '密码长度必须在6-20个字符之间' };
  }

  return { isValid: true };
}

/**
 * 配置并设置安全的HttpOnly Cookie
 * 优化：只使用统一的token名称
 */
function setSecureHttpOnlyCookie(
  req: NextRequest,
  response: NextResponse,
  name: string,
  value: string,
  maxAge: number
): void {
  const expiryDate = new Date(Date.now() + maxAge * 1000);
  
  // 判断是否为HTTPS请求
  const isHttps = req.headers.get('x-forwarded-proto') === 'https' || 
                 req.url.startsWith('https://') ||
                 // 允许在开发环境下使用HTTP（根据环境变量判断）
                 process.env.NODE_ENV === 'development';
  
  // 设置安全Cookie，只使用统一的token名称
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: isHttps, // 在HTTPS和开发环境下都启用secure
    sameSite: 'lax',
    path: '/',
    expires: expiryDate,
    maxAge: maxAge
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestData: LoginRequest = await req.json();

    // 执行数据验证
    const validation = validateLoginData(requestData);
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: validation.error || '请求数据验证失败'
      }, { status: 400 });
    }

    // 构建后端API请求数据
    const backendRequestData = {
      username: requestData.username.trim(),
      password: requestData.password
    };

    // 调用实际的后端API
    const apiUrl = `${config.baseUrl}${config.endpoints.auth.login}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(backendRequestData),
      signal: AbortSignal.timeout(config.timeout || 5000)
    });

    // 检查响应状态
    if (!response.ok) {
      console.error(`登录API错误: ${response.status}`);
      try {
        const errorData = await response.json();
        return NextResponse.json<ApiResponse>({
          success: false,
          message: errorData.message || `登录失败`
        }, { status: response.status });
      } catch {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: '登录失败'
        }, { status: response.status });
      }
    }

    // 解析后端响应
    const result = await response.json();
    
    // 验证返回的数据结构
    if (!result || !result.data) {
      console.error('登录响应数据无效');
      return NextResponse.json<ApiResponse>({
        success: false,
        message: result.message
      }, { status: 500 });
    }

    // 获取token和过期时间
    const token = result.data.token || '';
    if (!token) {
      console.error('登录未返回有效token');
      return NextResponse.json<ApiResponse>({
        success: false,
        message: '登录成功但未返回有效token'
      }, { status: 500 });
    }
    
    const userId = result.data.userId || '';
    const userInfo = result.data.userInfo || {};
    const expiresIn = result.data.expiresIn || 86400; // 默认24小时
    const expiryDate = new Date(Date.now() + expiresIn * 1000);
    
    // 构建返回给前端的响应数据 - 不包含role字段
    const responseData: ApiResponse = {
      success: true,
      message: result.message || '登录成功！',
      data: {
        userId,
        username: requestData.username,
        userInfo: { ...userInfo }, // 直接使用用户信息，不添加role字段
        expiresIn,
        expiresAt: expiryDate.toISOString()
      }
    };
    
    // 创建响应对象
    const successResponse = NextResponse.json(responseData, { status: 200 });
    
    // 设置安全的HttpOnly Cookie保存token
    setSecureHttpOnlyCookie(req, successResponse, 'PublishTask_token', token, expiresIn);
    
    // 关键日志
    console.log(`用户 ${requestData.username} 登录成功`);
    console.log(`设置token信息: Bearer ${token}`);
    console.log(result);
    
    return successResponse;
  } catch (error) {
    console.error('登录过程中发生错误:', error);
    
    // 处理不同类型的错误
    let errorMessage = '登录失败，请稍后重试';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请检查网络连接';
        statusCode = 408;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '无法连接到服务器';
        statusCode = 503;
      }
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      message: errorMessage
    }, { status: statusCode });
  }
}

// 处理GET请求
export async function GET(): Promise<NextResponse> {
  return NextResponse.json<ApiResponse>({
    success: false,
    message: '请使用POST方法进行登录'
  }, { status: 405 });
}