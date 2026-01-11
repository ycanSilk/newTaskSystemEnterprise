'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Space, Avatar, Tabs, Modal, Radio, DatePicker, message } from 'antd';
import Link from 'next/link';
import { SearchOutlined, CopyOutlined } from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');
import type { TabsProps } from 'antd';

// 求租信息状态类型
type RentalRequestStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELED' | 'MATCHED';

// 顶级响应对象类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  timestamp: number;
}

// data对象类型
interface RentalListResponse {
  list: RentalRequest[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// list数组中的元素对象类型
interface RentalRequest {
  id: string;
  userId: string;
  platform: string;
  accountType: string;
  expectedPricePerDay: number;
  budgetDeposit: number;
  expectedLeaseDays: number;
  description: string;
  status: RentalRequestStatus;
  createTime: string;
  imageUrl?: string;
}

// 根据状态码获取对应的中文显示
const getStatusDisplayText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'ACTIVE': '已发布',
    'CANCELED': '已取消',
    'MATCHED': '已出租'
  };
  return statusMap[status] || status;
};

// 根据中文状态获取对应的状态码
const getStatusFromDisplayText = (displayText: string): string => {
  const statusMap: Record<string, string> = {
    '已发布': 'ACTIVE',
    '已取消': 'CANCELED',
    '已出租': 'MATCHED'
  };
  return statusMap[displayText] || displayText;
};

const RentalRequestPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('已发布');
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 下架原因选择框相关状态
  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState<string>('');
  const [currentRequestId, setCurrentRequestId] = useState<string>('');

  // 加载数据
  React.useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  // 选项卡配置
  const tabItems: TabsProps['items'] = [
    { key: '已发布', label: '已发布', children: null },
    { key: '已出租', label: '已出租', children: null },
    { key: '已取消', label: '已取消', children: null }
  ];

  // 复制求租编号功能
  const copyid = (id?: string) => {
    if (!id) {
      message.error('求租编号不存在');
      return;
    }
    navigator.clipboard.writeText(id).then(() => {
      message.success('求租编号已复制');
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
  };

  // 处理选项卡切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 处理筛选按钮点击
  const handleFilterClick = () => {
    setFilterModalVisible(true);
  };

  // 处理筛选确认
  const handleFilterConfirm = () => {
    setFilterModalVisible(false);
    // 实际项目中这里应该根据筛选条件过滤求租信息
    console.log('应用筛选条件');
  };
  
  // 处理关闭下架原因选择框
  const handleCancelModalClose = () => {
    setCancelModalVisible(false);
    setSelectedCancelReason('');
    setCurrentRequestId('');
  };
  
  // 加载数据
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/rental/myrequestrentalinfolist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 0,
          size: 20,
          sortField: 'createTime',
          sortOrder: 'DESC',
          status: 'ACTIVE',
          platform: "",
          accountType: "",
          minPrice: 1,
          maxPrice: 999
        }),
      });
      
      const apiResponse: ApiResponse<RentalListResponse> = await response.json();
      
      if (apiResponse.success) {
        setRequests(apiResponse.data.list);
      } else {
        setError(apiResponse.message || '获取求租信息失败');
      }
    } catch (err) {
      setError('网络请求失败，请稍后重试');
      console.error('API请求失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理确认下架
  const handleConfirmCancel = async () => {
    if (!selectedCancelReason || !currentRequestId) return;
    
    try {
      // 调用API将求租信息下架
      const response = await fetch('/api/rental/cancelrentrequestinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rentRequestId: currentRequestId,
          reason: selectedCancelReason,
        }),
      });
      
      const responseData = await response.json();
      
      if (response.ok && responseData.success) {
        message.success('下架成功');
        // 关闭弹窗
        handleCancelModalClose();
        // 刷新数据列表
        fetchRequests();
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
  const handleContactService = (requestId: string) => {
    console.log('联系客服，求租ID:', requestId);
    alert('即将为您连接客服，请稍候...');
  };

  // 处理求租操作
  const handleRequestAction = (requestId: string, action: string) => {
    console.log(`求租 ${requestId} 执行操作: ${action}`);
    
    if (action === '下架') {
      // 显示下架原因选择框
      setCurrentRequestId(requestId);
      setSelectedCancelReason('');
      setCancelModalVisible(true);
    } else {
      alert(`求租 ${requestId} 执行 ${action} 操作`);
    }
  };

  // 过滤求租信息
  const filteredRequests = activeTab === '已发布' 
    ? requests 
    : requests.filter(request => request.status === getStatusFromDisplayText(activeTab));

  return (
    <div className="min-h-screen bg-gray-100 px-3 pt-8">
      {/* 选项卡区域 - 包含状态选项和筛选按钮 */}
      <div className="flex flex-row mb-2 items-center">
        {/* 左侧选项按钮区域 - 90%宽度，支持左右滑动 */}
        <div className="w-[85%] p-2">
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
            className="text-sm text-blue-500 text-center p-1 border border-blue-500 bg-white"
            style={{
              fontSize: '14px',
            }}
          >
            筛选
          </button>
        </div>
      </div>

      {/* 求租列表 */}
      <div className="">
        {loading ? (
          <div className="bg-white p-3 text-center">
            <p className="text-sm text-black">加载中...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-3 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : filteredRequests.map((request) => (
            <Link href={`/accountrental/my-account-rental/rentalrequest/rentalrequest-detail/${request.id}`} key={request.id} className="block">
                <Card className="border-0 rounded-none mb-3 cursor-pointer hover:shadow-md transition-shadow">
                {/* 求租头部信息 */}
                <div className="flex justify-between items-center p-0">
                  <div className="flex items-center">
                    <span className="text-sm w-[270px] text-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-60px)]">求租编号：{request.id || 'N/A'}</span>
                    <Button 
                      type="text" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        copyid(request.id);
                      }}
                      size="small"
                      className="ml-2 whitespace-nowrap text-blue-500"
                    >
                      复制
                    </Button>
                  </div>
                </div>
                <div className='mb-1'> 
                  <span className="text-sm text-red-500 border border-red-500 px-2 rounded-md bg-red-50">
                    {getStatusDisplayText(request.status)}
                  </span>
                </div>
                
                {/* 求租详细信息 - 左右结构，响应式布局 */}
                <div className="flex flex-row gap-2 p-0 items-center">
                  {/* 左侧图片区域 - 在移动设备上调整尺寸 */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 overflow-hidden">
                      {/* 根据平台显示不同的logo */}
                      <img 
                        src={`/images/${request.platform.toLowerCase()}-logo.png`} 
                        alt={request.description} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/images/0e92a4599d02a7.jpg';
                        }}
                      />
                    </div>
                  </div>

                  {/* 右侧信息区域 */}
                  <div className="flex-1">
                    <div className="text-sm text-black line-clamp-2">{request.description}</div>
                    <div className="text-sm text-black">求租时长：{request.expectedLeaseDays} 天</div>
                    <div className="text-sm font-medium text-black">￥{request.budgetDeposit.toFixed(2)}</div>
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
                        handleContactService(request.id);
                      }}
                      size="small"
                    >
                      联系客服
                    </Button>
                    
                    {/* 根据状态显示不同按钮 */}
                    {request.status === 'ACTIVE' && (
                      <>
                        <Button 
                          type="primary" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRequestAction(request.id, '编辑求租');
                          }} 
                          size="small"
                          className="whitespace-nowrap"
                        >
                          编辑求租
                        </Button>
                        <Button
                          danger
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();                           
                            handleRequestAction(request.id, '下架');
                          }}
                          size="small"
                          className="whitespace-nowrap bg-red-500 text-white"
                        >
                          下架
                        </Button>
                      </>
                    )}

                    {request.status === 'MATCHED' && (
                      <>
                        <Button 
                          type="default" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRequestAction(request.id, '查看匹配账号');
                          }} 
                          size="small"
                          className="whitespace-nowrap"
                        >
                          查看匹配账号
                        </Button>
                      </>
                    )}
                  </Space>
                </div>
              </Card>
            </Link>
          ))}

        {/* 如果没有求租信息 */}
        {!loading && !error && filteredRequests.length === 0 && (
          <div className="bg-white p-8 text-center">
            <p className="text-sm text-black">暂无求租信息</p>
          </div>
        )}
      </div>

      {/* 筛选弹窗 */}
      <Modal
        title="求租筛选"
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

export default RentalRequestPage;