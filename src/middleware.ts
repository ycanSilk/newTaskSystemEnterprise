// 导入Next.js的请求和响应类型，用于处理HTTP请求和响应
import { NextRequest, NextResponse } from 'next/server';

// 定义公共路径（不需要登录即可访问）
// 这些路径任何人都可以访问，不需要登录验证
const publicPaths = [
  '/publisher/auth/login',
  '/publisher/auth/register',
  '/publisher/auth/resetpwd',
  '/api/auth/login',
  '/api/auth/checkToken',
];

// 导出中间件函数，处理所有HTTP请求
// 简化版本：只保留重定向到登录页面的功能
// @param request Next.js请求对象，包含请求的所有信息
// @returns Next.js响应对象，决定请求的处理方式
export async function middleware(request: NextRequest) {
  // 从请求URL中获取路径名、搜索参数和来源地址
  const { pathname, origin } = request.nextUrl;

  console.log('Middleware: 处理请求路径:', pathname);

  // 如果是公共路径，直接放行
  if (publicPaths.includes(pathname)) {
    console.log('Middleware: 公共路径，直接放行');
    return NextResponse.next();
  }

  // 从Cookie中获取Token
  const token = request.cookies.get('PublishTask_token')?.value;

  // 如果没有Token，说明用户未登录，重定向到登录页
  if (!token) {
    console.log('Middleware: 没有Token，重定向到登录页');
    const loginPath = '/publisher/auth/login';
    const loginUrl = new URL(loginPath, origin);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 简化处理：有Token就直接放行，不进行校验
  console.log('Middleware: 有Token，直接放行');
  return NextResponse.next();
}

// 定义中间件的匹配路径
// 这里设置了哪些路径会被中间件处理
// 匹配规则是：匹配所有路径，但排除指定的路径
// 排除的路径包括：静态文件、API路由和public目录下的资源
export const config = {
  matcher: [
    /*
     * 匹配所有路径，但排除：
     * 1. 静态文件（/_next/static, /_next/image, /favicon.ico）
     * 2. API路由
     * 3. public目录下的静态资源（images, database, software, uploads）
     */
    // 使用正则表达式匹配路径，(?!...)表示排除这些路径
    // 这个规则会匹配所有不是静态文件、API路由或public资源的路径
    '/((?!_next/static|_next/image|favicon.ico|api|images|database|software|uploads).*)',
  ],
};
