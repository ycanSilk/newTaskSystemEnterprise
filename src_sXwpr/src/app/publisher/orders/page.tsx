'use client'
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOutlined, FilterOutlined, CalendarOutlined, DownOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons';


// API响应类型定义
export interface CommentDetail {
  mainTaskId: string;
  commentType: string;
  linkUrl1: string;
  unitPrice1: number;
  quantity1: number;
  commentText1: string;
  commentImages1: string;
  mentionUser1: string;
  linkUrl2: string;
  unitPrice2: number;
  quantity2: number;
  commentText2: string;
  commentImages2: string;
  mentionUser2: string;
  minWords: number;
  maxWords: number;
  requireImages: boolean;
  imageCount: number;
  requireScreenshot: boolean;
  screenshotRequirements: string;
}

export interface TaskItem {
  id: string;
  publisherId: string;
  publisherName: string;
  title: string;
  description: string;
  platform: string;
  taskType: string;
  status: string;
  totalQuantity: number;
  completedQuantity: number;
  availableCount: number;
  unitPrice: number;
  totalAmount: number;
  deadline: string;
  requirements: string;
  publishedTime: string;
  completedTime: string;
  createTime: string;
  updateTime: string;
  pendingSubTaskCount: number;
  acceptedSubTaskCount: number;
  submittedSubTaskCount: number;
  completedSubTaskCount: number;
  completionRate: number;
  remainingDays: number;
  isExpired: boolean;
  publisherAvatar: string;
  publisherTaskCount: number;
  publisherSuccessRate: number;
  commentDetail: CommentDetail;
  canAccept: boolean;
  cannotAcceptReason: string;
}

export interface PaginationData {
  list: TaskItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiResponse {
  code: number;
  message: string;
  data: PaginationData;
  success: boolean;
  timestamp: number;
}

// 订单管理页面组件
const PublisherOrdersPage: React.FC = () => {
  const router = useRouter();
  const [allTasks, setAllTasks] = useState<TaskItem[]>([]); // 存储所有获取的订单
  const [tasks, setTasks] = useState<TaskItem[]>([]); // 存储过滤后的订单
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // 输入框中的搜索词
  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // 实际用于过滤的搜索词
  // 初始化订单状态筛选条件 - 从localStorage读取或默认'all'
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    if (typeof window === 'undefined') return 'all';
    const saved = localStorage.getItem('publisherOrdersStatusFilter');
    return saved && ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'all'].includes(saved) ? saved : 'all';
  });
  // 初始化日期筛选条件 - 从localStorage读取或默认null
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('publisherOrdersDateRange');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.start && parsed.end) {
          return parsed;
        }
      } catch (e) {
        // Ignore invalid JSON
      }
    }
    return null;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sortBy, setSortBy] = useState<'createTime' | 'unitPrice' | 'status' | 'deadline'>('createTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [totalTasks, setTotalTasks] = useState(0);

// 监听点击外部区域自动关闭日期选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDatePicker && datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    // 添加点击事件监听器
    document.addEventListener('mousedown', handleClickOutside);
    
    // 清理函数
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // 获取订单数据
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // 构造请求体 - 获取所有订单数据，不传递筛选条件
      const requestBody = {
        page: 0,
        size: 10, // 增加获取数量以覆盖所有订单
        sortField: "createTime",
        sortOrder: "DESC",
        platform: "DOUYIN",
        taskType: "COMMENT",
        minPrice: 1,
        maxPrice: 9999,
        keyword: activeSearchTerm,
      };
      const response = await fetch('/api/task/mypublishedlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('Response OK');
      }
      
      const responseData: ApiResponse = await response.json();
      
      if (responseData.success && responseData.data?.list) {
        setAllTasks(responseData.data.list); // 将所有订单存储在allTasks中
        setTasks(responseData.data.list); // 初始显示所有订单
        setTotalTasks(responseData.data.total);
      } else {
        throw new Error(responseData.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取订单数据失败');
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };
  // 页面加载时获取订单数据
  useEffect(() => {
    fetchOrders();
  }, []);



  // 本地筛选逻辑 - 当筛选条件变化时过滤数据
  useEffect(() => {
    if (!allTasks.length) return;
    
    let filtered = [...allTasks];
    
    // 状态筛选
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // 日期筛选
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59); // 包含结束日期的整个一天
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createTime);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    // 搜索关键词筛选
    if (activeSearchTerm.trim()) {
      const term = activeSearchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(term) || 
        order.title.toLowerCase().includes(term) || 
        order.description.toLowerCase().includes(term)
      );
    }
    
    // 排序
    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortBy];
        let bVal: any = b[sortBy];
        
        // 处理日期类型
          if (sortBy === 'createTime' || sortBy === 'deadline') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          }
        
        // 处理状态类型 - 使用固定顺序
        if (sortBy === 'status') {
          const statusOrder = { 'PENDING': 0, 'IN_PROGRESS': 1, 'SUBMITTED': 2, 'COMPLETED': 3 };
          aVal = statusOrder[aVal as keyof typeof statusOrder] || 4;
          bVal = statusOrder[bVal as keyof typeof statusOrder] || 4;
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setTasks(filtered);
  }, [allTasks, statusFilter, dateRange, activeSearchTerm, sortBy, sortDirection]);
  // 保存筛选条件到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('publisherOrdersDateRange', JSON.stringify(dateRange));
    }
  }, [dateRange]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('publisherOrdersStatusFilter', statusFilter);
    }
  }, [statusFilter]);
  // 处理搜索
  const handleSearch = () => {
    console.log('搜索关键词:', searchTerm);
    setActiveSearchTerm(searchTerm);
  }
  // 点击外部关闭日历组件
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDatePicker && datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
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

  // 筛选条件变化时触发数据更新
  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateRange, activeSearchTerm, sortBy, sortDirection]);

  // 获取当前页的订单
  const getCurrentOrders = () => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return tasks.slice(indexOfFirstRecord, indexOfLastRecord);
  };

  // 计算总页数
  const totalPages = Math.ceil(tasks.length / recordsPerPage);
  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  // 处理排序变化
  const handleSort = (field: 'createTime' | 'unitPrice' | 'status') => {
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
  useEffect(() => {
    if (copiedOrderNumber) {
      const timer = setTimeout(() => {
        setCopiedOrderNumber(null);
      }, 1000); // 改为1秒后自动隐藏
      return () => clearTimeout(timer);
    }
  }, [copiedOrderNumber]);

  // 查看订单详情
  const viewOrderDetails = (orderId: string) => {
    router.push(`/publisher/orders/task-detail/${orderId}`);
  };

  // 复制订单号并显示成功提示
  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopiedOrderNumber(orderNumber);
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
      COMPLETED: { text: '已完成', className: 'bg-green-100 text-green-800' },
      SUBMITTED: { text: '待审核', className: 'bg-purple-100 text-purple-800' },
      IN_PROGRESS: { text: '进行中', className: 'bg-blue-100 text-blue-800' },
      PENDING: { text: '待领取', className: 'bg-yellow-100 text-yellow-800' },
    };
    return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto py-4 px-2">
          <div className="bg-white shadow-sm rounded-lg p-2">
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
        <div className="max-w-7xl mx-auto py-4 px-2">
          <div className="bg-white shadow-sm rounded-lg p-2">
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
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 全局复制成功提示 */}
      {copiedOrderNumber && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-600 text-white text-sm px-4 py-2 rounded-md shadow-lg transition-opacity duration-300 opacity-100">
            复制成功
          </div>
        </div>
      )}
      <main className="flex-grow">
        <div className="">
          {/* 操作栏 */}
          <div className="bg-white shadow-sm mb-1">
            {/* 第一行：搜索框和搜索按钮 */}
            <div className="flex items-center space-x-3 mb-1 p-2">
              <div className="flex-grow">
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
              </div>
              
              <button 
                onClick={handleSearch} 
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md whitespace-nowrap"
              >
                搜索
              </button>
            </div>
            
            {/* 第二行：状态筛选和日期筛选 */}
            <div className="flex flex-wrap items-center space-x-3 p-2">
               {/* 日期筛选按钮和选择器 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
                >
                  <CalendarOutlined className="h-4 w-4 mr-2" />
                  {dateRange ? `${dateRange.start.split('-')[1]}/${dateRange.start.split('-')[2]} 至 ${dateRange.end.split('-')[1]}/${dateRange.end.split('-')[2]}` : '日期'}
                  <DownOutlined className={`h-4 w-4 ml-2 ${showDatePicker ? 'transform rotate-180' : ''}`} />
                </button>
                
                {/* 日期选择器弹窗 */}
                {showDatePicker && (
                  <div ref={datePickerRef} className="absolute z-10 mt-1 bg-white rounded-md shadow-lg p-2 border border-gray-200 w-[270px] w-max-[300px] left-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">开始日期</label>
                        <input
                          type="date"
                          value={dateRange?.start || ''}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            let newEnd = dateRange?.end || '';
                            
                            // 开始日期不能晚于结束日期
                            if (newEnd && newStart > newEnd) {
                              newEnd = newStart;
                            }
                            
                            setDateRange({ start: newStart, end: newEnd });
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">结束日期</label>
                        <input
                          type="date"
                          value={dateRange?.end || ''}
                          onChange={(e) => {
                            const newEnd = e.target.value;
                            let newStart = dateRange?.start || '';
                            
                            // 结束日期不能早于开始日期
                            if (newStart && newStart > newEnd) {
                              newStart = newEnd;
                            }
                            
                            setDateRange({ start: newStart, end: newEnd });
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-3 space-x-2">
                      <button
                        onClick={() => {
                          setDateRange({ start: '', end: '' });
                          setShowDatePicker(false);
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50"
                      >
                        重置
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                      >
                        确定
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* 状态筛选 */}
              <select 
                 value={statusFilter} 
                 onChange={(e) => setStatusFilter(e.target.value)} 
                 className="px-3 py-2 pr-8 border border-gray-300 text-sm rounded-md whitespace-nowrap appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               >
                <option value="all">全部状态</option>
                <option value="PENDING">异常订单</option>
                <option value="IN_PROGRESS">进行中</option>
                <option value="SUBMITTED">审核中</option>
                <option value="COMPLETED">已完成</option>
              </select>
            </div>
          </div>
          
          {/* 订单列表 */}
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              <p className="font-medium">加载失败</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg p-2">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <p>暂无订单数据</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((order) => (
                    <div key={order.id} className="p-2 space-y-1 border border-gray-200 rounded-sm hover:shadow-md transition-shadow relative">
                      <div className="flex items-center flex-nowrap gap-2 overflow-hidden">
                        <div className="flex items-center w-full">
                          <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap w-[78%]">订单号：{order.id}</span>
                          <div className="ml-2 w-[20%]">
                            <button 
                              onClick={() => copyOrderNumber(order.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                            >
                              <CopyOutlined className="h-4 w-4 mr-1" />
                              复制
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="">
                        订单状态：<span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(order.status).className}`}>{getStatusInfo(order.status).text}</span>
                      </div>
                      <div className="">发布时间：{formatDate(order.createTime)}</div>
                      <div className="">截止时间：{formatDate(order.deadline)}</div>
                      <div className="">任务标题：{order.title}</div>
                      <div className="">任务描述：{order.description}</div>
                      {/* 预算信息 */}
                      <div className="">任务金额：¥{order.totalAmount}</div>

                      {/* 操作按钮 */}
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => viewOrderDetails(order.id)}
                          className="px-4 py-2 mr-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublisherOrdersPage;