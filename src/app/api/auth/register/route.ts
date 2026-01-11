import { NextRequest, NextResponse } from 'next/server';
import config from '../../apiconfig/config.json';

// 定义请求参数接口
interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  companyName: string;
  contactPerson: string;
}

// 定义响应数据接口
interface RegisterResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// 基础验证函数
function validateRegisterData(data: RegisterRequest): { isValid: boolean; error?: string } {
  // 用户名验证
  if (!data.username || data.username.trim() === '') {
    return { isValid: false, error: '用户名不能为空' };
  }

  // 用户名长度验证（至少4个字符）
  if (data.username.length < 4) {
    return { isValid: false, error: '用户名长度必须大于或等于4个字符' };
  }

  // 用户名长度验证（不超过16个字符）
  if (data.username.length > 16) {
    return { isValid: false, error: '用户名长度不能超过16个字符' };
  }

  // 用户名格式验证（字母数字组合）
  const usernameRegex = /^[a-zA-Z0-9]{1,20}$/;
  if (!usernameRegex.test(data.username.trim())) {
    return { isValid: false, error: '用户名只能包含字母和数字' };
  }

  // 密码验证
  if (!data.password || data.password.trim() === '') {
    return { isValid: false, error: '密码不能为空' };
  }

  // 密码长度验证
  if (data.password.length < 6) {
    return { isValid: false, error: '密码长度不能少于6位' };
  }

  // 企业名称验证（必填）
  if (!data.companyName || data.companyName.trim() === '') {
    return { isValid: false, error: '企业名称不能为空' };
  }

  // 企业名称长度验证
  if (data.companyName.length < 2 || data.companyName.length > 100) {
    return { isValid: false, error: '企业名称长度应在2-100个字符之间' };
  }

  // 企业负责人验证（必填）
  if (!data.contactPerson || data.contactPerson.trim() === '') {
    return { isValid: false, error: '企业负责人不能为空' };
  }

  // 企业负责人长度验证
  if (data.contactPerson.length < 2 || data.contactPerson.length > 50) {
    return { isValid: false, error: '企业负责人姓名长度应在2-50个字符之间' };
  }

  // 企业负责人格式验证（中文、英文、空格）
  const contactPersonRegex = /^[\u4e00-\u9fa5a-zA-Z\s]+$/;
  if (!contactPersonRegex.test(data.contactPerson.trim())) {
    return { isValid: false, error: '企业负责人姓名只能包含中文、英文和空格' };
  }

  // 如果提供了手机号，验证手机号格式
  if (data.phone && data.phone.trim()) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(data.phone)) {
      return { isValid: false, error: '请输入正确的手机号码' };
    }
  }

  // 如果提供了邮箱，验证邮箱格式
  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { isValid: false, error: '请输入正确的邮箱地址' };
    }
  }

  return { isValid: true };
}

// 调用外部API的函数
async function callExternalRegisterAPI(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    // 从配置文件构建API URL
    const apiUrl = `${config.baseUrl}${config.endpoints.auth.register}`;
    
    // 调用外部API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        username: data.username,
        password: data.password,
        email: data.email || '',
        phone: data.phone || '',
        companyName: data.companyName,
        contactPerson: data.contactPerson
      }),
    });

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`外部API请求失败: ${response.status}`);
    }

    // 解析响应数据
    const result = await response.json();
    
    // 记录请求返回的JSON
    console.log('外部API返回结果:', result);
    
    return {
      success: result.success || false,
      message: result.message || '注册成功',
      data: result.data
    };
  } catch (error) {
    console.error('调用外部注册API时出错:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '注册失败，请稍后重试'
    };
  }
}

// POST方法处理注册请求
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const data = await request.json();
    
    // 验证输入数据
    const validation = validateRegisterData(data);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: validation.error || '参数验证失败'
      }, { status: 400 });
    }

    // 调用外部注册API
    const apiResponse = await callExternalRegisterAPI(data);
    
    // 根据外部API的响应状态返回相应的结果
    return NextResponse.json(apiResponse, {
      status: apiResponse.success ? 200 : 400
    });
  } catch (error) {
    console.error('处理注册请求时出错:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : '服务器内部错误'
    }, { status: 500 });
  }
}

// GET方法处理 - 返回API信息
export async function GET() {
  return NextResponse.json({
    success: false,
    message: '请使用POST方法进行注册'
  }, { status: 405 });
}