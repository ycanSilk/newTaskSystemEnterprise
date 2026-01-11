'use client';
import React from 'react';
import { RightOutlined, UserOutlined, IdcardOutlined, CreditCardOutlined, FileTextOutlined, StarOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const PersonalInformationPage = () => {
  const router = useRouter();

  // Mock user data
  const userInfo = {
    avatar: '/images/1758380776810_96.jpg',
    nickname: '灵龙天赦',
    phone: '137*******08',
  };

  // Navigation items
  const navItems = [
    {
      id: 'avatar',
      title: '头像',
      icon: <UserOutlined />,
      showValue: true,
      value: <img src={userInfo.avatar} alt="Avatar" className="w-10 h-10 rounded-lg" />,
    },
    {
      id: 'nickname',
      title: '昵称',
      icon: <UserOutlined />,
      showValue: true,
      value: userInfo.nickname,
    },
    {
      id: 'digital-image',
      title: '数字形象',
      icon: <UserOutlined />,
      showValue: false,
    },
    {
      id: 'alipay',
      title: '支付宝账号',
      icon: <CreditCardOutlined />,
      showValue: true,
      value: userInfo.phone,
    },
    {
      id: 'identity',
      title: '身份信息',
      icon: <IdcardOutlined />,
      showValue: false,
    },
    {
      id: 'business-card',
      title: '我的名片',
      icon: <IdcardOutlined />,
      showValue: false,
    },
    {
      id: 'homepage',
      title: '我的主页',
      icon: <UserOutlined />,
      showValue: false,
    },
    {
      id: 'profile',
      title: '我的档案',
      icon: <FileTextOutlined />,
      showValue: false,
    },
    {
      id: 'collections',
      title: '我的收藏',
      icon: <StarOutlined />,
      showValue: false,
    },
  ];

  const handleItemClick = (itemId: string) => {
    // Handle item click logic
    console.log(`Clicked on item: ${itemId}`);
    // Navigate to specific pages if needed
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 flex items-center border-b border-gray-200">
        <button 
          onClick={handleBack} 
          className="mr-4 text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium text-gray-900">个人信息</h1>
      </div>

      {/* Content */}
      <div className="mt-4 bg-white">
        {navItems.map((item) => (
          <div 
            key={item.id}
            className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            onClick={() => handleItemClick(item.id)}
          >
            <div className="flex items-center">
              <span className="text-gray-500 mr-3">{item.icon}</span>
              <span className="text-gray-800">{item.title}</span>
            </div>
            <div className="flex items-center">
              {item.showValue && (
                <span className="text-gray-500 mr-2">{item.value}</span>
              )}
              <RightOutlined className="text-gray-400 w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalInformationPage;