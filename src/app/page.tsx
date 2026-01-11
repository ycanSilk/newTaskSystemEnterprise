import { redirect } from 'next/navigation';

export default function HomePage() {
  // 直接重定向到评论员登录页面
  redirect('/publisher/auth/login');
}