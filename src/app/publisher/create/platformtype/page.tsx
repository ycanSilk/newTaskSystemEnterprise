'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertModal } from '@/components/ui';

// 定义平台类型接口
interface Platform {
  id: string;
  title: string;
  description: string;
  taskCount: number;
  color: string;
}

// 平台类型配置
const PLATFORMS: Platform[] = [
  {
    id: 'douyin',
    title: '抖音',
    description: '在抖音平台发布各类任务，包括评论、账号出租、视频发送等',
    taskCount: 5,
    color: 'from-red-500 to-pink-600'
  },
  {
    id: 'xiaohongshu',
    title: '小红书',
    description: '在小红书平台发布各类任务，包括评论、笔记推广等',
    taskCount: 3,
    color: 'from-red-400 to-orange-500'
  },
  {
    id: 'kuaishou',
    title: '快手',
    description: '在快手平台发布各类任务，包括评论、视频推广等',
    taskCount: 4,
    color: 'from-blue-500 to-teal-400'
  }
];

// 平台卡片组件
const PlatformCard = ({ platform, onClick }: { platform: Platform, onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer active:scale-95"
    >
      {/* 平台头部 */}
      <div className="flex items-center space-x-4 mb-4">
          <h3 className="font-bold text-gray-900 text-xl">{platform.title}</h3>
      </div>

      {/* 平台描述 */}
      <div className="mb-4">
        <p className="text-gray-700">{platform.description}</p>
      </div>

      {/* 进入按钮 */}
      <div className="flex items-center justify-end">
        <div className="bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2">
          <span>进入平台</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
}

export default function CreateTask() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlatformClick = (platform: Platform) => {
    // 只有抖音平台可以正常跳转，其他平台显示维护提示
    if (platform.id === 'douyin') {
      router.push(`/publisher/create/platform-task/${platform.id}`);
    } else {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 点击模态框外部关闭模态框
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className="space-y-6 pt-10 pb-20">
      {/* 平台卡片列表 */}
      <div className="px-4 space-y-4">
        {PLATFORMS.map((platform) => (
          <PlatformCard 
            key={platform.id} 
            platform={platform} 
            onClick={() => handlePlatformClick(platform)}
          />
        ))}
      </div>

      {/* 提示信息 */}
      <div className="px-4">
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">平台选择说明</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                请选择您需要发布任务的平台，目前只支持抖音平台。选择平台后，您将进入该平台的任务类型选择页面，可以选择具体的任务类型进行发布。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 维护提示模态框 - 使用统一的AlertModal组件 */}
      <AlertModal
        isOpen={isModalOpen}
        icon="🔧"
        title="功能暂未开放"
        message="该功能暂未开放，无法使用"
        onClose={closeModal}
      />
    </div>
  );
}