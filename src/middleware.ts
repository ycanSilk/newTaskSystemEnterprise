import { NextRequest, NextResponse } from 'next/server';
import { decryptRoute, isEncryptedRoute, encryptRoute } from './lib/routeEncryption';

// 需要加密的一级路由列表（包含所有页面路由）
const encryptableRoutes = ['publisher', 'accountrental'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const pathParts = pathname.split('/').filter(Boolean);

  // 检查是否需要解密（如果第一部分是加密的）
  if (pathParts.length > 0 && isEncryptedRoute(pathParts[0])) {
    try {
      // 解密路由
      const decryptedPath = decryptRoute(pathParts[0]);
      const decryptedParts = decryptedPath.split('/').filter(Boolean);
      
      // 构建新的路径
      const remainingPath = pathParts.slice(1).join('/');
      const newPath = `/${decryptedParts.join('/')}${remainingPath ? `/${remainingPath}` : ''}`;
      
      // 创建新的URL
      const newUrl = new URL(request.nextUrl.origin + newPath + search);
      
      // 返回重定向到解密后的路由
      return NextResponse.rewrite(newUrl);
    } catch (error) {

      return NextResponse.next();

      // 如果解密失败，返回404错误
      return new NextResponse('Not Found', { status: 404 });

    }
  }

  // 检查是否需要加密（如果路径至少有两级，且不是已加密的路由）
  if (pathParts.length >= 2 && !isEncryptedRoute(pathParts[0])) {
    // 检查请求头，避免无限重定向
    const isFromMiddleware = request.headers.get('x-from-middleware') === '1';
    
    if (!isFromMiddleware) {
      try {
        // 如果是一级路由，不加密
        if (pathParts.length === 1) {
          return NextResponse.next();
        }
        
        // 加密前两级路由
        const firstTwoLevels = `/${pathParts[0]}/${pathParts[1]}`;
        const encrypted = encryptRoute(firstTwoLevels);
        
        // 构建新的路径
        const remainingPath = pathParts.slice(2).join('/');
        const newPath = `/${encrypted}${remainingPath ? `/${remainingPath}` : ''}`;
        
        // 创建新的URL
        const newUrl = new URL(request.nextUrl.origin + newPath + search);
        
        // 返回重定向到加密后的路由
        const response = NextResponse.redirect(newUrl);
        response.headers.set('x-from-middleware', '1');
        return response;
      } catch (error) {
        return NextResponse.next();
      }
    }
  }


  return NextResponse.next();
}

// 定义中间件的匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，但排除：
     * 1. 静态文件（/_next/static, /_next/image, /favicon.ico）
     * 2. API路由
     * 3. public目录下的静态资源（images, database, software, uploads）
     */
    '/((?!_next/static|_next/image|favicon.ico|api|images|database|software|uploads).*)',
  ],
};
