'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AccountRentalPage = () => {
  const router = useRouter();

  // 重定向到租赁市场页面
  useEffect(() => {
    router.replace('/accountrental/account-rental-market');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-2">🔄</div>
        <div>正在进入账号租赁系统...</div>
      </div>
    </div>
  );
};

export default AccountRentalPage;