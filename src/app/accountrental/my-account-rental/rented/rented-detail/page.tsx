'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  ShopOutlined, 
  DollarOutlined,
  FileTextOutlined,
  MessageOutlined,
  StarOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';

// 定义订单详情接口
export interface OrderDetail {
  id: string;
  orderId: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  totalHours: number;
  accountId: string;
  accountTitle: string;
  platform: string;
  rentalStartTime: string;
  rentalEndTime: string;
  actualEndTime?: string;
  description?: string;
  images?: string[];
  createdTime: string;
  paymentTime: string;
  deliveryTime?: string;
  completionTime?: string;
  sellerName: string;
  sellerId: string;
  rating?: number;
  // 其他订单详情字段
  transactionId: string;
}

// 获取平台对应的名称
const getPlatformName = (platform: string) => {
  const platformMap: Record<string, string> = {
    douyin: '抖音',
    xiaohongshu: '小红书',
    kuaishou: '快手'
  };
  return platformMap[platform] || platform;
};

// 获取状态对应的颜色和文本
const getStatusInfo = (status: string, paymentStatus: string) => {
  // 待付款: scheduled且未付款
  if (status === 'scheduled' && paymentStatus === 'unpaid') {
    return { color: 'bg-red-100 text-red-700', text: '待付款' };
  }
  // 租赁中: active
  if (status === 'active') {
    return { color: 'bg-blue-100 text-blue-700', text: '租赁中' };
  }
  // 已过期: 其他所有状态
  return { color: 'bg-green-100 text-green-700', text: '交易成功' };
};

// 格式化时间
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  });
};

// 格式化时间（带时分）
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化时间（只带时分）
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit',
    minute: '2-digit'
  });
};

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 模拟获取订单详情数据
  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        // 在实际项目中，这里应该调用API获取订单详情
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟订单详情数据
        const mockOrderDetail: OrderDetail = {
          id: 'rent001',
          orderId: 'ORD20230705001',
          status: 'completed',
          paymentStatus: 'paid',
          totalAmount: 112.00,
          totalHours: 24,
          accountId: 'ACC123456',
          accountTitle: '抖音账号 - 美食领域大V',
          platform: 'douyin',
          rentalStartTime: '2023-06-30T17:01:17',
          rentalEndTime: '2023-07-01T17:01:17',
          actualEndTime: '2023-07-01T17:05:42',
          description: '这是一个高质量的美食领域抖音账号，拥有10万+粉丝，互动率高，适合推广餐饮相关产品。账号内容主要为美食测评和制作教程。',
          images: [
            '/images/1758380776810_96.jpg',
            '/images/1758384598887_578.jpg',
            '/images/1758596791656_544.jpg',
            '/images/0e92a4599d02a7.jpg'
          ],
          createdTime: '2023-06-30T17:01:17',
          paymentTime: '2023-06-30T17:01:53',
          deliveryTime: '2023-06-30T17:13:53',
          completionTime: '2023-07-01T17:05:42',
          sellerName: '真诚对待 诚心交易',
          sellerId: 'SEL789012',
          rating: 5,
          transactionId: '20250630220011280414235888906'
        };
        
        setOrderDetail(mockOrderDetail);
      } catch (error) {
        console.error('获取订单详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, []);

  // 处理返回
  const handleBack = () => {
    router.back();
  };

  // 处理复制
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // 实际项目中可以添加复制成功的提示
    console.log(`${label}已复制`);
  };

  // 处理联系卖家
  const handleContactSeller = () => {
    console.log('联系卖家');
    // 实际项目中应该跳转到聊天页面
  };

  // 处理查看评价
  const handleViewReview = () => {
    console.log('查看评价');
    // 实际项目中应该跳转到评价页面
  };

  // 处理再次购买
  const handleBuyAgain = () => {
    console.log('再次购买');
    // 实际项目中应该跳转到商品页面
  };

  if (loading || !orderDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center">
          <button onClick={handleBack} className="mr-2">
            <ArrowLeftOutlined className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-medium">订单详情</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(orderDetail.status, orderDetail.paymentStatus);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 头部导航 */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center sticky top-0 z-10">
        <button onClick={handleBack} className="mr-2">
          <ArrowLeftOutlined className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-medium">订单详情</h1>
      </div>

      {/* 订单状态 */}
      <div className="bg-white px-4 py-5 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-3">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-500 text-xl">😃</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-medium mb-1">{statusInfo.text}</h2>
            {orderDetail.rating && (
              <p className="text-sm text-gray-500">评价完成，感谢使用小鱼租号~</p>
            )}
          </div>
        </div>
      </div>

      {/* 订单信息内容 */}
      <div className="bg-white mt-2">
        {/* 商品信息 */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex">
            {orderDetail.images && orderDetail.images.length > 0 && (
              <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden mr-3">
                <img 
                  src={orderDetail.images[0]} 
                  alt={orderDetail.accountTitle} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-sm mb-2 line-clamp-2">{orderDetail.accountTitle}</h3>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  平台: {getPlatformName(orderDetail.platform)}
                </div>
                <div className="text-lg font-medium text-red-600">
                  ¥{orderDetail.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 订单编号等信息 */}
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">成交价格</span>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">已到达卖家账户</span>
              <span className="text-lg font-medium text-red-600">¥{orderDetail.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">订单编号</span>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">{orderDetail.orderId}</span>
              <button 
                onClick={() => handleCopy(orderDetail.orderId, '订单编号')}
                className="text-sm text-blue-500"
              >
                复制
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">交易快照</span>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">发生交易争议时，可作为判断依据</span>
              <ArrowLeftOutlined className="text-sm text-blue-500 transform rotate-180" />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">交易流水号</span>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">{orderDetail.transactionId}</span>
              <button 
                onClick={() => handleCopy(orderDetail.transactionId, '交易流水号')}
                className="text-sm text-blue-500"
              >
                复制
              </button>
            </div>
          </div>

          {/* 订单描述 */}
          {orderDetail.description && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">订单描述</div>
              <p className="text-sm bg-gray-50 p-3 rounded">{orderDetail.description}</p>
            </div>
          )}

          {/* 订单时间信息 */}
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">下单时间</span>
              <span className="text-sm text-gray-700">{formatDateTime(orderDetail.createdTime)}</span>
            </div>
            
            {orderDetail.paymentTime && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">付款时间</span>
                <span className="text-sm text-gray-700">{formatDateTime(orderDetail.paymentTime)}</span>
              </div>
            )}
            
            {orderDetail.deliveryTime && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">交付时间</span>
                <span className="text-sm text-gray-700">{formatDateTime(orderDetail.deliveryTime)}</span>
              </div>
            )}
            
            {orderDetail.completionTime && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">完成时间</span>
                <span className="text-sm text-gray-700">{formatDateTime(orderDetail.completionTime)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">租赁时长</span>
              <span className="text-sm text-gray-700">{orderDetail.totalHours}小时</span>
            </div>
          </div>

          {/* 卖家信息 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">卖家昵称</span>
              <span className="text-sm text-gray-700">{orderDetail.sellerName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-4 p-4 flex justify-around bg-white border-t border-gray-200">
        <button 
          onClick={handleContactSeller}
          className="flex flex-col items-center justify-center"
        >
          <MessageOutlined className="h-5 w-5 text-gray-500 mb-1" />
          <span className="text-xs text-gray-500">联系卖家</span>
        </button>
        
        <button 
          onClick={handleViewReview}
          className="flex flex-col items-center justify-center"
        >
          <StarOutlined className="h-5 w-5 text-gray-500 mb-1" />
          <span className="text-xs text-gray-500">查看评价</span>
        </button>
        
        <button 
          onClick={handleBuyAgain}
          className="flex flex-col items-center justify-center"
        >
          <ShoppingCartOutlined className="h-5 w-5 text-gray-500 mb-1" />
          <span className="text-xs text-gray-500">再次购买</span>
        </button>
      </div>
      
      {/* 底部提示 */}
      <div className="px-4 py-3 text-center text-xs text-gray-500">
        <p>租赁账号信息仅供参考，实际以交付为准</p>
        <p className="mt-1">如有问题，请联系客服</p>
      </div>
    </div>
  );
};

export default OrderDetailPage;