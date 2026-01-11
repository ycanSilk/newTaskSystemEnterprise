'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Space, Avatar, Tabs, Modal, Radio, DatePicker, message } from 'antd';
import Link from 'next/link';
import { CopyOutlined } from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');
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
  minRentalDays: number;
  maxRentalDays: number;
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
  leaseDays: number;
  totalAmount: number;
  depositAmount: number;
  platformFee: number;
  lessorIncome: number;
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
  return platformImages[platform.toLowerCase()] || '/images/0e92a4599d02a7.jpg';
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
  // 支付状态管理
  const [payLoading, setPayLoading] = useState<boolean>(false);
  // 支付成功确认对话框状态
  const [paySuccessModalVisible, setPaySuccessModalVisible] = useState<boolean>(false);
  
  // 申请售后相关状态
  const [disputeModalVisible, setDisputeModalVisible] = useState<boolean>(false);
  const [selectedDisputeOrderId, setSelectedDisputeOrderId] = useState<string>('');
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [disputeNotes, setDisputeNotes] = useState<string>('');
  const [disputeLoading, setDisputeLoading] = useState<boolean>(false);
  const [disputeSuccessModalVisible, setDisputeSuccessModalVisible] = useState<boolean>(false);
  
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
    '售后': 'DISPUTED'
  };

  // 调用后端API获取订单数据
  const fetchOrders = async (status: string = 'PENDING') => {
    setLoading(true);
    try {
      const response = await fetch('/api/rental/myrentedorder', {
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
        
        // 检查响应数据格式，支持code为1或200的情况
        if ((data.code === 1 || data.code === 200) && data.data && data.data.list) {
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
      console.error('获取订单失败，请稍后重试');
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

  // 打开取消订单模态框
  const handleCancelOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setReason('');
    setCancelModalVisible(true);
  };

  // 取消订单模态框
  const handleCancelModalClose = () => {
    setCancelModalVisible(false);
    setSelectedOrderId('');
    setReason('');
  };

  // 处理支付成功确认
  const handlePaySuccessConfirm = () => {
    // 关闭对话框
    setPaySuccessModalVisible(false);
    // 跳转到已支付选项卡
    handleTabChange('已支付');
  };

  // 处理支付成功对话框关闭（如果用户点击右上角关闭按钮）
  const handlePaySuccessModalClose = () => {
    setPaySuccessModalVisible(false);
  };
  
  // 打开申请售后模态框
  const handleDisputeOrderClick = (orderId: string) => {
    setSelectedDisputeOrderId(orderId);
    setDisputeReason('');
    setDisputeNotes('');
    setDisputeModalVisible(true);
  };
  
  // 关闭申请售后模态框
  const handleDisputeModalClose = () => {
    setDisputeModalVisible(false);
    setSelectedDisputeOrderId('');
    setDisputeReason('');
    setDisputeNotes('');
  };
  
  // 提交申请售后请求
  const handleSubmitDisputeOrder = async (orderId: string) => {
    if (!disputeReason) {
      message.warning('请选择售后原因');
      return;
    }

    setDisputeLoading(true);
    try {
      // 构建请求体
      const requestBody = {
        reason: disputeReason,
        notes: disputeNotes || ''
      };
      
      // 调用后端API
      const response = await fetch(`/api/rental/disputeorder?orderId=${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      console.log('orderId:', orderId);
      console.log('申请售后请求体:', requestBody);

      const result = await response.json();
      if (response.ok && result.success) {
        message.success('申请售后成功');
        handleDisputeModalClose();
        // 显示成功提示框
        setDisputeSuccessModalVisible(true);
      } else {
        message.error(result.message || '申请售后失败');
      }
    } catch (error) {
      console.error('申请售后失败:', error);
      message.error('申请售后失败，请稍后重试');
    } finally {
      setDisputeLoading(false);
    }
  };
  
  // 处理申请售后成功确认
  const handleDisputeSuccessConfirm = () => {
    // 关闭对话框
    setDisputeSuccessModalVisible(false);
    // 跳转到售后选项卡
    handleTabChange('售后');
  };

  // 提交取消订单请求
  const handleSubmitCancelOrder = async () => {
    if (!reason) {
      message.warning('请选择取消原因');
      return;
    }

    setApiLoading(true);
    try {
      // 与forrentorder页面相同的API调用实现
      const response = await fetch('/api/rental/cancelleaseorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrderId,
          reason: reason
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        message.success('订单取消成功');
        handleCancelModalClose();
        // 重新获取订单列表
        fetchOrders();
      } else {
        message.error(result.message || '取消订单失败');
      }
    } catch (error) {
      console.error('取消订单失败:', error);
      message.error('取消订单失败，请稍后重试');
    } finally {
      setApiLoading(false);
    }
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
    alert(`订单 ${orderId} 执行 ${action} 操作`);
  };

  // 处理支付订单
  const handlePayOrder = async (orderId: string) => {
    // 防止重复提交
    if (payLoading) return;
    
    setPayLoading(true);
    try {
      // 调用支付API，将orderId作为URL路径参数传递
      const response = await fetch(`/api/rental/paymentleaseorder?orderId=${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
        // 不再发送body
      });
      console.log('请求后端url:/api/rental/paymentleaseorder和传递订单id', orderId);
      console.log('支付响应:', response);

      const result = await response.json();
      
      if (response.ok && result.success) {
        // 支付成功，显示确认对话框而不是直接切换标签页
        setPaySuccessModalVisible(true);
      } else {
        // 支付失败
        message.error(result.message || '支付失败，请稍后重试');
      }
    } catch (error) {
      // 网络错误或其他异常
      console.error('支付请求失败:', error);
      message.error('网络错误，请检查网络连接后重试');
    } finally {
      setPayLoading(false);
    }
  };

  // 由于现在是通过API直接获取对应状态的订单，不需要前端过滤
  const filteredOrders = orders;

  return (
    <div className="min-h-screen bg-gray-100 px-3 pt-8">
      {/* 选项卡区域 - 包含状态选项和筛选按钮 */}
      <div className="flex flex-row mb-2 items-center">
        {/* 左侧选项按钮区域 - 90%宽度，支持左右滑动 */}
        <div className="w-[90%] p-2">
          <div 
            className="flex overflow-x-auto whitespace-nowrap pb-2 custom-tabs-container"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).scrollLeft += e.deltaY;
              }
            }}
          >
            <style jsx global>{
              `.custom-tabs-container::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {tabItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`px-2 py-1 mr-2 text-sm transition-all whitespace-nowrap ${item.key === activeTab
                  ? 'bg-[#ffebeb] border border-[#ff8080]'
                  : 'bg-white border border-transparent hover:border-gray-200'}`}
                style={{
                  fontSize: '14px',
                  outline: 'none',
                  minWidth: '60px', // 确保按钮在小屏幕上有足够的宽度
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 右侧筛选按钮区域 - 10%宽度，垂直居中 */}
        <div className="w-[10%] flex items-center justify-center">
          <button 
            onClick={handleFilterClick} 
            className="text-sm text-blue-500 text-center p-1 pb-2 whitespace-nowrap"
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
            <Link href={`/accountrental/my-account-rental/myrentedorder/myrentedorder-detail/${order.id}`} key={order.id} className="block">
                <Card className="border-0 rounded-none mb-3 cursor-pointer hover:shadow-md transition-shadow">
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
                  <div className="flex-1 space-y-1">
                      <div className="text-sm text-black line-clamp-2 overflow-hidden">{order.displayAccountInfo}</div>
                      <div className="text-sm">租赁时长：{order.leaseDays} 天</div>
                      <div className="text-sm">￥{order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
                {/* 按钮区域 */}
                <div className="flex justify-end items-center mt-1">
                  <Space>
                    <Button
                      type="default"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleContactService(order.id);
                      }}
                      size="small"
                      className="whitespace-nowrap bg-blue-600 text-white"
                    >
                      客服
                    </Button>
                    
                    {/* 根据订单状态显示不同按钮 */}
                    {order.status === 'PENDING' && (
                      <>
                        <Button 
                          type="primary" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePayOrder(order.id);
                          }} 
                          size="small"
                          className="whitespace-nowrap"
                          loading={payLoading}
                          disabled={payLoading}
                        >
                          立即付款
                        </Button>
                        <Button
                          danger
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCancelOrderClick(order.id);
                          }}
                          size="small"
                          className="whitespace-nowrap bg-red-500 text-white"
                        >
                          取消订单
                        </Button>
                      </>
                    )}

                    {order.status === 'IN_PROGRESS' && (
                      <>
                        <Button
                          danger
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDisputeOrderClick(order.id);
                          }}
                          size="small"
                          className="whitespace-nowrap"
                        >
                          申请售后
                        </Button>
                      </>
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

      {/* 筛选弹窗 - 设置宽度适应移动端 */}
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
        width={320} // 移动端弹窗宽度
        centered
      >
        <ConfigProvider locale={zhCN}>
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
            
            <div className="flex items-center gap-2 mt-4">
              <DatePicker className="flex-1" placeholder="起始时间" size="small" />
              <span>-</span>
              <DatePicker className="flex-1" placeholder="终止时间" size="small" />
            </div>
          </div>
        </ConfigProvider>
      </Modal>

      {/* 支付成功确认对话框 */}
      <Modal
        title="支付成功"
        open={paySuccessModalVisible}
        onCancel={handlePaySuccessModalClose}
        footer={[
          <Button 
            key="confirm" 
            type="primary" 
            onClick={handlePaySuccessConfirm}
          >
            确认
          </Button>,
        ]}
        closable={false} // 禁用右上角关闭按钮，强制用户点击确认
        centered
      >
      </Modal>

      {/* 申请售后模态框 */}
      <Modal
        title="申请售后"
        open={disputeModalVisible}
        onCancel={handleDisputeModalClose}
        footer={[
          <Button 
            key="cancel" 
            onClick={handleDisputeModalClose}
            disabled={disputeLoading}
          >
            取消
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            onClick={() => handleSubmitDisputeOrder(selectedDisputeOrderId)}
            loading={disputeLoading}
            disabled={disputeLoading || !disputeReason}
          >
            确认
          </Button>,
        ]}
        width={320} // 移动端弹窗宽度
        centered
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">售后原因</label>
          <select
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ height: 'auto' }}
          >
            <option value="">请选择售后原因</option>
            <option value="账号无法登陆、登陆异常">账号无法登陆、登陆异常</option>
            <option value="账号被平台封禁">账号被平台封禁</option>
            <option value="不能发布视频和评论">不能发布视频和评论</option>
            <option value="不能修改账号信息">不能修改账号信息</option>
            <option value="不想租号了">不想租号了</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
          <textarea
            value={disputeNotes}
            onChange={(e) => setDisputeNotes(e.target.value)}
            placeholder="请输入详细描述（最多200字）"
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            disabled={disputeLoading}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {disputeNotes.length}/200
          </div>
        </div>
      </Modal>

      {/* 申请售后成功提示框 */}
      <Modal
        title="申请成功"
        open={disputeSuccessModalVisible}
        footer={[
          <Button 
            key="confirm" 
            type="primary" 
            onClick={handleDisputeSuccessConfirm}
          >
            确认
          </Button>,
        ]}
        closable={false} // 禁用右上角关闭按钮，强制用户点击确认
        centered
      >
          <div className="text-center py-4">
            <p>订单开始租赁成功</p>
            <p className="text-gray-500 text-sm mt-2">点击确认按钮查看售后订单</p>
          </div>
      </Modal>

      {/* 取消订单模态框 */}
      <Modal
        title="取消订单"
        open={cancelModalVisible}
        onCancel={handleCancelModalClose}
        footer={[
          <Button key="cancel" onClick={handleCancelModalClose}>
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={apiLoading}
            onClick={handleSubmitCancelOrder}
          >
            确认取消
          </Button>,
        ]}
      >
        <div style={{ marginBottom: '16px' }}>
          <p style={{ marginBottom: '12px' }}>请选择取消订单原因：</p>
          <Radio.Group value={reason} onChange={(e) => setReason(e.target.value)}>
            <Space direction="vertical">
              {cancelReasons.map((item) => (
                <Radio key={item.value} value={item.value}>
                  {item.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>
        <p style={{ color: '#ff4d4f', fontSize: '14px' }}>* 请谨慎操作，订单取消后无法恢复</p>
      </Modal>
    </div>
  );
};

export default RentalOrderPage;