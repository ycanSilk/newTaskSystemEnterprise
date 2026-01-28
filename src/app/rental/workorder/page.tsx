'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Table, Button, Tag, Space, message } from 'antd';
import type { ColumnType } from 'antd/es/table';

// 导入API返回的工单类型
type WorkOrderStatus = number;

// 工单状态文本映射
export const statusTextMap: Record<number, string> = {
  0: '待处理',
  1: '处理中',
  2: '已解决',
  3: '已关闭'
};

// 工单状态标签颜色映射
export const statusColorMap: Record<number, string> = {
  0: 'warning',
  1: 'processing',
  2: 'success',
  3: 'default'
};

// 工单类型
export interface WorkOrder {
  ticket_id: number;
  ticket_no: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  status_text: string;
  order_id: number;
  order_amount: string;
  order_days: number;
  order_status: number;
  order_status_text: string;
  buyer_username: string;
  seller_username: string;
  is_creator: boolean;
  my_role: string;
  message_count: number;
  unread_count: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

// 分页信息接口
interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// API响应接口
interface GetWorkOrderListResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    list: WorkOrder[];
    pagination: Pagination;
  } | null;
  timestamp: number;
}

const WorkOrderListPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 获取工单列表
  const fetchWorkOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // 调用实际的API请求，获取工单列表
  
      const response = await fetch('/api/workOrder/getWorkOrderList?page=1&page_size=10&role=all&status=all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.code === 0) {
        console.log("获取工单列表成功", data);
        // API调用成功，更新工单列表
        setWorkOrders(data.data.list || []);
        message.success(data.message || '获取工单列表成功');
      } else {
        // API调用失败，显示错误信息
        setError(data.message || '获取工单列表失败');
        message.error(data.message || '获取工单列表失败');
      }
    } catch (err) {
      setError('获取工单列表失败，请稍后重试');
      message.error('获取工单列表失败，请稍后重试');
      console.error('获取工单列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取工单列表
  useEffect(() => {
    fetchWorkOrders();
  }, []);

  // 查看工单详情
  const handleViewDetail = (ticket_id: number, ticket_no: string) => {
    router.push(`/rental/workorder/deatil/${ticket_id}?ticket_no=${ticket_no}&ticket_id=${ticket_id}`);
  };

  // 处理工单
  const handleCloseWorkOrder = (ticket_id: number) => {
    message.info(`处理工单 ${ticket_id}`);
    // 这里需要替换为实际的API请求
  };

  // 渲染工单卡片列表
  const renderWorkOrderCards = () => {
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
            type="default" 
            onClick={fetchWorkOrders} 
            size="small" 
            className="mt-2"
          >
            重试
          </Button>
        </div>
      );
    }

    if (workOrders.length === 0) {
      return (
        <div className="bg-white p-8 text-center">
          <p className="text-sm text-gray-500">暂无工单信息</p>
          <Button 
            type="primary" 
            onClick={() => router.push('/rental/workorder/create')} 
            size="small" 
            className="mt-2 bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
          >
            创建工单
          </Button>
        </div>
      );
    }

    return workOrders.map((workOrder) => (
      <Card 
        key={workOrder.ticket_id} 
        className="border-0 rounded-lg shadow-sm mb-4 cursor-pointer hover:shadow-md transition-shadow"
      >
        {/* 工单头部信息 */}
        <div className="flex justify-between items-start ">
          <div>
            <p className="text-sm">工单ID: {workOrder.ticket_id}</p>
            <p className="text-sm">工单编号: {workOrder.ticket_no}</p>
            
          </div>
          <Tag color={statusColorMap[workOrder.status]} className="text-sm">
            {workOrder.status_text}
          </Tag>
        </div>

        {/* 工单标题和描述 */}
        <div className=" space-y-1 mb-2">
          <p className="text-sm font-medium">标题：{workOrder.title}</p>
          <div className="bg-blue-50 border border-blue-200 p-2 rounded-md">
             <p className="">问题描述：</p>
             <p className=''>{workOrder.description}</p>
          </div>
        </div>

        {/* 订单信息 */}
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-100 p-3 rounded-md">金额：¥{workOrder.order_amount}/天</div>
          <div className="bg-gray-100 p-3 rounded-md">租赁天数：{workOrder.order_days}/天</div>
          <div className="bg-gray-100 p-3 rounded-md">订单ID: {workOrder.order_id}</div>
          <div className="bg-gray-100 p-3 rounded-md">我的角色：{workOrder.my_role === 'buyer' ? '买家' : '卖家'}
          </div>
        </div>

        {/* 参与人信息 */}
        <div className="mb-3 text-sm">
          <p className="font-medium mb-1">参与人信息:</p>
          <div className="flex gap-2">
            <Tag className='text-white bg-blue-500 py-2 px-5'>买家: {workOrder.buyer_username}</Tag>
            <Tag className='text-white bg-blue-500 py-2 px-5'>卖家: {workOrder.seller_username}</Tag>
          </div>
        </div>

        {/* 消息统计 */}
        <div className="text-sm">
          <div className="flex gap-4">
            <span>总消息: {workOrder.message_count}</span>
            {workOrder.unread_count > 0 && (
              <span className="text-red-500 font-medium">未读: {workOrder.unread_count}</span>
            )}
          </div>
        </div>

        {/* 工单时间信息 */}
        <div className="text-sm space-y-1 ">
          <p>创建时间: {workOrder.created_at}</p>
          <p>更新时间: {workOrder.updated_at}</p>
          {workOrder.closed_at && (
            <p className="text-gray-500">关闭时间: {workOrder.closed_at}</p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2">
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(workOrder.ticket_id, workOrder.ticket_no)}
            className="text-blue-600 text-sm  border border-blue-600 rounded-sm px-3 py-1"
          >
            发送消息
          </Button>
          {workOrder.status === 0 && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleCloseWorkOrder(workOrder.ticket_id)}
              className="text-sm bg-green-600 border-green-600 rounded-sm px-3 py-1"
            >
              关闭工单
            </Button>
          )}
        </div>
      </Card>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 px-3 pt-8 pb-16">
      {/* 页面标题和创建按钮 */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-semibold text-gray-800">工单列表</h1>
        <Button
          type="primary"
          onClick={() => router.push('/rental/workorder/create')}
          className="bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700 text-sm py-2 px-4"
        >
          创建工单
        </Button>
      </div>

      {/* 工单卡片列表 */}
      <div className="">
        {renderWorkOrderCards()}
      </div>
    </div>
  );
};

export default WorkOrderListPage;