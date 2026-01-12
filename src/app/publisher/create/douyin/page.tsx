'use client';

import { Card, Button, Input, Badge, AlertModal } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// 系统预设任务类型
const TASK_TYPES = [
  {
    id: 'comment_top',
    title: '上评评论',
    price: 4.0,
    description: '真人账号发布高质量评论',
    requirements: '真人评论，评论内容真实有效。'
  },
  {
    id: 'comment_middle',
    title: '中评评论',
    price: 2.0,
    description: '真人账号发布高质量评论',
    requirements: '真人评论，评论内容真实有效。'
  },
  {
    id: 'task_combination_top_middle',
    title: '上中评评论',
    price: 10.0,
    description: '组合评论 - 1条上评评论 + 3条中评评论（数量可自定义选择，支持@功能）',
    requirements: '真人评论，评论内容真实有效。上评完成后需提交链接作为结算条件。'
  },
  {
    id: 'task_combination_middle_bottom',
    title: '中下评评论',
    price: 12,
    description: '组合评论 - 1条中评评论 + 2条下评评论（支持@功能）',
    requirements: '真人评论，评论内容真实有效。下评完成后需提交链接作为结算条件。'
  },
  {
    id: 'search_keyword',
    title: '放大镜搜索词',
    price: 5.0,
    description: '抖音平台规则原因，本产品属于概率出放大镜，搜索词搜索次数越多，出现概率越大',
    requirements: '在视频页面右上角搜索框中搜索指定内容，重复执行100次搜索操作'
  }
];

// 任务卡片组件
const TaskCard = ({ task, onClick }: { task: any, onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl px-5 py-3 shadow-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer active:scale-95"
    >
      {/* 任务头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <h3 className="font-bold text-lg">{task.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-500">
            {task.price === '自定义' ? '自定义' : `¥${task.price}`}
          </div>
        </div>
      </div>

      {/* 任务描述 */}
      <div className="mb-2">
        <p className="">{task.description}</p>
        <p className="text-gray-700 text-sm">{task.requirements}</p>
      </div>

      {/* 发布按钮 */}
      <div className="flex items-center justify-end">
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
          立即发布
        </div>
      </div>
    </div>
  );
};

export default function CreateTask() {
  const router = useRouter();
  
  // 提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });
  
  // 显示暂未开发提示
  const showNotDevelopedAlert = () => {
    setAlertConfig({
      title: '暂未开发',
      message: '该功能暂未开发',
      icon: '🔧'
    });
    setShowAlertModal(true);
  };

  const handleTaskClick = (task: any) => {
    // 处理任务选择
    if (task.id === 'comment_top') {
      // 上评任务 - 跳转到上评任务发布页面
      router.push(`/publisher/create/publish-top-comment`);
    } else if (task.id === 'task_combination_top_middle') {
      router.push(`/publisher/create/task-combination-top-middle`);
    } else if (task.id === 'task_combination_middle_bottom') {
      router.push(`/publisher/create/task-combination-middle-bottom`);
    } else if (task.id === 'search_keyword') {
      router.push(`/publisher/create/search-keyword-task`);
    } else {
      router.push(`/publisher/create/publish-middle-comment`);
    }
  };

  return (
    <div className="space-y-6 pb-10 mt-5">

      {/* 任务卡片列表 */}
      <div className="px-2 space-y-2">
        {TASK_TYPES.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClick={() => handleTaskClick(task)}
          />
        ))}
      </div>

      {/* 提示信息 */}
      <div className="px-2 space-y-2">
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <div>
              <h3 className="font-medium text-blue-900 mb-1">任务说明</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                请根据您的需求选择合适的任务类型。发布评论需求请规避抖音平台敏感词，否则会无法完成任务导致浪费宝贵时间。
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 通用提示模态框 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
}