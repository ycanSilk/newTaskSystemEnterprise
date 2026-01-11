import * as React from 'react';

// 订单状态枚举 - 使用数字定义以符合数据库设计
// 0: 待处理, 1: 进行中, 2: 审核中, 3: 已完成, 4: 已拒绝, 5: 已取消
export enum OrderStatusType {
  PENDING = 0,
  PROCESSING = 1,
  REVIEWING = 2,
  COMPLETED = 3,
  REJECTED = 4,
  CANCELLED = 5,
}

interface OrderStatusProps {
  status: OrderStatusType;
}

/**
 * 订单状态组件
 * 支持显示待领取、进行中、待审核、已完成、已拒绝、已取消六种状态
 * 背景颜色与字体颜色保持一致色系但有明暗对比
 */
const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => {
  // 状态配置映射
  const statusConfig = [
    {
      label: '待处理',
      className: 'bg-yellow-100 text-yellow-800',
    },
    {
      label: '进行中',
      className: 'bg-blue-100 text-blue-800',
    },
    {
      label: '审核中',
      className: 'bg-purple-100 text-purple-800',
    },
    {
      label: '已完成',
      className: 'bg-green-100 text-green-800',
    },
    {
      label: '已拒绝',
      className: 'bg-red-100 text-red-800',
    },
    {
      label: '已取消',
      className: 'bg-gray-100 text-gray-800',
    },
  ];

  // 获取当前状态的配置
  const config = statusConfig[status] || statusConfig[5]; // 默认显示已取消

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default OrderStatus;