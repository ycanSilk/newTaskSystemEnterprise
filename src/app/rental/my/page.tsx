'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import RightOutlined from '@ant-design/icons/RightOutlined';
import ShopOutlined from '@ant-design/icons/ShopOutlined';
import TransactionOutlined from '@ant-design/icons/TransactionOutlined';
import DeploymentUnitOutlined from '@ant-design/icons/DeploymentUnitOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';

// 定义菜单项接口
interface MenuItem {
  id: string;
  title: string;
  color: string;
  path?: string;
}

const MyAccountRentalPage = () => {
  const router = useRouter();

  // 所有菜单项列表 - 更新为四个按钮，使用更匹配功能的图标
  const menuItems: MenuItem[] = [
    {
      id: 'rental-orders',
      title: '我出售的租赁订单',
      color: 'bg-blue-100',
      path: '/rental/my/mysellerrentalorder'
    },
    {
      id: 'lease-orders',
      title: '我购买的租赁订单',      
      color: 'bg-green-100',
      path: '/rental/my/mybuysrentedorder'
    },
    {
      id: 'rental-info',
      title: '我发布的出租信息',
      color: 'bg-purple-100',
      path: '/rental/my/myrelearentalinfo'
    },
    {
      id: 'lease-info',
      title: '我发布的求租信息',
      color: 'bg-amber-100',
      path: '/rental/my/myrelearrequestrentalinfo'
    },
    {
      id: 'help-center',
      title: '我应征的求租信息',
      color: 'bg-yellow-100',
      path: '/rental/my/myapplication'
    },
    {
      id: 'applied-lease-info',
      title: '待审核的应征信息',
      color: 'bg-yellow-100',
      path: '/rental/my/reviewapplication'
    },
    {
      id: 'workorder',
      title: '我的工单',
      color: 'bg-yellow-100',
      path: '/rental/workorder'
    }
  ];

  // 处理菜单项点击
  const handleMenuItemClick = (path?: string) => {
    if (path) {
      router.push(path as any);
    }
  };

  return (
    <div className="min-h-screen pb-28">
      {/* 功能菜单列表 */}
      <div className="mb-5">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMenuItemClick(item.path)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{
                  // 增大移动端触摸区域
                  minHeight: '60px',
                  touchAction: 'manipulation'
                }}
              >
                <div className="flex items-center space-x-3">{item.title}</div>
                <div className="text-gray-400">
                  <RightOutlined className="h-5 w-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountRentalPage;