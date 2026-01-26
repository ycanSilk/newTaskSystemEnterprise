// 路由加密和解密工具函数

// 使用环境变量或配置文件中的密钥
const SECRET_KEY = process.env.ROUTE_ENCRYPTION_KEY || 'your-secret-key-here-change-me-in-production';

/**
 * 简单的XOR加密实现（用于演示，生产环境建议使用更安全的算法）
 * @param text 要加密的文本
 * @param key 加密密钥
 * @returns 加密后的文本
 */
const xorEncrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

/**
 * 将路由路径加密
 * @param path 原始路由路径（例如：/publisher/dashboard）
 * @returns 加密后的路由路径
 */
export const encryptRoute = (path: string): string => {
  // 移除开头的斜杠
  const pathWithoutSlash = path.startsWith('/') ? path.slice(1) : path;
  // 先使用XOR加密
  const xorEncrypted = xorEncrypt(pathWithoutSlash, SECRET_KEY);
  // 再使用Base64编码，明确指定UTF-8
  const encoded = Buffer.from(xorEncrypted, 'utf-8').toString('base64');
  // 替换URL中可能出现的特殊字符
  const result = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return result;
};

/**
 * 将加密的路由路径解密为原始格式
 * @param encryptedPath 加密后的路由路径
 * @returns 原始路由路径
 */
export const decryptRoute = (encryptedPath: string): string => {
  // 还原Base64编码
  const padded = encryptedPath.padEnd(encryptedPath.length + (4 - encryptedPath.length % 4) % 4, '=');
  // 明确指定使用UTF-8解码
  const base64Decoded = Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
  // 使用XOR解密
  const decrypted = xorEncrypt(base64Decoded, SECRET_KEY);
  // 添加开头的斜杠
  const result = `/${decrypted}`;
  return result;
};

/**
 * 检查路径是否已加密
 * @param path 要检查的路径
 * @returns 是否已加密
 */
export const isEncryptedRoute = (path: string): boolean => {
  // 排除已知的静态资源路径
  const staticPaths = ['images', 'database', 'software', 'uploads', '_next', 'api'];
  if (staticPaths.includes(path)) {
    return false;
  }
  
  // 排除已知的一级路由
  const knownRoutes = ['publisher', 'rental'];
  if (knownRoutes.includes(path)) {
    return false;
  }
  
  // 检查是否符合Base64URL格式
  const base64UrlPattern = /^[A-Za-z0-9-_]+$/;
  if (!base64UrlPattern.test(path)) {
    return false;
  }
  
  // 尝试验解密，如果解密后的路径包含乱码或不符合预期格式，则认为不是加密路由
  try {
    const decrypted = decryptRoute(path);
    
    // 检查解密后的路径是否包含预期的一级路由
    const decryptedParts = decrypted.split('/').filter(Boolean);
    if (decryptedParts.length > 0 && knownRoutes.includes(decryptedParts[0])) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }

  return base64UrlPattern.test(path);
};

/**
 * 加密URL路径的前两级路由
 * @param url 完整的URL（例如：http://localhost:3000/publisher/dashboard?tab=OverView
 * @returns 加密后的URL
 */
export const encryptUrlFirstTwoLevels = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      // 获取前两级路由
      const firstTwoLevels = `/${pathParts[0]}/${pathParts[1]}`;
      // 加密前两级路由
      const encrypted = encryptRoute(firstTwoLevels);
      // 构建新的路径
      const remainingPath = pathParts.slice(2).join('/');
      const newPath = `/${encrypted}${remainingPath ? `/${remainingPath}` : ''}`;
      
      // 更新URL路径
      parsedUrl.pathname = newPath;
      const result = parsedUrl.toString();
      return result;
    }
    return url;
  } catch (error) {
    return url;
  }
};

/**
 * 解密URL路径的前两级路由
 * @param url 加密后的URL
 * @returns 解密后的URL
 */
export const decryptUrlFirstTwoLevels = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 1 && isEncryptedRoute(pathParts[0])) {
      // 解密第一级（实际包含前两级路由）
      const decrypted = decryptRoute(pathParts[0]);
      // 构建新的路径
      const remainingPath = pathParts.slice(1).join('/');
      const newPath = `${decrypted}${remainingPath ? `/${remainingPath}` : ''}`;
      
      // 更新URL路径
      parsedUrl.pathname = newPath;
      const result = parsedUrl.toString();
      return result;
    }
    return url;
  } catch (error) {
    return url;
  }
};
