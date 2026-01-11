import * as React from 'react';
import { SearchOutlined, RightOutlined } from '@ant-design/icons';


interface OrderHeaderTemplateProps {
  title: string;
  totalCount?: number;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  handleSearch?: () => void;
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  viewAllUrl?: string;
  onViewAllClick?: () => void;
  sortOptions?: { value: string; label: string }[];
}

const OrderHeaderTemplate: React.FC<OrderHeaderTemplateProps> = ({
  title,
  totalCount,
  searchTerm = '',
  setSearchTerm,
  handleSearch,
  sortBy = 'time',
  setSortBy,
  viewAllUrl,
  onViewAllClick,
  sortOptions = [
    { value: 'time', label: '按时间排序' },
    { value: 'price', label: '按价格排序' }
  ]
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">{title}</h3>
        {totalCount !== undefined && (
          <span className="text-sm text-gray-500">共 {totalCount} 个订单</span>
        )}
      </div>
      
      {/* 搜索框和搜索按钮 */}
      {(setSearchTerm && handleSearch) && (
        <div className="flex-grow max-w-md">
          <div className="grid grid-cols-[79%_20%] gap-1">
            <div className="relative mr-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchOutlined className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="搜索订单号、标题或描述"
                value={searchTerm}
                onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch && handleSearch()}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button 
              onClick={() => handleSearch && handleSearch()}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md whitespace-nowrap"
            >
              搜索
            </button>
          </div>
        </div>
      )}
      
      {/* 排序选择和查看全部订单按钮 */}
      <div className="grid grid-cols-2 gap-2">
        {setSortBy && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy && setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        
        <button 
          onClick={() => onViewAllClick && onViewAllClick()}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-600 transition-colors w-full"
        >
          查看全部订单
        </button>
      </div>
    </div>
  );
};

export default OrderHeaderTemplate;