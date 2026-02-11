'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageOutlined } from '@ant-design/icons';
import { GetRequestRentalInfoDetailResponse, RequestRentalInfoDetail } from '@/app/types/rental/requestRental/getRequestRentalInfoDetail';

// 复制状态接口
interface CopyStatus {
  [key: string]: boolean;
}

const RentalRequestDetailPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [request, setRequest] = useState<RequestRentalInfoDetail | null>(null);
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
        // 调用中间件获取求租信息详情
        const response = await fetch(`/api/rental/requestRental/getRequestRentalInfoDetail?demand_id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiResponse: GetRequestRentalInfoDetailResponse = await response.json();

        if (apiResponse.success && apiResponse.code === 0 && apiResponse.data) {
          setRequest(apiResponse.data);
        } else {
          setError(apiResponse.message || '获取求租信息详情失败');
        }
      } catch (err) {
        console.error('获取求租信息详情失败:', err);
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

    navigator.clipboard.writeText(request.id.toString());
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
    // 跳转到申请租赁页面，并传递订单ID
    router.push(`/rental/requests_market/applicationRent?demand_id=${request.id}`);
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
          <h3 className=" text-gray-900 ">{error || '求租信息不存在'}</h3>
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
      {/* 页面标题 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white shadow-sm overflow-hidden border border-gray-200 mb-1">
          {/* 卡片头部 */}
          <div className="py-2 px-3">
            <h2 className="text-xl font-semibold pt-5 px-2 mb-2">{request.title}</h2>
            <div className="flex flex-wrap items-center text-sm ">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 '}`}>
                {request.status_text}
              </span>
            </div>
          </div>

          {/* 订单基本信息 */}
          <div className="py-2 px-3">
            <h3 className="text-lg font-semibold px-2 flex items-center"> 基本信息 </h3>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center px-2 rounded-lg">
                <span className="">订单号：</span>
                <span className="font-semibold ">{request.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 pl-2">  
                <div className="">期望租期：{request.days_needed}天</div>
                <div className="">金额：<span className="font-bold text-red-600">¥{request.budget_amount_yuan}/天</span></div>
                <div className="flex items-center">发布时间：{request.created_at}</div>
                <div className="">截止时间：{request.deadline_datetime}</div>
            </div>
          </div>

          {/* 账号要求 */}
          <div className="py-2 px-3">
            <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
              <h2>账号描述:</h2>
              <p className="">{request.requirements_json.account_requirements}</p>
            </div>
          </div>

          {/* 账号要求 */}
          <div className="py-2 px-3 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-1 pl-2">账号要求</h3>
            <div className="flex flex-wrap gap-2">
              {request.requirements_json.deblocking === 1 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">账号解封</span>
              )}
              {request.requirements_json.other_requirements === 1 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">实名认证</span>
              )}
              {request.requirements_json.basic_information === 1 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">修改基本信息</span>
              )}
            </div>
          </div>

          {/* 登录方式 */}
          <div className="py-2 px-3 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-1 pl-2">登录方式</h3>
            <div className="flex flex-wrap gap-2">
              {request.requirements_json.scan_code_login === 1 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">扫码登录</span>
              )}
              {request.requirements_json.phone_message === 1 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">短信登录</span>
              )}
              {request.requirements_json.requested_all === 1 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">按照承租方要求</span>
              )}
            </div>
          </div>
          
          {/* 风险提示 */}
          <div className="p-3 bg-red-50 border-b border-red-100 mt-2">
            <h4 className="text-red-700 font-semibold  flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              风险提示
            </h4>
            <p className="text-sm text-red-600 leading-relaxed">
              出租账户期间账户可能被平台封禁风险，租赁期间如被封禁，租户需按照抖音平台要求进行验证解封。
              请确保您了解并同意平台的服务条款和风险提示后再进行租赁操作。
            </p>
          </div>

          {/* 按钮区域 */}
          <div className="p-3 bg-gray-50 flex justify-end space-x-2">
            <button
              onClick={handleContact}
              className="px-4 py-2 bg-white border border-blue-500 text-blue-600 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-50 active:scale-95 transition-all flex items-center"
            >
              联系对方
            </button>
            <button
              onClick={handleRentNow}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-md active:scale-95 transition-all flex items-center"
            >
              我要出租账号
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalRequestDetailPage;