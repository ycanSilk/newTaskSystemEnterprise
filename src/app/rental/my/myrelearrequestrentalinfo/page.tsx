'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Space, Modal, Radio, DatePicker, message } from 'antd';
import Link from 'next/link';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { TabsProps } from 'antd';
import {RentalRequest,  statusTextMap, statusToTabKeyMap, GetRequestRentalMarketListResponse, RentalRequestStatus} from '@/app/rental/types/rental/myrelearrequestrentalinfoTypes';

// 导入API客户端


const RentalOfferPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('ALL'); // 默认激活"全部"选项卡
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rentalOffers, setRentalOffers] = useState<RentalRequest[]>([]); // 存储API返回的求租信息

  // 获取求租信息列表
  const fetchRentalOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      // 构建URL，添加查询参数my=1
      const apiUrl = '/api/rental/requestRental/getRequestRentalMarketList?my=1';
      
      console.log('发送API请求:', apiUrl);
      
      const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      
      if (!response.ok) {
        throw new Error('网络请求失败');
      }
      
      const data = await response.json();
      console.log('API响应数据:', data);
      console.log('响应结果：', data.code);
      console.log('要设置的数据', data.data?.list);
      
      if (data.code === 0) {
        const offers = data.data?.list || [];
        console.log('判断data.code===0为true;要设置的数据', offers);
        setRentalOffers(offers);
      } else {
        setError(data.message || '获取出租信息失败');
      }
    } catch (err) {
      setError('获取出租信息失败，请稍后重试');
      console.error('获取出租信息失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取出租信息
  useEffect(() => {
    fetchRentalOffers();
  }, []);

  // 选项卡配置 - 确保顺序正确，默认激活第一个(全部)
  const tabItems: TabsProps['items'] = [
    { key: 'ALL', label: '全部', children: null },
    { key: 'ACTIVE', label: '发布中', children: null },
    { key: 'INACTIVE', label: '已下架', children: null }
  ];

  // 复制出租编号功能
  

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 处理选项卡切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setError(null);
  };

  // 处理筛选按钮点击
  const handleFilterClick = () => {
    setFilterModalVisible(true);
  };

  // 处理筛选确认
  const handleFilterConfirm = () => {
    setFilterModalVisible(false);
    // 更新本地求租信息列表
    console.log('应用筛选条件');
  };
  
  // 处理联系客服
  const handleContactService = (offerId: string) => {
    console.log('联系客服，出租ID:', offerId);
    alert('即将为您连接客服，请稍候...');
  };
  
  // 上下架求租信息
  const toggleOfferStatus = async (offerId: number, status: number) => {
    console.log("点击上下架按钮。传递id:", offerId, "状态:", status);
    try {
      const response = await fetch('/api/rental/requestRental/toggleRequestRentalInfoStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          demand_id: offerId,
          status: status
        })
      });
     
      const data = await response.json();

      console.log('上下架求租信息响应数据:', data);
      
      if (data.code === 0) {
        console.log("状态修改成功", data.data.status_text);
        console.log("状态修改成功", data.data.status);
        message.success({ content: data.data.status_text , style: { top: '30%', fontSize: '18px', padding: '16px 24px' }, duration: 3 });
        // 更新本地求租信息列表
        setRentalOffers(prevOffers => {
          return prevOffers.map(offer => {
            if (offer.id === offerId) {
              return {
                ...offer,
                status: status as RentalRequestStatus,
                status_text: data.data.status_text
              };
            }
            return offer;
          });
        });
      } else {
        message.error({ content: data.message || '状态修改失败', style: { top: '30%', fontSize: '18px', padding: '16px 24px' }, duration: 3 });
      }
    } catch (err) {
      message.error({ content: '状态修改失败，请稍后重试', style: { top: '30%', fontSize: '18px', padding: '16px 24px' }, duration: 3 });
      console.error('上下架求租信息失败:', err);
    }
  };

  // 根据当前选中的选项卡过滤出租信息
  const filteredOffers = rentalOffers.filter(offer => {
    if (activeTab === 'ALL') {
      return true; // 显示所有状态的订单
    } else if (activeTab === 'ACTIVE') {
      return offer.status === 1; // 1表示发布中
    } else if (activeTab === 'INACTIVE') {
      return offer.status === 0 || offer.status === 2; // 0表示已下架，2表示已封禁
    }
    return true;
  });

  // 辅助函数：渲染求租列表
  const renderRentalList = () => {
    if (loading) {
      return (
        <div className="bg-white p-8 text-center">
          <p className="text-sm text-black">正在加载数据，请稍候...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white p-8 text-center">
          <p className="text-sm text-red-500 mb-4">{error}</p>
        </div>
      );
    }

    if (filteredOffers.length === 0) {
      return (
        <div className="bg-white p-8 text-center">
          <p className="text-sm text-gray-500">暂无{activeTab === 'ALL' ? '求租' : (activeTab === 'ACTIVE' ? '发布中' : '已下架')}的求租信息</p>
          {activeTab !== 'ACTIVE' && (
            <Button 
              type="default" 
              onClick={() => setActiveTab('ACTIVE')} 
              size="small" 
              className="mt-2"
            >
              查看发布中的求租信息
            </Button>
          )}
        </div>
      );
    }

    return filteredOffers.map((offer) => (
      <Link href={`/accountrental/my-account-rental/rentaloffer/rentaloffer-detail/${offer.id}`} key={offer.id}>
        <Card className="border-0 rounded-none mb-3 cursor-pointer hover:shadow-md transition-shadow">
          {/* 求租头部信息 */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm text-black truncate">{offer.title || '未知标题'}</h2>
            <span className="text-sm text-red-500">{offer.status_text || statusTextMap[offer.status]}</span>
          </div>
          {/* 求租详细信息 - 左右结构，同一行显示，垂直居中 */}
          <div className="flex flex-row gap-2 items-center">
            {/* 左侧图片区域 - 求租信息没有图片，显示占位符 */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gray-100 overflow-hidden">
                {/* 后端返回的JSON中没有图片字段，始终显示默认图片 */}
                <img 
                  src="/images/default.png" 
                  alt="出租信息图片" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

            {/* 右侧求租信息区域 */}
            <div className="flex-1">
                <div className="">{offer.title || '未知标题'}</div>
                <div className="">预算：{offer.budget_amount_yuan} 元</div>
                <div className="">所需天数：{offer.days_needed} 天</div>
                <div className="">截止日期：{offer.deadline_datetime}</div>
            </div>
          </div>
          
          {/* 按钮区域 */}
          <div className="flex justify-end items-center mt-3">
            <Space>
              <Button
                type="default"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleContactService(offer.id.toString());
                }}
                size="small"
                className="text-xs border border-gray-400 text-black p-3"
              >
                联系客服
              </Button>

              {/* 根据状态显示不同按钮 */}
              {offer.status === 1 && (
                <>
                  <Button 
                    type="default" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      alert(`求租 ${offer.id} 执行 编辑求租 操作`);
                    }} 
                    size="small"
                    className="text-xs border border-gray-400 text-black p-3"
                  >
                    编辑求租
                  </Button>                        
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleOfferStatus(offer.id, 0);
                    }}
                    size="small"
                    className="text-xs border border-red-600 text-red-600 p-3"
                  >
                    下架
                  </Button>
                </>
              )}

              {(offer.status === 0 || offer.status === 2) && (
                <>
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleOfferStatus(offer.id, 1);
                    }} 
                    size="small"
                    className="text-xs border border-red-600 text-red-600 p-3"
                  >
                    重新上架
                  </Button>
                </>
              )}
            </Space>
          </div>
        </Card>
      </Link>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 px-3 pt-8">
      {/* 选项卡区域 - 包含状态选项和筛选按钮 */}
      <div className="flex flex-row mb-2 items-center">
        {/* 左侧选项按钮区域 - 90%宽度，支持左右滑动 */}
        <div className="w-[84%] p-2">
          <div 
            className="flex overflow-x-auto whitespace-nowrap pb-2"
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
                className={`px-3 py-1 mr-2 text-sm transition-all ${item.key === activeTab
                  ? 'bg-[#ffebeb] border border-[#ff8080] text-red-500'
                  : 'bg-white border border-transparent hover:border-gray-200'}`}
                style={{
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 右侧筛选按钮区域 - 10%宽度，垂直居中 */}
        <div className="w-[15%] flex">
          <button 
            onClick={handleFilterClick} 
            className="text-sm text-blue-500 border border-blue-500 text-center px-3 py-1"
            style={{
              fontSize: '14px',
              outline: 'none'
            }}
          >
            筛选
          </button>
        </div>
      </div>

      {/* 出租列表 */}
      <div className="">
        {renderRentalList()}
      </div>

      {/* 筛选弹窗 */}
      <Modal
        title="出租筛选"
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
        <ConfigProvider locale={zhCN}>
          <div>
            <div>
              <h4 className="text-sm text-black mb-2">时间区间</h4>
              <Radio.Group className="w-full">
                <Space orientation="vertical" className="w-full">
                  <Radio value="1">1个月内</Radio>
                  <Radio value="3">3个月内</Radio>
                  <Radio value="6">6个月内</Radio>
                </Space>
              </Radio.Group>
            </div>
            <div className="flex items-center gap-4 mt-4">
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

export default RentalOfferPage;