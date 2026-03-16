'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Space, Avatar, message, Modal } from 'antd';
import { PhoneOutlined, CopyOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import type { RentalOrderDetail } from '@/types';

// 定义租赁信息类型
interface LeaseInfo {
  id: string;
  userId: string;
  accountType: string;
  accountLevel: string;
  platform: string;
  description: string;
  pricePerDay: number;
  depositAmount: number;
  minLeaseDays: number;
  maxLeaseDays: number;
  status: string;
  totalOrders: number;
  completedOrders: number;
  successRate: number;
  createTime: string;
}

// 定义订单数据类型
interface OrderData {
  id: string;
  leaseInfoId: string;
  lessorId: string;
  renterId: string;
  orderNo: string;
  leaseDays: number;
  totalAmount: number;
  depositAmount: number;
  platformFee: number;
  lessorIncome: number;
  renterPay: number;
  status: string;
  startTime: string;
  endTime: string;
  actualEndTime: string | null;
  settled: boolean;
  settleTime: string | null;
  cancelReason: string | null;
  disputeReason: string | null;
  completionNotes: string | null;
  createTime: string;
  leaseInfo: LeaseInfo;
  lessorName: string | null;
  renterName: string | null;
}

// 定义API响应类型
interface RentalOrderResponse {
  code: number;
  message: string;
  data: OrderData;
  success: boolean;
  timestamp: number;
}

const RentalOrderDetailPage = () => {

  // 订单详情状态，初始化为null
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 图片列表状态 - 将从API获取
  const [imageList, setImageList] = useState<string[]>([]);
  
  // 图片预览状态
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  
// 获取URL参数中的id
  const params = useParams<{ id: string }>();
  const id = params?.id || '';

  // 获取求租信息详情
  useEffect(() => {
    const fetchRentalRequestDetail = async (): Promise<void> => {
      if (!id) {
        console.log('缺少订单ID');
        setLoading(false);  
        return;
      }
      console.log('订单ID:', id);
      try {
        setLoading(true);
        const response = await fetch(`/api/rental/getorderdetail?orderRequestId=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data: RentalOrderResponse = await response.json();
        console.log('返回的原始数据', data);
        if (data.success && data.code === 200) {
          setOrderDetail(data.data);
          // 设置默认图片列表（由于API没有提供图片，暂时使用模拟数据）
          setImageList([
            '/images/1758380776810_96.jpg',
            '/images/1758384598887_578.jpg',
            '/images/1758596791656_544.jpg'
          ]);
        } else {
          message.error(data.message || '获取订单详情失败');
        }
      } catch (error) {
        console.error('获取订单详情失败:', error);
        message.error('获取订单详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRentalRequestDetail();
  }, [id]);

  
  
  // 获取订单状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '已完成订单';
      case 'PENDING':
        return '待支付订单';
      case 'PAID':
        return '已支付订单';
      case 'IN_PROGRESS':
        return '进行中订单';
      case 'CANCELED':
        return '已取消订单';
      case 'DISPUTED':
        return '售后中订单';
      default:
        return '未知状态';
    }
  };

  // 复制订单号
  const handleCopyOrderNumber = async () => {
    if (!orderDetail) return;
    
    try {
      await navigator.clipboard.writeText(orderDetail.orderNo);
      message.success('订单号已复制');
    } catch (err) {
      message.error('复制失败');
    }
  };

  // 联系客服
  const handleContactService = () => {
    message.info('正在连接客服...');
  };


  
  // 处理图片点击查看大图
  const handleImageClick = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">无法获取订单详情</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* 订单状态标题 */}
      <div className="p-3 bg-white">
        <h2 className="text-xl">{getStatusText(orderDetail.status)}</h2>
      </div>

      {/* 内容区域 */}
      <div className="max-w-2xl mx-auto p-3">
        {/* 订单描述和图片 */}
        <Card className="mb-4 border-0 shadow-sm">
          <div className="">

              <div className="">详情信息：{orderDetail.leaseInfo?.description || '暂无描述'}</div>
              <div className="grid grid-cols-1">
                <div>账号类型：{orderDetail.leaseInfo?.platform === 'DOUYIN' ? '抖音' : orderDetail.leaseInfo?.platform || '未知'}</div>
                <div>租赁时长：{orderDetail.leaseDays} 天</div>
              </div>
          

            {/* 图片展示区域 */}
            <div>
              <h4 className='mb-1'>账号预览</h4>
              <div className="flex flex-wrap gap-3">
                {imageList.map((imageUrl, index) => (
                  <div 
                    key={index} 
                    className="w-20 h-20 bg-gray-100 overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(imageUrl)}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`账号预览图 ${index + 1}`} 
                      className="w-full h-full object-cover" 
                      style={{ width: '85px', height: '85px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* 订单信息 */}
        <Card className="mb-4 border-0 shadow-sm">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="">实付金额</span>
              <span className="text-lg font-medium text-black">¥{orderDetail.totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="">订单编号</span>
              <div className="flex items-center gap-2">
                <span>{orderDetail.orderNo}</span>
                <Button 
                  type="text" 
                  size="small" 
                  onClick={handleCopyOrderNumber}
                  className=" text-blue-500 items-right"
                >
                  复制
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="">平台服务费</span>
              <span>¥{orderDetail.platformFee.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="">租赁开始时间</span>
              <span>{orderDetail.startTime}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="">租赁结束时间</span>
              <span>{orderDetail.endTime}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="">下单时间</span>
              <span>{orderDetail.createTime}</span>
            </div>
            
            {orderDetail.status === 'CANCELED' && orderDetail.cancelReason && (
              <div className="flex justify-between items-center">
                <span className="">取消原因</span>
                <span>{orderDetail.cancelReason}</span>
              </div>
            )}
          </div>
        </Card>

        {/* 底部按钮 */}
        <div className="flex justify-center py-4">
          <Button
            type="default"
            icon={<PhoneOutlined />}
            onClick={handleContactService}
            style={{ borderColor: '#000' }}
          >
            联系客服
          </Button>
        </div>
      </div>
      
      {/* 图片预览Modal */}
      <Modal
        title="图片预览"
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <img 
          src={previewImage} 
          alt="预览图片" 
          className="w-full h-auto max-h-[70vh] object-contain" 
        />
      </Modal>
    </div>
  );
};

export default RentalOrderDetailPage;