'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button, Space, Divider, Modal, message } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';

// 出租信息状态类型
type RentalOfferStatus = '已上架' | '已租出' | '已取消';

// 租赁详情接口定义
interface LeaseInfoDetail {
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
  // 扩展字段以支持UI展示
  offerNo?: string;
  userName?: string;
  accountName?: string;
  rentalInfo?: {
    rentalOrderNo: string;
    tenantName: string;
    startDate: string;
    endDate: string;
    amount: number;
  };
  rejectReason?: string;
  dataImages?: string[];
  contactPhone?: string;
  contactQQ?: string;
  contactEmail?: string;
}

// API响应接口定义
interface ApiResponse {
  code: number;
  message: string;
  data: LeaseInfoDetail;
  success: boolean;
  timestamp: number;
}

const RentalRequestDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params?.id as string || '';
  const [leaseDetail, setLeaseDetail] = useState<LeaseInfoDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [offShelfModalVisible, setOffShelfModalVisible] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  // 新增状态：取消原因和确认操作加载状态
  const [cancelReason, setCancelReason] = useState<string>('');
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // 从API获取出租详情
  const fetchLeaseInfoDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('前端要传递的订单id:', id);
      console.log('id类型:', typeof id);
      console.log('id是否为空:', id === '');
      // 调用后端API
      const apiUrl = `/api/rental/getleaseinfodetail?leaseInfoId=${id}`;
      console.log('前端请求的完整URL:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: ApiResponse = await response.json();
      console.log('后端返回的原始数据:', data);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (data.success && data.code === 200 && data.data) {
        // 转换API数据为前端需要的格式
        const formattedData = {
          ...data.data,
          // 添加UI展示需要的字段映射
          accountName: data.data.accountType,
          accountDescription: data.data.description,
          rentalPrice: data.data.pricePerDay,
          rentalUnit: '天',
          rentalDuration: `可租赁${data.data.minLeaseDays}-${data.data.maxLeaseDays}天`,
          status: mapStatusToChinese(data.data.status)
        };
        setLeaseDetail(formattedData);
      } else {
        const errorMessage = data.message || '获取出租信息失败';
        message.error(errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('获取出租信息异常:', error);
      const errorMessage = '获取出租信息异常，请稍后重试';
      message.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 将API状态转换为中文显示
  const mapStatusToChinese = (status: string): RentalOfferStatus => {
    const statusMap: Record<string, RentalOfferStatus> = {
      'ACTIVE': '已上架',
      'CANCELED': '已取消',
      'RENTED': '已租出'
    };
    return statusMap[status] || '待审核';
  };

  useEffect(() => {
    fetchLeaseInfoDetail();
  }, [id]);

  // 处理返回列表
  const handleBackToList = () => {
    router.push('/accountrental/my-account-rental/rentaloffer');
  };

  // 下架确认
  const handleOffShelf = () => {
    // 重置取消原因
    setCancelReason('');
    setOffShelfModalVisible(true);
  };

  // 调用后端取消API的函数
  const callCancelRentRequestAPI = async (leaseInfoId: string, reason: string): Promise<boolean> => {
    try {
      console.log('调用取消租赁API，参数:', { leaseInfoId, reason });
      // 调用后端API
      const response = await fetch('/api/rental/cancelleasrentaleinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leaseInfoId: id, reason })
      });
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP错误，状态码: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('取消租赁请求API响应:', data);
      
      if (data.success) {
        return true;
      } else {
        throw new Error(data.message || '操作失败');
      }
    } catch (error) {
      console.error('调用取消API失败:', error);
      throw error;
    }
  };

  // 确认下架
  const handleConfirmOffShelf = async () => {
    // 验证参数
    if (!cancelReason || !id) {
      message.error('参数不完整');
      return;
    }
    
    try {
      setConfirmLoading(true);
      // 调用后端API
      await callCancelRentRequestAPI(id, cancelReason);
      
      // 成功响应
      message.success('下架成功');
      
      // 更新状态
      if (leaseDetail) {
        setLeaseDetail({
          ...leaseDetail,
          status: '已取消'
        });
      }
      
      // 关闭弹窗
      setOffShelfModalVisible(false);
    } catch (error) {
      console.error('下架失败:', error);
      message.error(error instanceof Error ? error.message : '下架失败，请稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 重新上架
  const handleReList = async () => {
    try {
      // 这里应该是实际的API调用，这里使用模拟数据
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟成功响应
      message.success('重新上架成功');
      
      // 更新状态
      if (leaseDetail) {
        setLeaseDetail({
          ...leaseDetail,
          status: '已上架'
        });
      }
    } catch (error) {
      console.error('重新上架失败:', error);
      message.error('重新上架失败，请稍后重试');
    }
  };

  // 查看订单
  const handleViewOrder = () => {
    if (leaseDetail?.rentalInfo?.rentalOrderNo) {
      router.push(`/accountrental/my-account-rental/rentalorder/rentalorder-detail?id=${leaseDetail.rentalInfo.rentalOrderNo}`);
    }
  };

  // 处理图片点击（预览）
  const handleImageClick = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  // 显示加载状态
  if (loading) {
    return <div className="p-8 text-center">加载中...</div>;
  }
  
  // 显示错误状态
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  
  // 如果没有数据
  if (!leaseDetail) {
    return <div className="p-8 text-center">未找到出租信息</div>;
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主内容区域 */}
      <div className="px-4 py-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 基本信息区域 */}
          <div className="p-5">
            {/* 基本信息头部 */}
            <div className="space-y-4 mb-6">
              <div className="mb-4">
                <span className="text-gray-600">账号平台：</span>
                <span>{leaseDetail.platform || 'N/A'}</span>
              </div>
              
              <div className="mb-4">
                <span className="text-gray-600">账号等级：</span>
                <span>{leaseDetail.accountLevel || 'N/A'}</span>
              </div>
              
              <div className="mb-4">
                <span className="text-gray-600">账号描述：</span>
                <span>{leaseDetail.description || 'N/A'}</span>
              </div>
              
              <div className="mb-4">
                <span className="text-gray-600">租赁价格：</span>
                <span>{leaseDetail.pricePerDay || 0}元/天</span>
              </div>
              
              <div className="mb-4">
                <span className="text-gray-600">押金金额：</span>
                <span>{leaseDetail.depositAmount || 0}元</span>
              </div>
              
              <div className="mb-4">
                <span className="text-gray-600">最短租赁天数：</span>
                <span>{leaseDetail.minLeaseDays || 1}天</span>
              </div>
              
              <div className="mb-4">
                <span className="text-gray-600">最长租赁天数：</span>
                <span>{leaseDetail.maxLeaseDays || 30}天</span>
              </div>
              
              <div className="flex items-center mb-4">
                <span className="text-gray-600 mr-2">状态：</span>
                <span className='px-2 py-1 rounded-full text-sm'>
                  {leaseDetail.status}
                </span>
              </div>
            </div>

            {/* 表单区域 - 根据编辑状态显示可编辑或只读内容 */}
            <div className="space-y-6">
              {/* 账号描述 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">账号信息</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap line-clamp-3">{leaseDetail.description || '暂无描述'}</div>
              </div>
            </div>
            {/* 图片展示区域 */}
            {leaseDetail.dataImages && leaseDetail.dataImages.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">账号数据图片</label>
                <div className="grid grid-cols-3 gap-4">
                  {leaseDetail.dataImages.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative cursor-pointer overflow-hidden rounded-md border border-gray-200"
                      onClick={() => handleImageClick(image)}
                    >
                      <img 
                        src={image} 
                        alt={`账号数据 ${index + 1}`} 
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 联系方式区域 */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">联系方式</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 mr-2">手机号：</span>
                  <span>{leaseDetail.contactPhone || '未设置'}</span>
                </div>
                <div>
                  <span className="text-gray-600 mr-2">QQ号：</span>
                  <span>{leaseDetail.contactQQ || '未设置'}</span>
                </div>
                <div>
                  <span className="text-gray-600 mr-2">邮箱：</span>
                  <span>{leaseDetail.contactEmail || '未设置'}</span>
                </div>
              </div>
            </div>

            {/* 租赁信息区域 - 仅在已租出状态下显示 */}
            {leaseDetail.status === '已租出' && leaseDetail.rentalInfo && (
              <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">租赁信息</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">租户名称</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始时间</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结束时间</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">租赁金额</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">{leaseDetail.rentalInfo.tenantName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{leaseDetail.rentalInfo.startDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{leaseDetail.rentalInfo.endDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{leaseDetail.rentalInfo.amount}元</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 审核不通过原因 - 仅在审核不通过状态下显示 */}
            {leaseDetail.status === '审核不通过' && leaseDetail.rejectReason && (
              <div className="mt-6 bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-900 mb-2">审核不通过原因</h3>
                <p className="text-red-800">{leaseDetail.rejectReason}</p>
              </div>
            )}

            {/* 操作按钮区域 */}
              <div className="mt-8 flex justify-between items-center">
                <Space>
                  <Button type="primary" onClick={handleBackToList} icon={<ArrowLeftOutlined />}>返回列表</Button>
                </Space>
                
                <Space>
                  {leaseDetail.status === '已上架' && (
                    <Button danger onClick={handleOffShelf}>下架</Button>
                  )}
                  
                  {leaseDetail.status === '已下架' && (
                    <Button type="primary" onClick={handleReList}>重新上架</Button>
                  )}
                  
                  {leaseDetail.status === '已租出' && leaseDetail.rentalInfo?.rentalOrderNo && (
                    <Button type="primary" onClick={handleViewOrder}>查看订单</Button>
                  )}
                </Space>
              </div>
          </div>
        </div>
      </div>

      {/* 下架确认弹窗 */}
      <Modal
        title="确认下架"
        open={offShelfModalVisible}
        onOk={handleConfirmOffShelf}
        onCancel={() => setOffShelfModalVisible(false)}
        okText="确认下架"
        cancelText="取消"
        okType="danger"
        okButtonProps={{ disabled: !cancelReason, loading: confirmLoading }}
      >
        <p className="mb-4">请选择下架原因：</p>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="cancelReason"
              value="信息错误"
              checked={cancelReason === '信息错误'}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mr-2"
            />
            <span>信息错误</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="cancelReason"
              value="其他"
              checked={cancelReason === '其他'}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mr-2"
            />
            <span>其他</span>
          </label>
        </div>
        {!cancelReason && (
          <div className="mt-2 text-red-500 text-sm">请选择下架原因</div>
        )}
      </Modal>

      {/* 图片预览Modal */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        {previewImage && (
          <img 
            alt="预览图片" 
            style={{ width: '100%' }} 
            src={previewImage} 
          />
        )}
      </Modal>
    </div>
  );
};

export default RentalRequestDetailPage;