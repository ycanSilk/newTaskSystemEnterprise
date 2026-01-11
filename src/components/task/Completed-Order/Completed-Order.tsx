import React from 'react';
import { useRouter } from 'next/navigation';
import { EditOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';


// 定义订单类型接口
export interface SubOrder {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
  submitTime?: string;
  reviewTime?: string;
  reward: number;
  content?: string;
  screenshots?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  budget: number;
  assignedTo?: string;
  completionTime?: string;
  type: 'comment' | 'like' | 'share' | 'other';
  subOrders: SubOrder[];
  videoUrl?: string;
}

interface CompletedOrderCardProps {
  order: Order;
  onCopyOrderNumber?: (orderNumber: string) => void;
  onViewDetails?: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  copiedOrderNumber?: string | null;
}

const CompletedOrderCard: React.FC<CompletedOrderCardProps> = ({
  order,
  onCopyOrderNumber,
  onViewDetails,
  onReorder,
  copiedOrderNumber
}) => {
  const router = useRouter();

  // 获取子订单各状态的统计数据
  const getSubOrderStats = (subOrders: SubOrder[]) => {
    const stats = {
      total: subOrders.length,
      pending: subOrders.filter(sub => sub.status === 'pending').length,
      processing: subOrders.filter(sub => sub.status === 'processing').length,
      reviewing: subOrders.filter(sub => sub.status === 'reviewing').length,
      completed: subOrders.filter(sub => sub.status === 'completed').length,
      rejected: subOrders.filter(sub => sub.status === 'rejected').length
    };
    return stats;
  };




  // 计算完成进度
  const subOrderStats = getSubOrderStats(order.subOrders);
  const completionRate = subOrderStats.total > 0 
    ? Math.round((subOrderStats.completed / subOrderStats.total) * 100) 
    : 0;

  // 处理复制订单号
  const handleCopyOrderNumber = () => {
    if (onCopyOrderNumber) {
      onCopyOrderNumber(order.orderNumber);
    }
  };

  // 处理查看详情
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(order.id);
    } else {
      router.push(`/publisher/orders/task-detail/${order.id}`);
    }
  };

  // 处理补单 - 跳转到补单页面并传递订单信息
  const handleReorder = () => {
    // 跳转到专门的补单页面，并传递订单信息
    router.push(`/publisher/create/supplementaryorder?reorder=true&orderId=${order.id}&title=${encodeURIComponent(order.title)}&description=${encodeURIComponent(order.description)}&type=${order.type}&budget=${order.budget.toString()}&subOrderCount=${order.subOrders.length}`);
  };

  return (
    <div className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-2 bg-white">
      <div className="flex items-center mb-1 overflow-hidden">
        <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate text-black text-sm">
          订单号：{order.orderNumber}
        </div>
        <button 
          className="text-blue-600 hover:text-blue-700 whitespace-nowrap text-sm"
          onClick={handleCopyOrderNumber}
        >
          <span>⧉ 复制</span>
        </button>
      </div>
      <div className="flex items-center space-x-3 mb-2 pb-1">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700`}>
          已完成
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {order.title.includes('上评评论') ? '上评评论' : order.title.includes('中评评论') ? '中评评论' : '评论任务'}
        </span>
      </div>
      <div className="mb-2 text-sm text-black text-sm">
        发布时间：{order.createdAt}
      </div>
      <div className="mb-2 text-sm text-black text-sm ">
        截止时间：{new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN')}
      </div>
      <div className="text-black text-sm mb-2 w-full rounded-lg">
          要求：组合任务，{order.title.includes('上评评论') ? '上评评论' : order.title.includes('中评评论') ? '中评评论' : '评论任务'}
      </div>

      <div className="mb-2 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
        <p className='mb-2  text-sm text-blue-600'>任务视频点击进入：</p>
        <a 
          href="http://localhost:3000/publisher/dashboard?tab=active" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center"
          onClick={(e) => {
            e.preventDefault();
            // 在实际应用中，这里应该跳转到抖音视频页面
            window.open('https://www.douyin.com', '_blank');
          }}
        >
          <span className="mr-1">⦿</span> 打开视频
        </a>
      </div>
      
      <div className="mb-2 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
        <p className='mb-2  text-sm text-blue-600'>已完成评论点击进入：</p>
        <a 
          href="http://localhost:3000/publisher/dashboard?tab=active" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center"
          onClick={(e) => {
            e.preventDefault();
            // 在实际应用中，这里应该跳转到抖音视频页面
            window.open('https://www.douyin.com', '_blank');
          }}
        >
          <span className="mr-1">⦿</span> 打开视频
        </a>
      </div>

      
     
     <div className="flex gap-2 mb-2">
        <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
          <span className="text-white text-sm mb-1">总价</span>
          <span className="text-white text-sm block">¥{order.budget.toFixed(2)}</span>
        </div>
        <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
          <span className="text-white text-sm mb-1">单价</span>
          <span className="text-white text-sm block">¥{(order.budget / Math.max(subOrderStats.total, 1)).toFixed(2)}</span>
        </div>
        <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
          <span className="text-white text-sm mb-1">订单数</span>
          <span className="text-white text-sm block">{subOrderStats.total}</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex-1"
          onClick={handleViewDetails}
        >
          查看详情
        </button>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex-1"
          onClick={handleReorder}
        >
          补单
        </button>
      </div>
    </div>
  );
};

export default CompletedOrderCard;
