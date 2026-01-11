import * as React from 'react';

// 订单任务类型枚举 - 使用数字定义以符合数据库设计
// 0: 评论任务, 1: 视频发布, 2: 账号租赁
export enum TaskType {
  COMMENT = 0,
  VIDEO_PUBLISH = 1,
  ACCOUNT_RENTAL = 2,
}

interface OrderTaskTypeProps {
  type: TaskType;
}

/**
 * 订单任务类型组件
 * 支持显示评论任务、视频发布和账号租赁类型
 * 背景颜色为浅蓝色，字体颜色为蓝色，确保对比明显
 */
const OrderTaskType: React.FC<OrderTaskTypeProps> = ({ type }) => {
  // 任务类型配置映射
  const taskTypeConfig = [
    {
      label: '评论任务',
    },
    {
      label: '视频发布',
    },
    {
      label: '账号租赁',
    },
  ];

  // 获取当前任务类型的配置
  const config = taskTypeConfig[type] || taskTypeConfig[0]; // 默认显示评论任务
  // 统一的样式：浅蓝色背景，蓝色字体，确保对比明显
  const commonClassName = 'bg-blue-100 text-blue-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${commonClassName}`}>
      {config.label}
    </span>
  );
};

export default OrderTaskType;