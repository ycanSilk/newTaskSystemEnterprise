'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageOutlined } from '@ant-design/icons';

// 求租信息接口定义
interface RentalRequest {
  id: string;
  userId: string;
  platform: string;
  accountType: string;
  expectedPricePerDay: number;
  budgetDeposit: number;
  expectedLeaseDays: number;
  description: string;
  status: string;
  createTime: string;
}

// API响应数据接口
interface ApiResponse {
  code: number;
  message: string;
  data: RentalRequest;
  success: boolean;
  timestamp: number;
}

// 复制状态接口
interface CopyStatus {
  [key: string]: boolean;
}

const RentalRequestDetailPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [request, setRequest] = useState<RentalRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>({});

  // 获取URL参数中的id
  const params = useParams<{ id: string }>();
  const id = params?.id || '';

  // 获取求租信息详情
  useEffect(() => {
    const fetchRentalRequestDetail = async (): Promise<void> => {
      if (!id) {
        setError('缺少请求ID');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/rental/getrequestinfodetail?rentRequestId=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiResponse: ApiResponse = await response.json();

        if (apiResponse.success && apiResponse.data) {
          setRequest(apiResponse.data);
        } else {
          setError(apiResponse.message || '获取求租信息详情失败');
        }
      } catch (error) {
        console.error('获取求租信息详情失败:', error);
        setError('获取求租信息详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchRentalRequestDetail();
  }, [id]);

  // 处理复制订单ID
  const handleCopyOrderNumber = (): void => {
    if (!request) return;

    navigator.clipboard.writeText(request.id);
    // 设置复制成功状态
    setCopyStatus(prev => ({ ...prev, orderNumber: true }));
    // 2秒后恢复原状态
    setTimeout(() => {
      setCopyStatus(prev => ({ ...prev, orderNumber: false }));
    }, 2000);
  };

  // 处理立即租赁
  const handleRentNow = (): void => {
    if (!request) return;
    // 在实际项目中，应该跳转到租赁确认页
    console.log('立即租赁请求:', request.id);
  };

  // 处理联系对方
  const handleContact = (): void => {
    if (!request) return;
    console.log('联系对方请求:', request.id);
  };

  // 返回上一页
  const handleBack = (): void => {
    router.back();
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 错误状态
  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{error || '求租信息不存在'}</h3>
          <button
            onClick={handleBack}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium shadow-sm active:scale-95 transition-all"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-blue-100">
          {/* 卡片头部 */}
          <div className="bg-blue-50 p-4 border-b border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-medium">账号平台：{request.platform}</h2>
              </div>
              <div className="text-red-600">
                ¥{request.expectedPricePerDay.toFixed(2)}/天
              </div>
            </div>
          </div>

          {/* 订单基本信息 */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-1">
                <span>订单ID：</span>
                <span className="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">{request.id}</span>
                <button
                  onClick={handleCopyOrderNumber}
                  className="flex items-center space-x-1 p-1 rounded hover:bg-blue-50 text-blue-600"
                  title="复制订单ID"
                >
                  <span className="text-sm">复制</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span>创建时间：</span>
                <span>{request.createTime}</span>
              </div>
              <div>
                <span>账户类型：</span>
                <span>{request.accountType}</span>
              </div>
              <div>
                <span>期望租期：</span>
                <span>{request.expectedLeaseDays}天</span>
              </div>
              <div>
                <span>预算押金：</span>
                <span>¥{request.budgetDeposit.toFixed(2)}</span>
              </div>
              <div>
                <span>状态：</span>
                <span className="font-medium text-blue-600">{request.status}</span>
              </div>
            </div>
          </div>

          {/* 求租详情 */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium mb-3">求租信息描述</h3>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="leading-relaxed">{request.description?.split('\n')[0] || ''}</p>
            </div>
          </div>

          {/* 账号要求 */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium mb-3">账号要求</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.description?.includes('修改抖音账号名称和头像') ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.description?.includes('修改抖音账号名称和头像') ? '√' : 'X'}
                </span>
                <span className={request.description?.includes('修改抖音账号名称和头像') ? '' : 'text-gray-500'}>
                  修改抖音账号名称和头像
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.description?.includes('修改账号简介') ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.description?.includes('修改账号简介') ? '√' : 'X'}
                </span>
                <span className={request.description?.includes('修改账号简介') ? '' : 'text-gray-500'}>
                  修改账号简介
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.description?.includes('支持发布评论') ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.description?.includes('支持发布评论') ? '√' : 'X'}
                </span>
                <span className={request.description?.includes('支持发布评论') ? '' : 'text-gray-500'}>
                  支持发布评论
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.description?.includes('支持发布视频') ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.description?.includes('支持发布视频') ? '√' : 'X'}
                </span>
                <span className={request.description?.includes('支持发布视频') ? '' : 'text-gray-500'}>
                  支持发布视频
                </span>
              </div>
            </div>
          </div>

          {/* 登录方式 */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium mb-3">登录方式</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.description?.includes('扫码登录') ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.description?.includes('扫码登录') ? '√' : 'X'}
                </span>
                <span className={request.description?.includes('扫码登录') ? '' : 'text-gray-500'}>
                  扫码登录
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.description?.includes('手机号+短信验证登录') || request.description?.includes('手机号') || request.description?.includes('短信验证') ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.description?.includes('手机号+短信验证登录') || request.description?.includes('手机号') || request.description?.includes('短信验证') ? '√' : 'X'}
                </span>
                <span className={request.description?.includes('手机号+短信验证登录') || request.description?.includes('手机号') || request.description?.includes('短信验证') ? '' : 'text-gray-500'}>
                  手机号+短信验证登录
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.description?.includes('不登录账号') ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.description?.includes('不登录账号') ? '√' : 'X'}
                </span>
                <span className={request.description?.includes('不登录账号') ? '' : 'text-gray-500'}>
                  不登录账号，按照承租方要求完成租赁
                </span>
              </div>
            </div>
          </div>

          {/* 风险提示 */}
          <div className="p-4 bg-red-50">
            <h4 className="text-red-700 font-medium mb-2">风险提示</h4>
            <p className="text-sm text-red-600">
              出租账户期间账户可能被平台封禁风险，租赁期间如被封禁，租户需按照抖音平台要求进行验证解封
              请确保您了解并同意平台的服务条款和风险提示后再进行租赁操作。
            </p>
          </div>

          {/* 按钮区域 */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleContact}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium shadow-sm active:scale-95 transition-all flex items-center"
              >
                <MessageOutlined className="mr-1" />
                联系对方
              </button>
              <button
                onClick={handleRentNow}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm active:scale-95 transition-all"
              >
                立即出租
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalRequestDetailPage;