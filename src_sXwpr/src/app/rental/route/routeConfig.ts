// accountrental模块路由表配置
export interface RouteConfig {
  path: string;
  title: string;
  exact?: boolean;
}

// 路由配置列表，包含所有accountrental模块的路由及其对应标题
const routeConfig: RouteConfig[] = [
  {
    path: '/accountrental',
    title: '账户租赁',
    exact: true
  },
  {
    path: '/accountrental/account-rental-market',
    title: '出租市场',
    exact: true
  },
  {
    path: '/accountrental/account-rental-publish',
    title: '发布出租',
    exact: true
  },
  {
    path: '/accountrental/account-rental-requests',
    title: '求租信息',
    exact: true
  },
  {
    path: '/accountrental/my-account-rental',
    title: '我的租赁',
    exact: true
  },
  {
    path: '/accountrental/my-account-rental/rentalorder',
    title: '租赁订单',
    exact: true
  }
];

// 根据路径获取对应的页面标题
export const getPageTitle = (path: string): string => {
  // 精确匹配
  const exactMatch = routeConfig.find(route => route.exact && route.path === path);
  if (exactMatch) {
    return exactMatch.title;
  }
  
  // 前缀匹配（优先匹配最长的路径）
  const prefixMatches = routeConfig
    .filter(route => path.startsWith(route.path) && route.path !== '/accountrental')
    .sort((a, b) => b.path.length - a.path.length);
  
  if (prefixMatches.length > 0) {
    return prefixMatches[0].title;
  }
  
  // 默认标题
  return '账户租赁';
};

export default routeConfig;