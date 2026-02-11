'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Space, Modal, Radio, DatePicker, message, ConfigProvider } from 'antd';

import Link from 'next/link';
import { RentalOrderItem, MyBuysRentalOrderListResponse } from '@/app/types/rental/order/myBuysRentalOrderListTypes';

// 订单状态映射
const statusMap: Record<number, string> = {
  0: '待支付',
  1: '已支付待客服',
  2: '进行中',
  3: '已完成',
  4: '已取消'
};

// 选项卡状态到后端status的映射
const tabToStatus: Record<string, number | null> = {
  '待支付': 0,
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
    { key: '待支付', label: '待支付', children: null },
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
      const response = await fetch('/api/rental/order/myBuysRentalOrderList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: MyBuysRentalOrderListResponse = await response.json();
        
        // 检查响应数据格式
        if (data.code === 0 && data.data) {
          setAllOrders(data.data.list);
          setOrders(data.data.list);
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
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">加载中...</p>
          </div>
        ) : orders.map((order) => (
            <Link href={`/rental/my/mybuysrentedorder/detail/${order.id}`} key={order.id}>
              <Card className="rounded-md mb-3 hover:shadow-md">
                {/* 订单头部信息 */}
                <div className="">
                  {/* 标题和状态在同一行显示 */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-medium text-gray-800">{order.order_json.demand_title}</h2>
                    <span className="text-sm text-red-500">
                      {order.status_text || statusMap[order.status]}
                    </span>
                  </div>
                </div>

                {/* 订单详细信息 - 左右结构，同一行显示，垂直居中 */}
                <div className="flex flex-row gap-2 p-1 items-center">
                  {/* 左侧图片区域 */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        {order.seller_info_json.screenshots && order.seller_info_json.screenshots.length > 0 && (
                          <img 
                            src={order.seller_info_json.screenshots[0]} 
                            alt="订单截图" 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 右侧信息区域 */}
                  <div className="flex-1  space-y-1">
                      <div className="flex justify-between items-center">
                        <h2 className="text-sm font-medium ">租赁时长：{order.days} 天</h2>
                        <span className="text-sm text-red-500">
                          租金：{order.total_amount_yuan}
                        </span>
                      </div>
                      <div>
                        <ul className=''>
                          <li className=''>
                            联系方式：
                           
                          </li>

                          <li className=''>账号要求：
                            <p>{order.buyer_info_json.other_requirements}</p>
                            <p>{order.buyer_info_json.deblocking}</p>
                            <p>{order.buyer_info_json.login_requirements}</p>
                          </li>
                        </ul>
                      </div>
                  </div>
                </div>
                {/* 按钮区域 */}
                <div className="flex justify-end items-center">
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
                </div>
              </Card>
            </Link>
          ))}

        {/* 如果没有订单 */}
        {!loading && orders.length === 0 && (
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
    </div>
  );
};

export default RentalOrderPage;