import React from 'react';
import { Button } from '@/components/ui/Button';
import { AccountRentalInfo } from '../types';

// 根据订单状态返回对应的样式类名
const getOrderStatusClass = (status: string): string => {
  switch (status) {
    case '待确认':
      return 'bg-yellow-100 text-yellow-800';
    case '已确认':
      return 'bg-green-100 text-green-800';
    case '进行中':
      return 'bg-blue-100 text-blue-800';
    case '已完成':
      return 'bg-purple-100 text-purple-800';
    case '已取消':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 格式化发布时间
const formatPublishTime = (timeString: string): string => {
  const date = new Date(timeString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 定义账号卡片属性接口
interface AccountCardProps {
  account: AccountRentalInfo;
  onAccountClick: (accountId: string) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onAccountClick }) => {
  return (
      <div 
        key={account.id}
        onClick={() => onAccountClick(account.id)}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="text-sm font-medium text-gray-500">订单号: {account.orderNumber}</div>
          <div className={`text-sm px-2 py-1 rounded-full`}>
            {account.orderStatus}
          </div>
        </div>
        
        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{account.rentalDescription}</h3>
        
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          <div>发布时间: {formatPublishTime(account.publishTime)}</div>
          <div>出租天数: {account.rentalDays}天</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-red-600">¥{account.price}</div>
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onAccountClick(account.id);
            }}
          >
            查看详情
          </Button>
        </div>
      </div>
    );
  }

export default AccountCard;