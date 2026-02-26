'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Space, Modal, Radio, DatePicker, message, ConfigProvider } from 'antd';

import Link from 'next/link';
import { RentalOrderItem, MySellerRentalOrderListResponse } from '@/app/types/rental/order/mySellerRentalOrderListTypes';

// 订单状态映射
const statusMap: Record<number, string> = {
  1: '已支付',
  2: '进行中',
  3: '已完成',
  4: '已取消'
};

// 选项卡状态到后端status的映射
const tabToStatus: Record<string, number | null> = {
  '已支付': 1,
  '进行中': 2,
  '已完成': 3,
  '已取消': 4,
  '全部': null
};

const RentalOrderPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('全部'); // 默认显示全部订单
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [orders, setOrders] = useState<RentalOrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [allOrders, setAllOrders] = useState<RentalOrderItem[]>([]);

  // 选项卡配置
  const tabItems = [
    { key: '全部', label: '全部', children: null },
    { key: '已支付', label: '已支付', children: null },
    { key: '进行中', label: '进行中', children: null },
    { key: '已完成', label: '已完成', children: null },
    { key: '已取消', label: '已取消', children: null }
  ];

  // 复制订单号功能
  const copyOrderNo = (orderNo: string) => {
    navigator.clipboard.writeText(orderNo).then(() => {
      message.success('订单号已复制');
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
  };

  // 调用后端API获取订单数据
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rental/order/mySellerRentalOrderList?my=0', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: MySellerRentalOrderListResponse = await response.json();
        console.log('获取订单列表响应:', data);
        
        // 检查响应数据格式
        if (data.success===true && data.data) {
          setAllOrders(data.data.list || []);
          setOrders(data.data.list || []);
        }
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      message.error('获取订单失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 页面加载时获取订单数据
  useEffect(() => {
    fetchOrders();
  }, []);

  // 处理选项卡切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    
    // 根据选中的选项卡过滤订单
    const status = tabToStatus[key];
    if (status === null) {
      // 显示全部订单
      setOrders(allOrders);
    } else {
      // 显示对应状态的订单
      const filtered = allOrders.filter(order => order.status === status);
      setOrders(filtered);
    }
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
  const handleContactService = (orderId: number) => {
    console.log('联系客服，订单ID:', orderId);
    alert('即将为您连接客服，请稍候...');
  };

  return (
    <div className=" bg-gray-100 pb-10">
      {/* 选项卡区域 */}
      <div 
        className="flex gap-4 overflow-x-auto h-12 mt-2 tab-container bg-white"
        style={{ 
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE and Edge */
          WebkitOverflowScrolling: 'touch' /* iOS */
        }}
      >
        {/* 隐藏滚动条的样式 */}
        <style jsx global>{`
          .tab-container::-webkit-scrollbar {
            display: none; /* Chrome, Safari and Opera */
          }
        `}</style>
        {tabItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleTabChange(item.key)}
            className={`py-2 px-3 whitespace-nowrap relative ${activeTab === item.key ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
          >
            {item.label}
            {activeTab === item.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        ))}
      </div>

      {/* 卡片列表 */}
      <div className="p-4">
        {/* 移动端布局 */}
        <div className="md:hidden ">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">加载中...</p>
            </div>
          ) : orders.map((order) => (
            <div key={order.id} className="bg-white shadow-sm mb-2 p-2 ">
              <Link href={`/rental/my/mysellerrentalorder/detail/${order.id}`}>
                <div className="flex space-x-4 ">
                  {/* 左侧图片 */}
                  <div className="w-1/3 ">
                    <div className="bg-gray-100 overflow-hidden w-full max-h-[130px]">
                      {order.seller_info_json.images && order.seller_info_json.images.length > 0 && (
                        <img 
                          src={order.seller_info_json.images[0]} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  {/* 右侧内容 */}
                  <div className="w-2/3 overflow-hidden">
                    {/* 标题 */}
                    <h2 className="text-xl font-semibold line-clamp-1">{order.order_json.offer_title}</h2>
                    <p className="text-md text-gray-500 line-clamp-1 mb-1">{order.seller_info_json.account_info}</p>
                    <p className="text-sm text-gray-500 mb-1 line-clamp-1 space-x-3">
                      <span className={`text-xs px-2 py-1 bg-green-100 text-green-600 rounded-lg`}>
                        {order.status_text || statusMap[order.status]}
                      </span>
                      <span className='px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg'>{order.allow_renew === 1 ? '续租' : '不续租'}</span>
                      <span>租期:{order.days} 天</span>
                    </p>
                    {/* 标签横排 */}
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const tags = [];
                        const sellerInfo = order.seller_info_json || {};
                        
                        // 账号要求标签
                        // 账号要求标签
                        if (sellerInfo.basic_information === 'true') tags.push('修改基本信息');
                        if (sellerInfo.deblocking === 'true') tags.push('账号解禁');
                        if (sellerInfo.identity_verification === 'true') tags.push('实名认证');
                        if (sellerInfo.post_douyin === 'true') tags.push('发布抖音视频');
                        if (sellerInfo.order_requirements === 'true') tags.push('其他');
                        
                        // 登录方式标签
                        if (sellerInfo.scan_code === 'true') tags.push('扫码登录');
                        if (sellerInfo.phone_message === 'true') tags.push('短信验证');
                        if (sellerInfo.requested_all === 'true') tags.push('按租赁方要求');
                        
                        // 最多显示3个标签
                        return tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-lg">
                            {tag}
                          </span>
                        ));
                      })()}
                    </div>
                    {/* 按钮 - 右对齐 */}
                    <div className="flex gap-2 mt-1 justify-between items-center">
                      <span className='text-red-600 text-xl font-bold'>￥{order.total_amount_yuan}</span>
                      <button 
                        className="text-sm border border-gray-400 rounded-sm px-3 py-0.5"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleContactService(order.id);
                        }}
                      >
                        联系客服
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        {/* PC端布局 */}
        <div className="hidden md:block">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">加载中...</p>
              </div>
            ) : orders.map((order) => (
              <div key={order.id} className="bg-white p-4 shadow-sm">
                <Link href={`/rental/my/mysellerrentalorder/detail/${order.id}`}>
                  {/* 图片 - 位于上面 */}
                  <div className="mb-4">
                    <div className="bg-gray-100 overflow-hidden h-48">
                      {order.seller_info_json.images && order.seller_info_json.images.length > 0 && (
                        <img 
                          src={order.seller_info_json.images[0]} 
                          alt="订单截图" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  {/* 标题 */}
                  <h2 className="text-xl font-semibold line-clamp-1">{order.order_json.offer_title}</h2>
                    <p className="text-md text-gray-500 line-clamp-1 mb-1">{order.seller_info_json.account_info}</p>
                    <p className="text-sm text-gray-500 mb-1 line-clamp-1 space-x-3">
                      <span className={`text-xs px-2 py-1 bg-green-100 text-green-600 rounded-lg`}>
                        {order.status_text || statusMap[order.status]}
                      </span>
                      <span className='px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg'>{order.allow_renew === 1 ? '续租' : '不续租'}</span>
                      <span>租期:{order.days} 天</span>
                    </p>
                  {/* 标签横排 */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(() => {
                      const tags = [];
                      const sellerInfo = order.seller_info_json || {};
                      
                      // 账号要求标签
                        if (sellerInfo.basic_information === 'true') tags.push('修改基本信息');
                        if (sellerInfo.deblocking === 'true') tags.push('账号解禁');
                        if (sellerInfo.identity_verification === 'true') tags.push('实名认证');
                        if (sellerInfo.post_douyin === 'true') tags.push('发布抖音视频');
                        if (sellerInfo.order_requirements === 'true') tags.push('其他');
                        
                        // 登录方式标签
                        if (sellerInfo.scan_code === 'true') tags.push('扫码登录');
                        if (sellerInfo.phone_message === 'true') tags.push('短信验证');
                        if (sellerInfo.requested_all === 'true') tags.push('按租赁方要求');
                      
                      // 最多显示3个标签
                      return tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-lg">
                          {tag}
                        </span>
                      ));
                    })()}
                  </div>
                  {/* 按钮 - 右对齐 */}
                    <div className="flex gap-2 mt-1 justify-between items-center">
                      <span className='text-red-600 text-xl font-bold'>￥{order.total_amount_yuan}</span>
                      <button 
                        className="text-sm border border-gray-400 rounded-sm px-3 py-0.5"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleContactService(order.id);
                        }}
                      >
                        联系客服
                      </button>
                    </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* 如果没有订单 */}
        {!loading && orders.length === 0 && (
          <div className="bg-white p-8 text-center">
            <p className="text-sm text-black">暂无出租订单</p>
          </div>
        )}
      </div>

     
    </div>
  );
};

export default RentalOrderPage;