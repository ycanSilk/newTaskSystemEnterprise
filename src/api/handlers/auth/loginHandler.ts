// Auth模块 - 登录请求处理逻辑
import { NextRequest, NextResponse } from 'next/server';
import apiClient from '../../client';
import { LOGIN_ENDPOINT } from '../../endpoints/auth/login';
import { LoginRequest, LoginResponse } from '../../types/auth/loginTypes';
import { apiConfig } from '../../client/config';
import { logger } from '../../../utils/simpleLogger';

export async function handleLogin(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    
    logger.audit('login', '开始', { account: body.account, deviceId: body.device_id, deviceName: body.device_name, ip });

    if (!body.device_id || !body.device_name) {
      return NextResponse.json({ success: false, code: 4001, message: '设备信息缺失' }, { status: 400 });
    }

    const response = await apiClient.post<LoginResponse>(LOGIN_ENDPOINT, body);
    const result = NextResponse.json(response.data, { status: response.status });

    if (response.data.data?.token) {
      result.cookies.set(apiConfig.auth.tokenCookieName, response.data.data.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });
    }

    return result;
  } catch (error) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    logger.audit('login', '异常', { error: error instanceof Error ? error.message : error, ip });
    return NextResponse.json({ success: false, code: 500, message: '服务器错误' }, { status: 500 });
  }
}
