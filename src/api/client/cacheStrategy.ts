// 缓存策略配置
// 定义缓存相关的类型和函数，用于API请求的缓存管理

/**
 * 缓存控制配置接口
 * 用于控制API请求的缓存行为
 */
export interface CacheControlConfig {
  // 是否启用缓存，默认true
  enabled?: boolean;
  // 是否强制刷新缓存，默认false
  forceRefresh?: boolean;
  // 缓存级别，默认'default'
  level?: string;
}

/**
 * 缓存策略接口
 * 定义不同API请求的缓存策略
 */
interface CacheStrategy {
  // 是否启用缓存
  enabled: boolean;
  // 缓存级别
  level: string;
}

/**
 * 缓存级别配置
 * 定义不同缓存级别的过期时间（毫秒）
 */
const CACHE_LEVELS = {
  // 不缓存
  none: 0,
  // 短时间缓存（1分钟）
  short: 1 * 60 * 1000,
  // 默认缓存（5分钟）
  default: 5 * 60 * 1000,
  // 中等缓存（15分钟）
  medium: 15 * 60 * 1000,
  // 长时间缓存（1小时）
  long: 60 * 60 * 1000,
  // 永久缓存（1天）
  permanent: 24 * 60 * 60 * 1000,
};

/**
 * 获取缓存过期时间
 * @param level 缓存级别
 * @returns 过期时间（毫秒）
 */
export const getCacheExpiryTime = (level: string): number => {
  return CACHE_LEVELS[level as keyof typeof CACHE_LEVELS] || CACHE_LEVELS.default;
};

/**
 * 生成缓存键
 * @param url 请求URL
 * @param params 请求参数
 * @returns 唯一的缓存键
 */
export const generateCacheKey = (url: string, params?: any): string => {
  // 如果有参数，将参数序列化后添加到缓存键中
  if (params) {
    // 对参数进行排序，确保相同参数不同顺序时生成相同的缓存键
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as any);
    return `${url}_${JSON.stringify(sortedParams)}`;
  }
  return url;
};

/**
 * 获取缓存策略
 * @param url 请求URL
 * @param method 请求方法
 * @returns 缓存策略
 */
export const getCacheStrategy = (url: string, method: string): CacheStrategy => {
  // 只对GET请求启用缓存
  if (method !== 'GET') {
    return {
      enabled: false,
      level: 'none',
    };
  }

  // 根据URL路径确定缓存策略
  // 这里可以根据实际API路径进行更详细的配置
  const path = url.replace(/^\/api\//, '');

  // 定义不同路径的缓存策略
  const pathStrategies: Record<string, CacheStrategy> = {
    // 短时间缓存：频繁变化的数据
    'users/getUserInfo': {
      enabled: true,
      level: 'short',
    },
    // 中等缓存：不太频繁变化的数据
    'system/config': {
      enabled: true,
      level: 'medium',
    },
    // 长时间缓存：基本不变的数据
    'system/constants': {
      enabled: true,
      level: 'long',
    },
  };

  // 查找匹配的路径策略
  for (const [pattern, strategy] of Object.entries(pathStrategies)) {
    if (path.includes(pattern)) {
      return strategy;
    }
  }

  // 默认策略：启用缓存，使用默认级别
  return {
    enabled: true,
    level: 'default',
  };
};

/**
 * 生成缓存失效模式
 * @param url 请求URL
 * @returns 缓存失效模式数组
 */
export const generateInvalidationPatterns = (url: string): string[] => {
  const patterns: string[] = [];
  
  // 提取URL路径
  const path = url.replace(/^\/api\//, '');
  
  // 基础路径模式
  patterns.push(path);
  
  // 父路径模式
  const pathSegments = path.split('/');
  if (pathSegments.length > 1) {
    // 添加父路径模式，如 users/*
    const parentPath = pathSegments.slice(0, -1).join('/');
    patterns.push(`${parentPath}/*`);
  }
  
  // 根路径模式
  patterns.push('*');
  
  return patterns;
};