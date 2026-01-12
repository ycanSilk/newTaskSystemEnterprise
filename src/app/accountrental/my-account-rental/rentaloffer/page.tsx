'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Space, Avatar, Tabs, Modal, Radio, DatePicker, message } from 'antd';
import Link from 'next/link';
import { PhoneOutlined, CopyOutlined } from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');
import type { TabsProps } from 'antd';

// API响应格式
export interface RentalOfferApiResponse {
  code: number;
  message: string;
  success: boolean;
  data: RentalOfferData;
}

// 分页数据结构
export interface RentalOfferData {
  list: RentalOffer[];
  page: number;
  size: number;
  total: number;
  pages: number;
}

// 出租信息接口
export interface RentalOffer {
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
			status: RentalOfferStatus;
			totalOrders: number;
			completedOrders: number;
			successRate: number;
			createTime: string;
			imageUrl?: string; // 可选的图片URL字段
}

// 出租信息状态类型（API返回值）
export type RentalOfferStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELED' | 'RENTED';

// 状态文本映射
export const statusTextMap: Record<RentalOfferStatus, string> = {
  ACTIVE: '已发布',
  INACTIVE: '不活跃',
  CANCELED: '已取消',
  RENTED: '已出租'
};

// 获取状态对应的标签颜色
const getStatusTagColor = (status: RentalOfferStatus): string => {
  const statusColors: Record<RentalOfferStatus, string> = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    CANCELED: 'red',
    RENTED: 'purple'
  };
  return statusColors[status] || 'gray';
};

const RentalOfferPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('ACTIVE'); // 默认激活"已发布"选项卡
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RentalOfferData | null>(null);
  const [pagination, setPagination] = useState({ page: 0, size: 20 });
  
  // 下架原因选择框相关状态
  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState<string>('');
  const [currentOfferId, setCurrentOfferId] = useState<string>('');

  // 选项卡配置 - 确保顺序正确，默认激活第一个(已发布)
  const tabItems: TabsProps['items'] = [
    { key: 'ACTIVE', label: '已发布', children: null },
    { key: 'CANCELED', label: '已取消', children: null },
    { key: 'RENTED', label: '已出租', children: null }
  ];

  // 选项卡key到API status参数的映射
  const tabStatusMap: Record<string, string> = {
    'ACTIVE': 'ACTIVE',
    'CANCELED': 'CANCELED', // 根据需求，已取消对应小写cancelled
    'RENTED': 'RENTED' // 根据需求，已出租对应小写rented
  };

  // 调用API获取出租信息 - 根据当前选中的选项卡传递不同的status参数
  const fetchRentalOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      // 获取当前选项卡对应的status参数
      const currentStatus = tabStatusMap[activeTab] || 'ACTIVE';
      const response = await fetch('/api/rental/mypublishrentalinfolist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pagination,
          page: 0,
          size: 20,
          status: currentStatus, // 使用当前选项卡对应的status
          sortField: 'createTime',
          sortOrder: 'DESC',
        }),
      });

      if (!response.ok) {
        throw new Error(`网络请求失败: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json() as RentalOfferApiResponse;

      if (responseData.success) {
        setData(responseData.data);
       
      } else {
        const errorMsg = responseData.message || '获取出租信息失败';
        setError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '网络异常，请稍后重试';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时和选项卡切换时调用API
  React.useEffect(() => {
    fetchRentalOffers();
  }, [pagination, activeTab]); // 添加activeTab作为依赖项

  // 复制出租编号功能
  const copyOfferNo = (offerNo: string) => {
    navigator.clipboard.writeText(offerNo).then(() => {
      message.success('出租编号已复制');
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
  };

  // 状态文本映射
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '已发布';
      case 'INACTIVE':
        return '已下架';
      case 'CANCELED':
        return '已取消';
      case 'RENTED':
        return '已出租';
      default:
        return status;
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 处理选项卡切换 - 切换时会自动触发API调用（通过useEffect依赖）
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // 重置筛选和错误状态
    setError(null);
  };

  // 处理筛选按钮点击
  const handleFilterClick = () => {
    setFilterModalVisible(true);
  };

  // 处理筛选确认
  const handleFilterConfirm = () => {
    setFilterModalVisible(false);
    // 实际项目中这里应该根据筛选条件过滤出租信息
    console.log('应用筛选条件');
  };
  
  // 处理关闭下架原因选择框
  const handleCancelModalClose = () => {
    setCancelModalVisible(false);
    setSelectedCancelReason('');
    setCurrentOfferId('');
  };
  
  // 处理确认下架
  const handleConfirmCancel = async () => {
    if (!selectedCancelReason || !currentOfferId) return;
    
    try {
      // 将参数通过URL传递而不是body
      const response = await fetch(`/api/rental/cancelleasrentaleinfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leaseInfoId: currentOfferId,
          reason: selectedCancelReason,
        }),
      });
      console.log('leaseInfoId:', currentOfferId);
      console.log('reason:', selectedCancelReason);
      const responseData = await response.json();
      console.log('这是取消出租API的日志输出:');
      console.log('返回的状态:', response.status);
      console.log('返回的原始数据', responseData);
      
      if (response.ok && responseData.success) {
        message.success('下架成功');
        // 关闭弹窗
        handleCancelModalClose();
        // 刷新数据列表
        fetchRentalOffers();
      } else {
        const errorMsg = responseData.message || '下架失败，请稍后重试';
        message.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '网络异常，请稍后重试';
      message.error(errorMsg);
    }
  };

  // 处理联系客服
  const handleContactService = (offerId: string) => {
    console.log('联系客服，出租ID:', offerId);
    alert('即将为您连接客服，请稍候...');
  };

  // 处理出租操作
  const handleOfferAction = (offerId: string, action: string) => {
    console.log(`出租 ${offerId} 执行操作: ${action}`);
    
    if (action === '下架') {
      // 显示下架原因选择框
      setCurrentOfferId(offerId);
      setSelectedCancelReason('');
      setCancelModalVisible(true);
    } else {
      alert(`出租 ${offerId} 执行 ${action} 操作`);
    }
  };

  // 由于API已经根据status返回了对应的数据，不需要在前端再次过滤
  const filteredOffers = data?.list || [];

  // 辅助函数：渲染出租列表
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
          <Button 
            type="primary" 
            onClick={fetchRentalOffers} 
            size="small" 
            className="mt-2"
          >
            重新加载
          </Button>
        </div>
      );
    }

    if (filteredOffers.length === 0) {
      return (
        <div className="bg-white p-8 text-center">
          <p className="text-sm text-gray-500">暂无{statusTextMap[activeTab as RentalOfferStatus]}的出租信息</p>
          {activeTab !== 'ACTIVE' && (
            <Button 
              type="default" 
              onClick={() => setActiveTab('ACTIVE')} 
              size="small" 
              className="mt-2"
            >
              查看已发布的出租信息
            </Button>
          )}
        </div>
      );
    }

    return filteredOffers.map((offer) => (
      <Link href={`/accountrental/my-account-rental/rentaloffer/rentaloffer-detail/${offer.id}`} key={offer.id}>
        <Card className="border-0 rounded-none mb-3 cursor-pointer hover:shadow-md transition-shadow">
          {/* 出租头部信息 */}
          <div className="flex items-center">
            <span className="text-sm text-black truncate mr-2">出租单号：{offer.id}</span>
            <Button 
              type="text" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                copyOfferNo(offer.id);
              }}
              size="small"
              className="text-blue-500 whitespace-nowrap"
            >
              复制
            </Button>
          </div>
          <div className='mb-1'>
            <span className="text-sm text-red-500">
              {statusTextMap[offer.status]}
            </span>
          </div>
          {/* 出租详细信息 - 左右结构，同一行显示，垂直居中 */}
          <div className="flex flex-row gap-2 items-center">
            {/* 左侧图片区域 */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gray-100 overflow-hidden">
                {offer.imageUrl ? (
                  <img 
                    src={offer.imageUrl} 
                    alt="出租信息图片" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <img 
                    src="/images/default.png" 
                    alt="默认图片" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
            </div>

            {/* 右侧信息区域 */}
            <div className="flex-1">
                <div className="">{offer.description}</div>
                <div className="">可租赁时长：{offer.minLeaseDays}-{offer.maxLeaseDays} 天</div>
                <div className="">{offer.pricePerDay} 元/天</div>
            </div>
          </div>
          
          {/* 按钮区域 */}
          <div className="flex justify-end items- mt-1">
            <Space>
              <Button
                type="default"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleContactService(offer.id);
                }}
                size="small"
              >
                联系客服
              </Button>

              {/* 根据状态显示不同按钮 */}
              {offer.status === 'ACTIVE' && (
                <>
                  <Button 
                    type="default" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOfferAction(offer.id, '编辑出租');
                    }} 
                    size="small"
                    className="whitespace-nowrap bg-blue-500 text-white"
                  >
                    编辑出租
                  </Button>                       
                  <Button
                    danger
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOfferAction(offer.id, '下架');                  
                    }}
                    size="small"
                    className="whitespace-nowrap bg-red-500 text-white"
                  >
                    下架
                  </Button>
                </>
              )}

              {offer.status === 'INACTIVE' && (
                <>
                  <Button 
                    type="primary" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOfferAction(offer.id, '重新上架');
                    }} 
                    size="small"
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
                className={`px-2 py-1 mr-2 text-sm transition-all ${item.key === activeTab
                  ? 'bg-[#ffebeb] border border-[#ff8080]'
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
            className="text-sm text-blue-500 text-center p-1 pb-2"
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
      
      {/* 下架原因选择弹窗 */}
      <Modal
        title="请选择下架原因"
        open={cancelModalVisible}
        onCancel={handleCancelModalClose}
        footer={null}
        destroyOnHidden
      >
        <ConfigProvider locale={zhCN}>
          <div>
            <div className="mb-4">
              <Radio.Group 
                className="w-full"
                value={selectedCancelReason}
                onChange={(e) => setSelectedCancelReason(e.target.value)}
              >
                <Space orientation="vertical" className="w-full">
                  <Radio value="不想租赁了">不想租赁了</Radio>
                  <Radio value="信息错误">信息错误</Radio>
                  <Radio value="其他">其他</Radio>
                </Space>
              </Radio.Group>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                size="small" 
                onClick={handleCancelModalClose}
              >
                关闭
              </Button>
              <Button 
                size="small" 
                type="primary" 
                onClick={handleConfirmCancel}
                disabled={!selectedCancelReason}
              >
                确认下架
              </Button>
            </div>
          </div>
        </ConfigProvider>
      </Modal>
    </div>
  );
};

export default RentalOfferPage;