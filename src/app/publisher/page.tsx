import { redirect } from 'next/navigation';

/**
 * Publisher 导航页面
 * 当访问 /publisher 时，自动重定向到 /publisher/dashboard
 * 避免 404 页面问题
 */
const PublisherPage = () => {
  // 自动重定向到派单系统的仪表盘页面
  redirect('/publisher/dashboard');
};

export default PublisherPage;