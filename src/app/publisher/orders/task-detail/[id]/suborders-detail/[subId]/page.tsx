"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LeftOutlined, CopyOutlined } from '@ant-design/icons';
import { SubOrder } from '../../page';
import OrderStatus from '../../../../../../../components/order/OrderStatus';
import OrderTaskType, { TaskType } from '../../../../../../../components/order/OrderTaskType';

// 子订单详情页面组件
const SubOrderDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  
  // 解析URL路径获取正确的订单ID和子订单ID
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/');
  const orderIdIndex = pathParts.indexOf('task-detail') + 1;
  const subOrderIdIndex = pathParts.indexOf('suborders-detail') + 1;
  
  const orderId = orderIdIndex < pathParts.length ? pathParts[orderIdIndex] : '';
  const subOrderId = subOrderIdIndex < pathParts.length ? pathParts[subOrderIdIndex] : '';

  const [subOrder, setSubOrder] = useState<SubOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // 模拟获取子订单详情数据 - 使用固定的静态数据
  useEffect(() => {
    const fetchSubOrderDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // 固定的静态数据，状态为"进行中"
        const mockSubOrder: SubOrder = {
          id: 'fixed-suborder-001', // 固定ID，不随时间或参数变化
          orderId: 'fixed-order-001', // 固定订单ID
          userId: 'user-001',
          userName: '测试用户',
          status: 'processing', // 固定状态为"进行中"
          commentContent: '这是一个固定的测试子订单内容。用户正在处理该任务，已经提交了初步的工作成果。',
          submitTime: '2024-01-15T10:30:00.000Z', // 固定日期时间
          submitLink: 'https://example.com/submit-link',
          reviewTime: '2024-01-15T14:45:00.000Z',
          reward: 50,
          content: '这是一个固定的测试子订单内容。用户正在处理该任务，已经提交了初步的工作成果。',
          screenshots: [
            'https://via.placeholder.com/600x400?text=Screenshot+1',
            'https://via.placeholder.com/600x400?text=Screenshot+2'
          ]
        };

        setSubOrder(mockSubOrder);
      } catch (err) {
        setError('获取子订单详情失败，请稍后重试。');
        console.error('Failed to fetch suborder detail:', err);
      } finally {
        setLoading(false);
      }
    };

    // 只要组件挂载就加载数据，不再依赖orderId和subOrderId参数
    fetchSubOrderDetail();
  }, []);

  // 处理返回按钮点击
  const handleBack = () => {
    router.push(`/publisher/orders/task-detail/${orderId}`);
  };

  // 处理返回顶部按钮点击
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 复制订单编号
  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 获取状态对应的中文名称和样式
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      pending: { text: '待领取', className: 'bg-yellow-100 text-yellow-800' },
      processing: { text: '进行中', className: 'bg-blue-100 text-blue-800' },
      reviewing: { text: '待审核', className: 'bg-purple-100 text-purple-800' },
      completed: { text: '已完成', className: 'bg-green-100 text-green-800' }
    };
    return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
  };

  // 字符串状态转换为数字状态
  const getStatusNumber = (status: string): number => {
    const statusMap: Record<string, number> = {
      pending: 0,
      processing: 1,
      reviewing: 2,
      completed: 3
    };
    return statusMap[status] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LeftOutlined className="h-4 w-4 mr-2" />
            返回上一页
          </button>
          <div className="animate-pulse space-y-4">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-6 bg-gray-200 rounded w-2/3"></div>
                ))}
              </div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-32 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-md"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !subOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LeftOutlined className="h-4 w-4 mr-2" />
            返回上一页
          </button>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-gray-700 text-lg font-medium">{error || '子订单不存在或已被删除'}</p>
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                返回上一页
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(subOrder.status);
  const statusNumber = getStatusNumber(subOrder.status);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* 返回按钮 */}
          <button
            onClick={handleBack}
            className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LeftOutlined className="h-4 w-4 mr-2" />
            返回上一页
          </button>

          {/* 子订单信息卡片 */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {/* 子订单头部信息 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium  mr-2">所属订单编号:</span>
                  <span className="text-sm text-gray-900">{subOrder.orderId}</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-2 md:mb-0">
                  <span className="text-sm font-medium  mr-2">订单编号:</span>
                  <span className="text-sm text-gray-900 font-medium mr-2">{subOrder.id}</span>
                  <button
                    onClick={() => handleCopyOrderId(subOrder.id)}
                    className="text-blue-500 hover:text-white p-1 rounded hover:bg-blue-500"
                    title="复制订单编号"
                  >
                    复制
                  </button>
                  {copySuccess && (
                    <span className="text-xs text-green-500 ml-1">已复制</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <OrderStatus status={statusNumber} />
                  <OrderTaskType type={TaskType.COMMENT} />
                </div>
              </div>
            </div>

            {/* 子订单详情内容 */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-start">
                  <span className="text-sm font-medium  mr-2">领取用户:</span>
                  <span className="text-sm text-gray-900">{subOrder.userName}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm font-medium  mr-2">奖励金额:</span>
                  <span className="text-sm text-gray-900 font-medium">¥{(subOrder.reward ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm font-medium  mr-2">提交时间:</span>
                  <span className="text-sm text-gray-900">{subOrder.submitTime ? formatDate(subOrder.submitTime) : '未提交'}</span>
                </div>
              </div>
              {subOrder.content && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">提交内容</h4>
                  <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {subOrder.content}
                  </div>
                </div>
              )}
              {subOrder.screenshots && subOrder.screenshots.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">提交截图</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {subOrder.screenshots.map((screenshot, index) => (
                      <div key={index} className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={screenshot} 
                          alt={`提交截图 ${index + 1}`} 
                          className="object-cover w-full h-full cursor-pointer hover:opacity-90" 
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubOrderDetailPage;