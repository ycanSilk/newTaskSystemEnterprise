// 导入Next.js的请求和响应类型，用于处理HTTP请求和响应
import { NextRequest, NextResponse } from 'next/server';

// 定义公共路径（不需要登录即可访问）
// 这些路径任何人都可以访问，不需要登录验证
const publicPaths = ['/publisher/auth/login', '/publisher/auth/register', ];

// 定义需要保护的路径前缀
// 这些路径需要用户登录后才能访问
const protectedPathPrefixes = ['/publisher', '/rental'];

/**
 * 检查路径是否为公共路径
 * @param path 要检查的路径
 * @returns 如果是公共路径返回true，否则返回false
 */
const isPublicPath = (path: string): boolean => {
  // 遍历公共路径列表，检查当前路径是否等于公共路径或以公共路径开头
  return publicPaths.some(publicPath => path === publicPath || path.startsWith(`${publicPath}/`));
};

/**
 * 检查路径是否需要保护
 * @param path 要检查的路径
 * @returns 如果需要保护返回true，否则返回false
 */
const isProtectedPath = (path: string): boolean => {
  // 遍历需要保护的路径前缀列表，检查当前路径是否以其中一个前缀开头
  return protectedPathPrefixes.some(prefix => path.startsWith(prefix));
};

/**
 * 验证Token有效性
 * @param token 要验证的Token
 * @param origin 请求的来源地址
 * @returns 如果Token有效返回true，否则返回false
 */
const validateToken = async (token: string, origin: string): Promise<boolean> => {
  try {
    // 向服务器发送请求，验证Token是否有效
    const response = await fetch(`${origin}/api/auth/checkToken`, {
      headers: {
        // 设置Content-Type头为JSON格式
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 包含cookie信息
      cache: 'no-store', // 不使用缓存，每次都发送请求
    });
    // 如果响应状态为200，说明Token有效
    return response.status === 200;
  } catch (error) {
    // 如果发生错误，说明Token无效
    return false;
  }
};

// 导出中间件函数，处理所有HTTP请求
// 这个函数会在每个请求到达服务器之前执行
// @param request Next.js请求对象，包含请求的所有信息
// @returns Next.js响应对象，决定请求的处理方式
// @async 异步函数，因为需要发送网络请求
// @param request 要处理的请求对象
// @returns 处理后的响应对象
export async function middleware(request: NextRequest) {
  // 从请求URL中获取路径名、搜索参数和来源地址
  const { pathname, origin } = request.nextUrl;

  // ===== Token验证逻辑 =====
  
  // 如果是公共路径，直接放行
  // 例如，登录页和注册页不需要验证
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 如果不是需要保护的路径，直接放行
  // 例如，首页可能不需要登录
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // 从Cookie中获取Token
  // 登录成功后，服务器会将Token存储在Cookie中
  const token = request.cookies.get('token')?.value;

  // 如果没有Token，说明用户未登录，重定向到登录页
  if (!token) {
    // 确定重定向的登录页面
    // 无论什么路径，未登录都跳转到publisher登录页
    const loginPath = '/publisher/auth/login';

    
    // 创建登录页面的URL对象
    const loginUrl = new URL(loginPath, origin);
    // 添加重定向参数，登录成功后返回原页面
    // 这样用户登录后会自动回到原来想要访问的页面
    loginUrl.searchParams.set('redirect', pathname);
    
    // 返回重定向到登录页的响应
    return NextResponse.redirect(loginUrl);
  }

  // 验证Token有效性
  // 调用validateToken函数，检查Token是否有效
  const isValidToken = await validateToken(token, origin);

  // 如果Token无效，说明用户登录已过期或Token被篡改，重定向到登录页
  if (!isValidToken) {
    // 确定重定向的登录页面
    // 无论什么路径，Token无效都跳转到publisher登录页
    const loginPath = '/publisher/auth/login';
    
    // 创建登录页面的URL对象
    const loginUrl = new URL(loginPath, origin);
    // 添加重定向参数，登录成功后返回原页面
    loginUrl.searchParams.set('redirect', pathname);
    
    // 返回重定向到登录页的响应
    return NextResponse.redirect(loginUrl);
  }

  // Token有效，继续处理请求
  // 用户已经登录且Token有效，允许访问受保护的资源
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
