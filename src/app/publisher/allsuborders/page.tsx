'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOutlined, FilterOutlined, CalendarOutlined, DownOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons';

import OrderStatus from '../../../components/order/OrderStatus';
import OrderTaskType from '../../../components/order/OrderTaskType';
import { OrderStatusType } from '../../../components/order/OrderStatus';
import { TaskType } from '../../../components/order/OrderTaskType';

// 定义订单类型接口
export interface Order {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  budget: number;
  assignedTo?: string;
  completionTime?: string;
  type: 'comment' | 'like' | 'share' | 'other';
  subOrders: SubOrder[];
  videoUrl?: string;
}

export interface SubOrder {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
  submitTime?: string;
  reviewTime?: string;
  reward: number;
  content?: string;
  screenshots?: string[];
}

// 定义订单类型接口
export interface Order {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  budget: number;
  assignedTo?: string;
  completionTime?: string;
  type: 'comment' | 'like' | 'share' | 'other';
  subOrders: SubOrder[];
  videoUrl?: string;
}

export interface SubOrder {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
  submitTime?: string;
  reviewTime?: string;
  reward: number;
  content?: string;
  screenshots?: string[];
}

// 订单管理页面组件
const PublisherOrdersPage: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [sortBy, setSortBy] = useState<'createdAt' | 'budget' | 'status'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  


  // 模拟获取订单数据
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // 在实际应用中，这里会调用API获取数据
        // const response = await fetch('/api/orders');
        // if (!response.ok) throw new Error('Failed to fetch orders');
        // const data = await response.json();
        // setOrders(data);

        // 静态模拟数据 - 替换循环随机生成的方式
        const mockOrders: Order[] = [
          {
            id: "order-1",
            orderNumber: "ORD-2023-0001",
            title: "社交媒体评论任务",
            description: "需要在各大社交媒体平台对指定内容进行评论互动，评论内容需积极正面，符合任务要求。",
            status: "completed",
            createdAt: "2023-11-01T10:00:00.000Z",
            updatedAt: "2023-11-05T15:30:00.000Z",
            budget: 500,
            assignedTo: "用户1",
            completionTime: "2023-11-05T15:30:00.000Z",
            type: "comment",
            subOrders: [
              {
                id: "suborder-1-1",
                orderId: "order-1",
                userId: "user-1",
                userName: "用户1",
                status: "completed",
                submitTime: "2023-11-03T14:20:00.000Z",
                reviewTime: "2023-11-04T09:15:00.000Z",
                reward: 100,
                content: "这是一个很好的产品，非常实用！",
                screenshots: ["https://picsum.photos/200/200"]
              },
              {
                id: "suborder-1-2",
                orderId: "order-1",
                userId: "user-2",
                userName: "用户2",
                status: "completed",
                submitTime: "2023-11-04T11:30:00.000Z",
                reviewTime: "2023-11-04T16:45:00.000Z",
                reward: 100,
                content: "已经使用了一段时间，体验非常棒！",
                screenshots: ["https://picsum.photos/201/201"]
              }
            ]
          },
          {
            id: "order-2",
            orderNumber: "ORD-2023-0002",
            title: "产品点赞推广",
            description: "为指定产品页面点赞并分享，提高产品曝光度和关注度。",
            status: "processing",
            createdAt: "2023-11-02T14:20:00.000Z",
            updatedAt: "2023-11-06T10:15:00.000Z",
            budget: 300,
            type: "like",
            subOrders: [
              {
                id: "suborder-2-1",
                orderId: "order-2",
                userId: "user-3",
                userName: "用户3",
                status: "processing",
                submitTime: "2023-11-05T09:30:00.000Z",
                reward: 75
              },
              {
                id: "suborder-2-2",
                orderId: "order-2",
                userId: "user-4",
                userName: "用户4",
                status: "pending",
                reward: 75
              },
              {
                id: "suborder-2-3",
                orderId: "order-2",
                userId: "user-5",
                userName: "用户5",
                status: "pending",
                reward: 75
              }
            ]
          },
          {
            id: "order-3",
            orderNumber: "ORD-2023-0003",
            title: "内容分享传播",
            description: "将指定内容分享到个人社交账号，要求有一定的粉丝基础，分享后需保留至少7天。",
            status: "reviewing",
            createdAt: "2023-11-03T09:15:00.000Z",
            updatedAt: "2023-11-07T14:45:00.000Z",
            budget: 800,
            type: "share",
            subOrders: [
              {
                id: "suborder-3-1",
                orderId: "order-3",
                userId: "user-6",
                userName: "用户6",
                status: "reviewing",
                submitTime: "2023-11-06T16:20:00.000Z",
                reward: 200,
                screenshots: ["https://picsum.photos/202/202", "https://picsum.photos/203/203"]
              },
              {
                id: "suborder-3-2",
                orderId: "order-3",
                userId: "user-7",
                userName: "用户7",
                status: "completed",
                submitTime: "2023-11-05T11:10:00.000Z",
                reviewTime: "2023-11-07T10:30:00.000Z",
                reward: 200,
                screenshots: ["https://picsum.photos/204/204"]
              }
            ]
          },
          {
            id: "order-4",
            orderNumber: "ORD-2023-0004",
            title: "市场调研问卷",
            description: "完成一份关于产品使用体验的市场调研问卷，需真实填写个人使用感受和建议。",
            status: "pending",
            createdAt: "2023-11-04T16:40:00.000Z",
            updatedAt: "2023-11-04T16:40:00.000Z",
            budget: 200,
            type: "other",
            subOrders: [
              {
                id: "suborder-4-1",
                orderId: "order-4",
                userId: "user-8",
                userName: "用户8",
                status: "pending",
                reward: 100
              },
              {
                id: "suborder-4-2",
                orderId: "order-4",
                userId: "user-9",
                userName: "用户9",
                status: "pending",
                reward: 100
              }
            ]
          },
          {
            id: "order-5",
            orderNumber: "ORD-2023-0005",
            title: "产品测试反馈",
            description: "试用新产品并提供详细的使用体验反馈和改进建议。",
            status: "completed",
            createdAt: "2023-11-05T11:30:00.000Z",
            updatedAt: "2023-11-08T09:20:00.000Z",
            budget: 600,
            assignedTo: "用户10",
            type: "other",
            subOrders: [
              {
                id: "suborder-5-1",
                orderId: "order-5",
                userId: "user-10",
                userName: "用户10",
                status: "completed",
                submitTime: "2023-11-07T15:45:00.000Z",
                reviewTime: "2023-11-08T09:20:00.000Z",
                reward: 600,
                content: "产品使用体验不佳，存在多个功能问题。",
                screenshots: ["https://picsum.photos/205/205"]
              }
            ]
          }
        ];

        setOrders(mockOrders);
      } catch (err) {
        setError('获取订单数据失败，请稍后重试。');
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 处理搜索
  const handleSearch = () => {
    // 搜索逻辑已在 useEffect 中实现，这里可以添加其他搜索相关的操作
    console.log('搜索关键词:', searchTerm);
  };

  // 处理日期范围选择器显示/隐藏
  const [showDatePicker, setShowDatePicker] = useState(false);
  // 日历组件点击外部关闭的引用
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // 点击外部关闭日历组件
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
  
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // 过滤和排序订单
  useEffect(() => {
    let result = [...orders];

    // 搜索过滤
    if (searchTerm) {
      result = result.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // 日期范围过滤
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间
      
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // 排序
    result.sort((a, b) => {
      if (sortBy === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'budget') {
        return sortDirection === 'asc' ? a.budget - b.budget : b.budget - a.budget;
      } else if (sortBy === 'status') {
        const statusOrder: Record<string, number> = {
          pending: 1,
          processing: 2,
          reviewing: 3,
          completed: 4,
          rejected: 5,
          cancelled: 6
        };
        return sortDirection === 'asc' 
          ? statusOrder[a.status] - statusOrder[b.status] 
          : statusOrder[b.status] - statusOrder[a.status];
      }
      return 0;
    });

    setFilteredOrders(result);
    setCurrentPage(1); // 重置到第一页
  }, [orders, searchTerm, statusFilter, dateRange, sortBy, sortDirection]);

  // 获取当前页的订单
  const getCurrentOrders = () => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return filteredOrders.slice(indexOfFirstRecord, indexOfLastRecord);
  };

  // 计算总页数
  const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 处理排序变化
  const handleSort = (field: 'createdAt' | 'budget' | 'status') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // 刷新订单数据
  const handleRefresh = () => {
    // 重新获取数据的逻辑
    setLoading(true);
    // 在实际应用中，这里会重新调用API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // 处理导出订单
  const handleExport = () => {
    // 导出订单的逻辑
    alert('导出订单功能将在后续实现');
  };

  // 复制订单号的状态管理
  const [copiedOrderNumber, setCopiedOrderNumber] = useState<string | null>(null);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  useEffect(() => {
    if (copiedOrderNumber) {
      const timer = setTimeout(() => {
        setCopiedOrderNumber(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedOrderNumber]);

  // 查看订单详情
  const viewOrderDetails = (orderId: string) => {
    router.push(`/publisher/orders/task-detail/${orderId}`);
  };

  // 显示复制成功提示
  const showCopySuccess = (message: string) => {
    setTooltipMessage(message);
    setShowCopyTooltip(true);
    setTimeout(() => {
      setShowCopyTooltip(false);
    }, 2000);
  };

  // 复制订单号并显示成功提示
  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      showCopySuccess('订单号已复制');
      setCopiedOrderNumber(orderNumber);
    }).catch(err => {
      console.error('复制失败:', err);
    });
  };

  // 复制评论
  const copyComment = (comment: string) => {
    navigator.clipboard.writeText(comment).then(() => {
      showCopySuccess('评论已复制');
    }).catch(err => {
      console.error('复制失败:', err);
    });
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 获取状态对应的中文名称和样式
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      pending: { text: '待处理', className: 'bg-yellow-100 text-yellow-800' },
      processing: { text: '进行中', className: 'bg-blue-100 text-blue-800' },
      reviewing: { text: '审核中', className: 'bg-purple-100 text-purple-800' },
      completed: { text: '已完成', className: 'bg-green-100 text-green-800' },
      rejected: { text: '已拒绝', className: 'bg-red-100 text-red-800' },
      cancelled: { text: '已取消', className: 'bg-gray-100 text-gray-800' }
    };
    return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
  };

  // 获取任务类型对应的图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <span className="text-blue-500">💬</span>;
      case 'like':
        return <span className="text-red-500">❤️</span>;
      case 'share':
        return <span className="text-green-500">🔗</span>;
      default:
        return <span className="text-gray-500">📋</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded-md"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 rounded-md"></div>
                ))}
              </div>
              <div className="h-10 bg-gray-200 rounded-md w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <ExclamationCircleOutlined className="h-12 w-12 text-red-500" />
              <p className="mb-2text-lg font-medium">{error}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ReloadOutlined className="h-4 w-4 mr-2" />
                重试
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 获取子订单各状态的统计数据
  const getSubOrderStats = (subOrders: SubOrder[]) => {
    const stats = {
      total: subOrders.length,
      pending: subOrders.filter(sub => sub.status === 'pending').length,
      processing: subOrders.filter(sub => sub.status === 'processing').length,
      reviewing: subOrders.filter(sub => sub.status === 'reviewing').length,
      completed: subOrders.filter(sub => sub.status === 'completed').length,
      rejected: subOrders.filter(sub => sub.status === 'rejected').length
    };
    return stats;
  };

  // 检查主订单是否所有子订单都已完成
  const isOrderFullyCompleted = (order: Order) => {
    return order.status === 'completed' && order.subOrders.every(sub => sub.status === 'completed');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        {/* 复制成功提示 */}
        {showCopyTooltip && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            {tooltipMessage}
          </div>
        )}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-3 items-center">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => router.push('/publisher/dashboard')}
                className="inline-flex items-center justify-center h-9 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md mb-2bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                返回工作台
              </button>
              <button
                onClick={() => router.push('/publisher/create')}
                className="inline-flex items-center justify-center h-9 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
              >
                发布新任务
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center justify-center h-9 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                <DownloadOutlined className="h-4 w-4 mr-2" />
                导出
              </button>
            </div>
          </div>

          {/* 操作栏 */}
          <div className="bg-white shadow-sm rounded-lg px-2 py-3 mb-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* 搜索框和搜索按钮 - 已分离 */}
              <div className="flex-grow max-w-md flex space-x-2">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchOutlined className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="搜索订单号、标题或描述"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md whitespace-nowrap"
                >
                  搜索
                </button>
              </div>

              {/* 筛选和操作按钮 */}
              <div className="grid grid-cols-5 gap-2 w-full">
                {/* 状态筛选 */}
                <div className="relative col-span-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none"
                  >
                    <option value="all">全部状态</option>
                    <option value="pending">待领取</option>
                    <option value="processing">进行中</option>
                    <option value="reviewing">审核中</option>
                    <option value="completed">已完成</option>
                  </select>
                </div>

                {/* 日期筛选 */}
                <div className="relative col-span-3" ref={calendarRef}>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md mb-2 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
                  >
                    <CalendarOutlined className="h-4 w-4 mr-2" />
                    {dateRange ? (
                      `${dateRange.start.split('-')[1]}/${dateRange.start.split('-')[2]} 至 ${dateRange.end.split('-')[1]}/${dateRange.end.split('-')[2]}`
                    ) : '日期'}
                    <DownOutlined className={`h-4 w-4 ml-2 transition-transform ${showDatePicker ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {/* 改进的日期日历组件 */}
                  {showDatePicker && (
                    <div 
                      className="fixed inset-0 z-50 flex items-start justify-center pt-[20%] bg-black bg-opacity-25"
                      onClick={() => setShowDatePicker(false)}
                    >
                      <div 
                        className="w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">日期</h3>
                            <button
                              className="text-gray-400 hover:text-gray-600 focus:outline-none"
                              onClick={() => setShowDatePicker(false)}
                              aria-label="关闭"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={dateRange?.start || ''}
                                  onChange={(e) => setDateRange(prev => ({ start: e.target.value, end: prev?.end || '' }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={dateRange?.end || ''}
                                  onChange={(e) => setDateRange(prev => ({ start: prev?.start || '', end: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-between pt-4 border-t border-gray-200">
                              <button
                                onClick={() => {
                                  setDateRange(null);
                                  setShowDatePicker(false);
                                }}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                清除
                              </button>
                              <button
                                onClick={() => setShowDatePicker(false)}
                                className="px-4 py-2 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                确认
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                
              </div>
            </div>
          </div>

          {/* 订单列表 - 移动优先的响应式卡片布局，适配全尺寸屏幕 */}
          <div className="overflow-hidden ">
            {/* 响应式布局：移动端单列，平板双列，桌面多列 */}
              {getCurrentOrders().length > 0 ? (
                <div className="grid grid-cols-1  lg:grid-cols-2 gap-4 ">
                  {getCurrentOrders().map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{order.title}</h3>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>订单号: {order.orderNumber}</span>
                            <button 
                              onClick={() => copyOrderNumber(order.orderNumber)}
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                              title="复制订单号"
                            >
                              复制
                            </button>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              console.log('Reordering order:', order.id);
                              // 这里可以添加实际的补单逻辑，比如调用API或导航到补单页面
                            }}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 transition-colors"
                          >
                            重新发布
                          </button>
                          <button 
                            onClick={() => viewOrderDetails(order.id)}
                            className="px-3 py-1 bg-gray-50 text-gray-600 rounded text-sm hover:bg-gray-100 transition-colors"
                          >
                            查看详情
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">总金额</div>
                          <div className="text-xl font-semibold text-green-600">¥{order.budget.toFixed(2)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">状态</div>
                          <div className="text-lg font-semibold text-blue-600">
                            {order.status === 'completed' ? '已完成' : 
                             order.status === 'processing' ? '进行中' : 
                             order.status === 'pending' ? '待开始' : 
                             order.status === 'reviewing' ? '审核中' : '已取消'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">子订单</div>
                          <div className="text-lg font-semibold">{order.subOrders.length}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">类型</div>
                          <div className="text-lg font-semibold text-gray-700">
                            {order.type === 'comment' ? '评论' : 
                             order.type === 'share' ? '分享' : 
                             order.type === 'like' ? '点赞' : '其他'}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>创建时间: {formatDate(order.createdAt)}</span>
                        <button 
                          onClick={() => copyComment(order.description)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="复制评论"
                        >
                          复制评论
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">没有找到匹配的订单</p>
                </div>
              )}

            {/* 分页控制 */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      显示第 <span className="font-medium">{(currentPage - 1) * recordsPerPage + 1}</span> 到 
                      <span className="font-medium"> {Math.min(currentPage * recordsPerPage, filteredOrders.length)} </span>
                      条，共 <span className="font-medium">{filteredOrders.length}</span> 条记录
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="sr-only">上一页</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* 页码按钮 */}
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border ${currentPage === pageNumber ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="sr-only">下一页</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublisherOrdersPage;