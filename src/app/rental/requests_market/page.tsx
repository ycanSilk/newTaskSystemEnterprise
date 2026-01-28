'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOutlined, CopyOutlined } from '@ant-design/icons';
import { Button } from '@/components/ui/Button';
import { GetRequestRentalMarketListResponse, RequestRentalItem } from '@/app/types/rental/requestRental/getRequestRentalMarketListTypes';

// 格式化发布时间
const formatPublishTime = (timeString: string | undefined): string => {
  if (!timeString) {
    return '未知时间';
  }
  
  return timeString;
};

const RentalRequestsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [rentalRequests, setRentalRequests] = useState<RequestRentalItem[]>([]);

  // 获取求租市场列表数据
  useEffect(() => {
    const fetchRentalRequests = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/rental/requestRental/getRequestRentalMarketList');
        const data: GetRequestRentalMarketListResponse = await response.json();
        
        if (data.success && data.code === 0) {
          setRentalRequests(data.data.list);
        } else {
          setError(data.message || '获取求租信息失败');
        }
      } catch (err) {
        setError('网络错误，无法获取求租信息');
        console.error('获取求租信息失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalRequests();
  }, []);

  // 过滤求租信息
  const filteredRequests = rentalRequests.filter(request => 
    request.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理查看详情
  const handleViewDetail = (requestId: number) => {
    router.push(`/rental/requests_market/detail/${requestId}`);
  };

  // 复制订单号
  const copyOrderNumber = (event: React.MouseEvent, orderNumber: string) => {
    event.stopPropagation();
    navigator.clipboard.writeText(orderNumber)
      .then(() => {
        setCopySuccess(orderNumber);
        setTimeout(() => {
          setCopySuccess(null);
        }, 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-2 py-6">
        {/* 发布求租信息按钮 */}
        <div className="mb-6">
          <Button 
            onClick={() => router.push('/rental/rental_publish/requests')}
            className="bg-blue-600 w-full hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-medium shadow-md transition-all min-h-12 active:scale-95"
          >
            发布求租信息
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <SearchOutlined className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">暂无求租信息</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <div 
                key={request.id} 
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetail(request.id)}
              >                
                {/* 求租要求显示模块 */}
                <div className="mb-3 space-y-3">
                  {/* 账号要求 - 根据支持情况显示 */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">账号要求</label>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-700">
                        ✓ 求租账号用于发布短视频推广
                      </div>
                    </div>
                  </div>
                  
                  {/* 登录方式 - 根据支持情况显示 */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">登录方式</label>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-700">
                        ✓ 支持多种登录方式
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{request.title}</h3>
                <div className="flex justify-between items-center text-sm mb-2">
                  <div>发布时间: {formatPublishTime(request.created_at)}</div>
                  <div>需要租赁天数: {request.days_needed}天</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xl font-bold text-red-600">
                    租赁价格：<span>¥{request.budget_amount_yuan}</span>/天
                  </div>
                  <Button onClick={() => handleViewDetail(request.id)} className="bg-blue-500 hover:bg-blue-600 text-white">查看详情</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default RentalRequestsPage;