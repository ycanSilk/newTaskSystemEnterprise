'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 定义子任务数据类型
interface SubTask {
  id: string;
  parentId: string;
  status: 'sub_progress' | 'sub_completed' | 'sub_pending_review' | 'waiting_collect';
  commenterId: string;
  commenterName: string;
  commentContent: string;
  commentTime: string;
  screenshotUrl: string;
  reviewLink?: string; // 上评链接
}

// 定义任务数据类型
interface Task {
  id: string;
  orderNumber: string;
  videoUrl: string;
  mention: string;
  status: 'main_progress' | 'main_completed';
  quantity: number;
  completedQuantity: number;
  unitPrice: number;
  taskRequirements: string;
  publishTime: string;
  deadline: string;
  subOrders: SubTask[];
  taskType?: string; // 任务类型
}

export default function TaskDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams?.get('id');
  
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 添加选项卡和排序状态
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'completed', 'inProgress', 'inReview', 'waitingCollect'
  const [sortBy, setSortBy] = useState('commentTime'); // 'commentTime', 'status', 'commenterName'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  useEffect(() => {
    if (taskId) {
      fetchTaskDetail(taskId);
    } else {
      setError('未提供任务ID');
      setLoading(false);
    }
  }, [taskId]);

  const fetchTaskDetail = async (id: string) => {
    try {
      setLoading(true);
      
      // 调用API获取任务详情
      const url = `/api/maintaskdetail?taskId=${id}`;
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store' as RequestCache
      };
      
      // 发送请求
      const response = await fetch(url, requestOptions);
      
      // 检查响应是否成功
      if (!response.ok) {
        setError(`API请求失败: ${response.status}`);
        return;
      }
      
      // 解析响应数据
      const result = await response.json();
      
      if (result.success) {
        setTask(result.data);
      } else {
        setError(result.message || '获取任务详情失败');
      }
    } catch (err) {
      setError(`获取任务详情时发生错误: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubTaskAction = (subTaskId: string, action: string) => {
    alert(`对子任务 ${subTaskId} 执行 ${action} 操作`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">加载中...</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8 flex justify-center">
          <div className="text-gray-500">正在加载任务详情...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">错误</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">任务未找到</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-yellow-700">未找到指定的任务</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 统计子任务状态
  const statusCounts = {
    completed: task.subOrders.filter(sub => sub.status === 'sub_completed').length,
    waitingCollect: task.subOrders.filter(sub => sub.status === 'waiting_collect').length,
    inReview: task.subOrders.filter(sub => sub.status === 'sub_pending_review').length,
    inProgress: task.subOrders.filter(sub => sub.status === 'sub_progress').length,
  };

  // 状态映射函数
  const getStatusText = (status: string) => {
    switch (status) {
      // 主任务状态
      case 'main_progress':
        return '进行中';
      case 'main_completed':
        return '已完成';
      // 子任务状态
      case 'sub_completed':
        return '已完成';
      case 'sub_progress':
        return '进行中';
      case 'waiting_collect':
        return '待领取';
      case 'sub_pending_review':
        return '待审核';
      default:
        return status;
    }
  };

  // 状态样式映射函数
  const getStatusStyle = (status: string) => {
    switch (status) {
      // 主任务状态
      case 'main_progress':
        return 'bg-blue-100 text-blue-800';
      case 'main_completed':
        return 'bg-green-100 text-green-800';
      // 子任务状态
      case 'sub_completed':
        return 'bg-green-100 text-green-800';
      case 'sub_progress':
        return 'bg-blue-100 text-blue-800';
      case 'waiting_collect':
        return 'bg-yellow-100 text-yellow-800';
      case 'sub_pending_review':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 获取任务类型名称
  const getTaskTypeName = (taskType?: string): string => {
    const taskTypeMap: Record<string, string> = {
      'comment_middle': '中评任务',
      'top_middle_review': '上中评任务',
      'account_rental': '账号出租',
      'video_send': '视频分享'
    };
    return taskTypeMap[taskType || ''] || taskType || '评论任务';
  };

  // 过滤和排序子订单
  let filteredSubOrders = task.subOrders;
  
  // 根据选项卡过滤
  if (activeTab !== 'all') {
    const statusMap: Record<string, string> = {
      'completed': 'sub_completed',
      'inProgress': 'sub_progress',
      'inReview': 'sub_pending_review',
      'waitingCollect': 'waiting_collect'
    };
    filteredSubOrders = filteredSubOrders.filter(sub => sub.status === statusMap[activeTab]);
  }
  
  // 根据选择的排序方式排序
  const sortedSubOrders = [...filteredSubOrders].sort((a, b) => {
    if (sortBy === 'commentTime') {
      const timeA = new Date(a.commentTime || 0).getTime();
      const timeB = new Date(b.commentTime || 0).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    } else if (sortBy === 'status') {
      const statusOrder = {
        'sub_completed': 4,
        'sub_progress': 3,
        'sub_pending_review': 2,
        'waiting_collect': 1
      };
      const statusA = statusOrder[a.status] || 0;
      const statusB = statusOrder[b.status] || 0;
      return sortOrder === 'desc' ? statusB - statusA : statusA - statusB;
    } else if (sortBy === 'commenterName') {
      const nameA = a.commenterName || '';
      const nameB = b.commenterName || '';
      return sortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">订单详情</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 任务基本信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">订单信息</h2>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(task.status)}`}>
              {getStatusText(task.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">订单编号</p>
              <p className="font-medium">{task.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">任务类型</p>
              <p className="font-medium">{getTaskTypeName(task.taskType)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">单价</p>
              <p className="font-medium">¥{task.unitPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">总数量</p>
              <p className="font-medium">{task.quantity} 条</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">已完成</p>
              <p className="font-medium">{task.completedQuantity} 条</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">发布时间</p>
              <p className="font-medium">{new Date(task.publishTime).toLocaleString('zh-CN')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">截止时间</p>
              <p className="font-medium">{new Date(task.deadline).toLocaleString('zh-CN')}</p>
            </div>
          </div>
           <div className="mb-4">
               <p className="text-sm text-gray-600">视频链接</p>
               <a 
                 href={task.videoUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-blue-600 hover:text-blue-800 underline break-all"
               >
                 {task.videoUrl}
               </a>
             </div>
          <div>
            <p className="text-sm text-gray-600">订单要求</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-800">{task.taskRequirements}</p>
            </div>
          </div>
        </div>

        {/* 子任务统计 - 重构为选项卡交互形式 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">子任务统计</h2>
          
          {/* 子订单筛选下拉菜单 */}
          <div className="mb-6">
            <div className="flex items-center">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="overflow-hidden w-full p-3 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option className='w-full overflow-hidden' value="all">全部子订单</option>
                <option className='w-full overflow-hidden' value="completed">已完成 ({statusCounts.completed})</option>
                <option className='w-full overflow-hidden' value="inProgress">进行中 ({statusCounts.inProgress})</option>
                <option className='w-full overflow-hidden' value="inReview">待审核 ({statusCounts.inReview})</option>
                <option className='w-full overflow-hidden' value="waitingCollect">待领取 ({statusCounts.waitingCollect})</option>
              </select>
            </div>
          </div>

          {/* 原始统计卡片保留 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <div className="text-sm text-green-700">已完成</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</div>
              <div className="text-sm text-blue-700">进行中</div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.inReview}</div>
              <div className="text-sm text-orange-700">待审核</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.waitingCollect}</div>
              <div className="text-sm text-yellow-700">待领取</div>
            </div>
          </div>
        </div>

        {/* 子任务列表 - 添加排序功能 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          {/* 排序选择器 */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">子任务列表</h2>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">排序方式：</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="commentTime-desc">最新发布时间（降序）</option>
                <option value="commentTime-asc">最新发布时间（升序）</option>
                <option value="status-desc">状态（降序）</option>
                <option value="status-asc">状态（升序）</option>
                <option value="commenterName-desc">用户名（降序）</option>
                <option value="commenterName-asc">用户名（升序）</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {sortedSubOrders.length > 0 ? (
              sortedSubOrders.map((subTask) => (
                <div key={subTask.id} className="border border-gray-200 rounded-lg p-4">
                  {/* 订单头部信息 - 优化布局 */}
                  <div className="mb-3">
                    {/* 订单编号区域 */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">订单编号：{subTask.id}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(subTask.id).then(() => {
                            // 创建提示元素
                            const toast = document.createElement('div');
                            toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
                            toast.textContent = '订单编号已复制';
                            document.body.appendChild(toast);
                            
                            // 2秒后移除提示
                            setTimeout(() => {
                              toast.remove();
                            }, 2000);
                          });
                        }}
                        className="px-2 bg-blue-600 text-white rounded  hover:bg-blue-700 transition-colors"
                      >
                        复制
                      </button>
                    </div>
                    
                    {/* 订单状态移至订单编号下方 */}
                    <div className="flex items-center">
                      <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusStyle(subTask.status)}`}>
                        {getStatusText(subTask.status)}
                      </span>
                    </div>
                  </div>
                
                  {subTask.commenterName ? (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">领取用户：</p>
                      <p className="font-medium">{subTask.commenterName}</p>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">领取用户：</p>
                      <p className="font-medium text-gray-400">暂无信息</p>
                    </div>
                  )}
                
                  {subTask.commentContent ? (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">评论内容</p>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-800">{subTask.commentContent}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">评论内容</p>
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded flex items-center justify-center h-20">
                        <p className="text-gray-400">暂无评论内容</p>
                      </div>
                    </div>
                  )}
                
                  {subTask.commentTime ? (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">提交时间</p>
                      <p className="font-medium">{new Date(subTask.commentTime).toLocaleString('zh-CN')}</p>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">提交时间</p>
                      <p className="font-medium text-gray-400">暂无信息</p>
                    </div>
                  )}
                
                  {/* 上评链接展示 - 仅对需要的任务类型显示 */}
                  {subTask.reviewLink && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">上评链接</p>
                      <a 
                        href={subTask.reviewLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {subTask.reviewLink}
                      </a>
                    </div>
                  )}
                
                  <div>
                    <p className="text-sm text-gray-600 mb-1">截图</p>
                    {subTask.screenshotUrl ? (
                      <div className="bg-gray-100 rounded flex items-center justify-center">
                        <img 
                          src={subTask.screenshotUrl} 
                          alt="评论截图" 
                          className="max-h-40 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-100 border border-gray-200 rounded flex items-center justify-center h-40">
                        <p className="text-gray-400">暂无截图</p>
                      </div>
                    )}
                  </div>
                
                  {/* 待审核订单的操作按钮移至最底部 */}
                  {subTask.status === 'sub_pending_review' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-3 sm:space-x-4 w-full">
                        <button
                          onClick={() => handleSubTaskAction(subTask.id, '通过')}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          通过
                        </button>
                        <button
                          onClick={() => handleSubTaskAction(subTask.id, '驳回')}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          驳回
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-500">暂无符合条件的子任务</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 移动端优化：确保整个页面内容在小屏幕上正确显示 */}
        <style jsx global>{`
          @media (max-width: 640px) {
            .task-detail-container {
              padding: 1rem !important;
            }
            
            /* 优化按钮触摸区域 */
            button {
              min-height: 44px;
              min-width: 44px;
              padding-top: 1;
              padding-bottom: 1;
            }
            
            /* 确保字体在小屏幕上依然清晰可读 */
            body {
              -webkit-text-size-adjust: 100%;
            }
            
            /* 修复移动端下拉菜单超过屏幕的问题 */
            select {
              /* 设置最大宽度为父容器宽度 */
              max-width: 100%;
              /* 确保内容不会溢出 */
              box-sizing: border-box;
              /* 移除默认的下拉箭头，使用自定义样式 */
              appearance: none;
              /* 添加自定义下拉箭头 */
              background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3E%3Cpath stroke=%22%23666%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22M6 8l4 4 4-4%22/%3E%3C/svg%3E");
              background-position: right 0.75rem center;
              background-repeat: no-repeat;
              background-size: 1.5em 1.5em;
              padding-right: 2.5rem;
            }
          }
          }
        `}</style>
      </div>
    </div>
  );
}