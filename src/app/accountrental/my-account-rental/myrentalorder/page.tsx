'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Space, Avatar, Tabs, Modal, Radio, DatePicker, message, ConfigProvider } from 'antd';

import Link from 'next/link';
import { SearchOutlined, CopyOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';



// 后端返回的订单状态类型
type BackendOrderStatus = 'PENDING' | 'PAID' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED' | 'DISPUTED';

// 前端显示的订单状态类型
type OrderStatus = '待支付' | '已支付' | '进行中' | '已完成' | '已取消' | '售后中';

// 租赁信息接口
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

// 订单接口
interface RentalOrder {
  id: string;
  leaseInfoId: string;
  lessorId: string;
  renterId: string;
  orderNo: string;
  rentalDays: number;
  totalAmount: number;
  depositAmount: number;
  platformFee: number;
  lessorIncome: number;
  leaseDays: number;
  renterPay: number;
  status: BackendOrderStatus;
  startTime: string;
  endTime: string;
  actualEndTime: string;
  settled: boolean;
  settleTime: string;
  cancelReason: string;
  disputeReason: string;
  completionNotes: string;
  createTime: string;
  leaseInfo: LeaseInfo;
  lessorName: string;
  renterName: string;
  // 前端使用的额外字段
  imageUrl?: string;
  displayStatus?: OrderStatus;
  displayAccountInfo?: string;
}

// 状态映射关系
const statusMap: Record<BackendOrderStatus, OrderStatus> = {
  'PENDING': '待支付',
  'PAID': '已支付',
  'IN_PROGRESS': '进行中',
  'COMPLETED': '已完成',
  'CANCELED': '已取消',
  'DISPUTED': '售后中'
};

// 获取状态对应的标签颜色
const getStatusTagColor = (status: OrderStatus): string => {
  const statusColors = {
    '待支付': 'orange',
    '已支付': 'blue',
    '进行中': 'green',
    '已完成': 'purple',
    '已取消': 'red',
    '售后中': 'yellow'
  };
  return statusColors[status];
};

// 获取平台对应的图片URL
const getPlatformImageUrl = (platform: string): string => {
  const platformImages: Record<string, string> = {
    'douyin': '/images/douyin-logo.png',
    'xiaohongshu': '/images/xiaohongshu-logo.png',
    'kuaishou': '/images/kuaishou-logo.png'
    // 可以添加更多平台图片映射
  };
  return platformImages[platform.toLowerCase()] || '/images/default.png';
};

const RentalOrderPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('待支付'); // 默认待支付激活
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // 取消订单模态框相关状态
  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  // 租赁成功提示框状态
  const [startLeaseSuccessModalVisible, setStartLeaseSuccessModalVisible] = useState<boolean>(false);
  
  // 预设取消原因选项
  const cancelReasons = [
    { label: '不想要了', value: '不想要了' },
    { label: '其他', value: '其他' }
  ];
  
  // 状态到后端状态的反向映射
  const tabToBackendStatus: Record<string, string> = {
    '待支付': 'PENDING',
    '已支付': 'PAID',
    '进行中': 'IN_PROGRESS',
    '已完成': 'COMPLETED',
    '已取消': 'CANCELED',
    '售后中': 'DISPUTED'
  };
  
  // 调用后端API获取订单数据
  const fetchOrders = async (status: string = 'PENDING') => {
    setLoading(true);
    try {
      const response = await fetch('/api/rental/myrentalorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page: 0,
          size: 20,
          sortField: 'createTime',
          sortOrder: 'DESC',
          status: status
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('请求成功');
        console.log('后端返回的订单数据:', data);
        
        // 检查响应数据格式，支持code为200的情况
        if (data.code === 200 && data.data && data.data.list) {
          // 处理订单数据，添加前端显示需要的字段
          const processedOrders = data.data.list.map((order: RentalOrder) => ({
            ...order,
            displayStatus: statusMap[order.status],
            displayAccountInfo: `${order.leaseInfo.platform} - ${order.leaseInfo.description}`,
            imageUrl: getPlatformImageUrl(order.leaseInfo.platform)
          }));
          
          setOrders(processedOrders);
        }
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      message.error('获取订单失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 页面加载时获取订单数据，默认显示待支付状态
  React.useEffect(() => {
    fetchOrders('PENDING');
  }, []);

  // 选项卡配置
  const tabItems: TabsProps['items'] = [
    { key: '待支付', label: '待支付', children: null },
    { key: '已支付', label: '已支付', children: null },
    { key: '进行中', label: '进行中', children: null },
    { key: '已完成', label: '已完成', children: null },
    { key: '已取消', label: '已取消', children: null },
    { key: '售后', label: '售后', children: null }
  ];

  // 复制订单号功能
  const copyOrderNo = (orderNo: string) => {
    navigator.clipboard.writeText(orderNo).then(() => {
      message.success('订单号已复制');
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
  };

  // 处理选项卡切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // 获取对应的后端状态并调用API
    const backendStatus = tabToBackendStatus[key] || '';
    fetchOrders(backendStatus);
  };

  // 处理筛选按钮点击
  const handleFilterClick = () => {
    setFilterModalVisible(true);
  };

  // 处理筛选确认
  const handleFilterConfirm = () => {
    setFilterModalVisible(false);
    // 实际项目中这里应该根据筛选条件过滤订单
    console.log('应用筛选条件');
  };

  // 处理联系客服
  const handleContactService = (orderId: string) => {
    console.log('联系客服，订单ID:', orderId);
    alert('即将为您连接客服，请稍候...');
  };

  // 处理订单操作
  const handleOrderAction = (orderId: string, action: string) => {
    console.log(`订单 ${orderId} 执行操作: ${action}`);
    if (action === '去支付') {
      alert(`订单 ${orderId} 执行 ${action} 操作`);
    } else if (action === '取消订单') {
      // 显示取消订单模态框
      setSelectedOrderId(orderId);
      setReason('');
      setCancelModalVisible(true);
    }
  };
  
  // 关闭取消订单模态框
  const handleCancelModalClose = () => {
    setCancelModalVisible(false);
    setSelectedOrderId('');
    setReason('');
  };
  
  // 处理开始租赁
  const handleStartLease = async (orderId: string) => {
    setApiLoading(true);
    try {
      const response = await fetch(`/api/rental/startleaseorder?orderId=${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('开始租赁API返回数据:', data);
        // 检查响应是否成功（根据后端API的返回格式判断）
        if (data.code === 1 || data.code === 200 || data.success) {
          // 显示租赁成功提示框
          setStartLeaseSuccessModalVisible(true);
        } else {
          message.error(data.message || '开始租赁失败');
        }
      } else {
        message.error('网络请求失败，请稍后重试');
      }
    } catch (error) {
      console.error('开始租赁失败:', error);
      message.error('开始租赁失败，请稍后重试');
    } finally {
      setApiLoading(false);
    }
  };

  // 确认取消订单
  const handleConfirmCancelOrder = async () => {
    if (!selectedOrderId || !reason) {
      message.warning('请选择取消原因');
      return;
    }
    
    setApiLoading(true);
    try {
      const response = await fetch('/api/rental/cancelleaseorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: selectedOrderId,
          reason: reason
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if ((data.code === 1 || data.code === 200)) {
          message.success('订单已成功取消');
          handleCancelModalClose();
          // 重新获取当前标签页的订单数据
          const backendStatus = tabToBackendStatus[activeTab] || '';
          fetchOrders(backendStatus);
        } else {
          message.error(data.message || '取消订单失败');
        }
      } else {
        message.error('网络请求失败，请稍后重试');
      }
    } catch (error) {
      console.error('取消订单失败:', error);
      message.error('取消订单失败，请稍后重试');
    } finally {
      setApiLoading(false);
    }
  };

  // 由于现在是通过API直接获取对应状态的订单，不需要前端过滤
  const filteredOrders = orders;

  return (
    <div className="min-h-screen pt-3">
      {/* 选项卡区域 - 包含状态选项和筛选按钮 */}
      <div className="flex flex-row mb-2 items-center">
        {/* 左侧选项按钮区域 - 90%宽度，支持左右滑动 */}
        <div className="w-[88%]">
          <div 
            className="flex overflow-x-auto whitespace-nowrap" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).scrollLeft += e.deltaY;
              }
            }}
          >
            <style jsx global>{`
              .custom-tabs-container::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {tabItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`px-2 py-1 mr-1 text-sm transition-all ${item.key === activeTab
                  ? 'bg-[#ffebeb] border border-[#ff8080]'
                  : 'bg-white border border-transparent hover:border-gray-200'}`}
                style={{
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 右侧筛选按钮区域 - 10%宽度，垂直居中 */}
        <div className="w-[12%] flex">
          <button 
            onClick={handleFilterClick} 
            className="text-sm text-blue-500 text-center"
            style={{
              fontSize: '14px',
              outline: 'none'
            }}
          >
            筛选
          </button>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="">
        {filteredOrders.map((order) => (
            <Link href={`/accountrental/my-account-rental/myrentalorder/myrentalorder-detail/${order.id}`} key={order.id}>
              <Card className="rounded-md mb-3 hover:shadow-md">
                {/* 订单头部信息 */}
                <div className="">
                  <div className="flex items-center space-y-1">
                    <span className="text-sm text-black whitespace-nowrap overflow-hidden text-ellipsis">订单号：{order.orderNo}</span>
                    <Button 
                      type="text" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        copyOrderNo(order.orderNo);
                      }}
                      size="small"
                      className="ml-1 text-blue-500"   
                    >
                      复制
                    </Button>
                  </div>
                  <span className="text-sm text-red-500 border border-red-500 rounded-md px-2 bg-red-50">
                    {order.displayStatus}
                  </span>
                </div>

                {/* 订单详细信息 - 左右结构，同一行显示，垂直居中 */}
                <div className="flex flex-row gap-2 p-1 items-center">
                  {/* 左侧图片区域 */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 overflow-hidden">
                      {order.imageUrl ? (
                        <img 
                          src={order.imageUrl} 
                          alt={order.displayAccountInfo} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Avatar size={40}>{order.displayAccountInfo ? order.displayAccountInfo.charAt(0) : '订'}</Avatar>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 右侧信息区域 */}
                  <div className="flex-1  space-y-1">
                      <div className="text-sm text-black line-clamp-2 overflow-hidden">{order.displayAccountInfo}</div>
                      <div className="text-sm">租赁时长：{order.leaseDays} 天</div>
                      <div className="text-sm">￥{order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
                {/* 按钮区域 */}
                <div className="flex justify-end items-center py-3 px-2">
                  {/* 客服按钮移至右侧 */}
                    <Button
                      type="primary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleContactService(order.id);
                      }}
                      size="small"
                      className="text-white mr-2"
                    >
                      客服
                    </Button>

                  <Space>
                    {/* 根据订单状态显示不同按钮 */}
                    {order.displayStatus === '待支付' && (
                      <>
   
                      </>
                    )}
                    {order.displayStatus === '已支付' && (
                      <Button
                        type="primary"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleStartLease(order.id);
                        }}
                        size="small"
                      >
                        开始租赁
                      </Button>
                    )}
                  </Space>
                </div>
              </Card>
            </Link>
          ))}

        {/* 如果没有订单 */}
        {filteredOrders.length === 0 && (
          <div className="bg-white p-8 text-center">
            <p className="text-sm text-black">暂无出租订单</p>
          </div>
        )}
      </div>

      {/* 筛选弹窗 */}
        <Modal
          title="订单筛选"
          open={filterModalVisible}
          onOk={handleFilterConfirm}
          onCancel={() => setFilterModalVisible(false)}
          footer={[
            <Button key="reset" onClick={() => console.log('重置筛选条件')} size="small">
              重置
            </Button>,
            <Button key="confirm" type="primary" onClick={handleFilterConfirm} size="small">
              确定
            </Button>
          ]}
        >
          <ConfigProvider>
            <div>
              <div>
                <h4 className="text-sm text-black mb-2">时间区间</h4>
                <Radio.Group className="w-full">
                  <Space direction="vertical" className="w-full">
                    <Radio value="1">1个月内</Radio>
                    <Radio value="3">3个月内</Radio>
                    <Radio value="6">6个月内</Radio>
                  </Space>
                </Radio.Group>
              </div>
              
              <div className="flex items-center gap-4">
                <DatePicker className="flex-1" placeholder="起始时间" />
                <span>-</span>
                <DatePicker className="flex-1" placeholder="终止时间" />
              </div>
            </div>
          </ConfigProvider>
        </Modal>
        
        {/* 取消订单模态框 */}
        <Modal
          title="取消订单"
          open={cancelModalVisible}
          onCancel={handleCancelModalClose}
          footer={[
            <Button key="close" onClick={handleCancelModalClose} size="small" disabled={apiLoading}>
              关闭
            </Button>,
            <Button 
              key="confirm" 
              type="primary" 
              danger 
              onClick={handleConfirmCancelOrder} 
              size="small" 
              loading={apiLoading}
            >
              确认取消订单
            </Button>
          ]}
        >
          <div className="py-2">
            <h4 className="text-sm text-black mb-3">请选择取消原因</h4>
            <Radio.Group 
              className="w-full" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <Space direction="vertical" className="w-full">
                {cancelReasons.map((item) => (
                  <Radio key={item.value} value={item.value}>{item.label}</Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
        </Modal>
        
        {/* 租赁成功提示框 */}
        <Modal
          title="租赁成功"
          open={startLeaseSuccessModalVisible}
          footer={[
            <Button 
              key="confirm" 
              type="primary" 
              onClick={() => {
                // 关闭提示框
                setStartLeaseSuccessModalVisible(false);
                // 切换到进行中选项卡
                handleTabChange('进行中');
              }} 
              size="small"
            >
              确认
            </Button>
          ]}
          closable={false} // 禁用右上角关闭按钮
        >
          <div className="py-2">
            <p className="text-center text-black">订单开始租赁成功！</p>
          </div>
        </Modal>
    </div>
  );
};

export default RentalOrderPage;