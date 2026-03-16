'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 定义子任务数据类型 - 视频推荐任务特定
interface VideoSendSubTask {
  id: string;
  parentId: string;
  status: 'sub_progress' | 'sub_completed' | 'sub_pending_review' | 'waiting_collect';
  commenterId: string;
  commenterName: string;
  commentTime: string;
  screenshotUrl: string;
  sharePlatform: string;
  viewCount: number;
  shareLink: string;
}

// 定义任务数据类型 - 视频推荐任务特定
interface VideoSendTask {
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
  taskType: string;
  title: string;
  videoInfo: {
    duration: string;
    category: string;
    requiredPlatforms: string[];
    minViews: number;
    requireScreenshot: boolean;
  };
  subOrders: VideoSendSubTask[];
}

export default function VideoSendDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams?.get('id');
  
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<VideoSendTask | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const url = `/api/task-detail?taskId=${id}`;
      
      // 构建请求选项
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
        const errorText = await response.text();
        setError(`API请求失败: ${response.status}`);
        return;
      }
      
      // 解析响应数据
      const result = await response.json();
      
      if (result.success && result.data.taskType === 'video_send') {
        setTask(result.data);
      } else if (result.success && result.data.taskType !== 'video_send') {
        setError('此任务不是视频推荐任务');
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

  // 平台名称映射
  const getPlatformName = (platform: string) => {
    const platformMap: Record<string, string> = {
      'wechat': '微信',
      'qq': 'QQ',
      'weibo': '微博',
      'douyin': '抖音',
      'kuaishou': '快手',
      'xiaohongshu': '小红书'
    };
    return platformMap[platform] || platform;
  };

  // 视频分类映射
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'entertainment': '娱乐',
      'food': '美食',
      'travel': '旅游',
      'tech': '科技',
      'fashion': '时尚',
      'education': '教育',
      'sports': '体育'
    };
    return categoryMap[category] || category;
  };

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
          <h1 className="text-lg font-bold">视频推荐任务详情</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 任务基本信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">{task.title}</h2>
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
              <p className="font-medium">视频推荐任务</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">单价</p>
              <p className="font-medium">¥{task.unitPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">总数量</p>
              <p className="font-medium">{task.quantity} 次</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">已完成</p>
              <p className="font-medium">{task.completedQuantity} 次</p>
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
          
          <div>
              <p className="text-sm text-gray-600 mb-2">视频链接</p>
              <a 
                href={task.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {task.videoUrl}
              </a>
            </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">任务要求</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-800">{task.taskRequirements}</p>
            </div>
          </div>
        </div>

        {/* 视频信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">视频信息</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">视频时长</p>
              <p className="font-medium">{task.videoInfo.duration}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">视频分类</p>
              <p className="font-medium">{getCategoryName(task.videoInfo.category)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">需要分享平台</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {task.videoInfo.requiredPlatforms.map((platform, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {getPlatformName(platform)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">最低浏览量</p>
              <p className="font-medium">{task.videoInfo.minViews} 次</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">需要截图</p>
              <p className="font-medium">{task.videoInfo.requireScreenshot ? '是' : '否'}</p>
            </div>
          </div>
        </div>

        {/* 子任务统计 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">子任务统计</h2>
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

        {/* 子任务列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">子任务列表</h2>
          <div className="space-y-4">
            {task.subOrders.map((subTask) => (
              <div key={subTask.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">订单编号： {subTask.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(subTask.status)}`}>
                          {getStatusText(subTask.status)}
                        </span>
                      </div>
                  {subTask.status === 'sub_pending_review' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSubTaskAction(subTask.id, '通过')}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        通过
                      </button>
                      <button
                        onClick={() => handleSubTaskAction(subTask.id, '驳回')}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        驳回
                      </button>
                    </div>
                  )}
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
                
                {subTask.sharePlatform ? (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">分享平台</p>
                    <p className="font-medium">{getPlatformName(subTask.sharePlatform)}</p>
                  </div>
                ) : (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">分享平台</p>
                    <p className="font-medium text-gray-400">暂无信息</p>
                  </div>
                )}
                
                {subTask.viewCount !== undefined ? (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">浏览量</p>
                    <p className="font-medium">{subTask.viewCount} 次
                      <span className={`ml-2 ${subTask.viewCount >= task.videoInfo.minViews ? 'text-green-600' : 'text-red-600'}`}>
                        ({subTask.viewCount >= task.videoInfo.minViews ? '已达标' : '未达标'})
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">浏览量</p>
                    <p className="font-medium text-gray-400">暂无信息</p>
                  </div>
                )}
                
                {subTask.shareLink && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">分享链接</p>
                    <a 
                      href={subTask.shareLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                    >
                      {subTask.shareLink}
                    </a>
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
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">截图</p>
                  {subTask.screenshotUrl ? (
                    <div className="bg-gray-100 rounded flex items-center justify-center">
                      <img 
                        src={subTask.screenshotUrl} 
                        alt="分享截图" 
                        className="max-h-40 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 border border-gray-200 rounded flex items-center justify-center h-40">
                      <p className="text-gray-400">暂无截图</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}