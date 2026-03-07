'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PendingTasksListResponse } from '../../types/task/pendingTasksListTypes';
import { useOptimization } from '@/components/optimization/OptimizationProvider';

export default function AwaitingReviewNotification() {
  // 路由对象
  const router = useRouter();
  // 待审核任务数量
  const [awaitingReviewCount, setAwaitingReviewCount] = useState(0);
  // 是否有新的待审核任务
  const [hasNewAwaitingReviewTasks, setHasNewAwaitingReviewTasks] = useState(false);
  // 轮询定时器引用
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // 正在刷新标志，避免重复请求
  const isRefreshingRef = useRef<boolean>(false);
  // 音频播放状态，避免乱序播放
  const isPlayingSoundRef = useRef<boolean>(false);
  // 是否首次检测到待审核任务
  const isFirstDetectionRef = useRef<boolean>(true);
  // 用户是否已交互
  const userInteractedRef = useRef<boolean>(false);
  // 上次检测到的任务数量
  const lastTaskCountRef = useRef<number>(0);
  // 使用优化工具
  const { globalFetch } = useOptimization();

  // 配置参数
  const config = {
    pollingInterval: 60000, // 固定60秒检测间隔   
  };

  // 格式化时间函数
  const formatTime = () => {
    const now = new Date();
    return now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // 检测用户交互
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteractedRef.current) {
        console.log(`[${formatTime()}] [AwaitingReviewNotification] 用户首次交互，获取音频播放权限`);
        userInteractedRef.current = true;
        // 预加载音频以获得播放权限
        const audio = new Audio('/videos/preview.mp3');
        audio.muted = true;
        audio.play().catch(() => {
          console.log(`[${formatTime()}] [AwaitingReviewNotification] 预加载音频失败（正常现象）`);
        });
      }
    };

    // 添加多种交互事件监听器
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleUserInteraction, { once: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserInteraction));
    };
  }, []);

  // 播放提示音
  const playNotificationSound = () => {
    if (isPlayingSoundRef.current) {
      console.log(`[${formatTime()}] [AwaitingReviewNotification] 音频正在播放中，跳过本次播放`);
      return;
    }
    
    try {
      const audio = new Audio('/videos/preview.mp3');
      audio.volume = 1;
      isPlayingSoundRef.current = true;
      
      console.log(`[${formatTime()}] [AwaitingReviewNotification] 开始播放提示音`);
      
      audio.play().then(() => {
        console.log(`[${formatTime()}] [AwaitingReviewNotification] 提示音播放成功`);
      }).catch(error => {
        console.log(`[${formatTime()}] [AwaitingReviewNotification] 播放提示音失败:`, error);
        isPlayingSoundRef.current = false;
      });
      
      audio.addEventListener('ended', () => {
        console.log(`[${formatTime()}] [AwaitingReviewNotification] 提示音播放结束`);
        isPlayingSoundRef.current = false;
      });
      
      audio.addEventListener('error', () => {
        console.log(`[${formatTime()}] [AwaitingReviewNotification] 提示音播放出错`);
        isPlayingSoundRef.current = false;
      });
    } catch (error) {
      console.error(`[${formatTime()}] [AwaitingReviewNotification] 播放提示音失败:`, error);
      isPlayingSoundRef.current = false;
    }
  };

  // 尝试获取音频播放权限
  const tryGetAudioPermission = () => {
    if (!userInteractedRef.current) {
      console.log(`[${formatTime()}] [AwaitingReviewNotification] 尝试获取音频播放权限`);
      // 创建一个不可见的音频元素并尝试播放，以获取音频播放权限
      const audio = new Audio('/videos/preview.mp3');
      audio.muted = true;
      audio.play().then(() => {
        console.log(`[${formatTime()}] [AwaitingReviewNotification] 获取到音频播放权限`);
        userInteractedRef.current = true;
      }).catch(() => {
        console.log(`[${formatTime()}] [AwaitingReviewNotification] 获取音频播放权限失败（需要用户交互）`);
      });
    }
  };

  // 获取待审核任务数量
  const fetchAwaitingReviewCount = async () => {

    console.log(`[${formatTime()}] [AwaitingReviewNotification] 开始检测待审核任务`);
    
    // 尝试获取音频播放权限
    tryGetAudioPermission();
    
    isRefreshingRef.current = true;
    
    try {
      console.log(`[${formatTime()}] [AwaitingReviewNotification] 发送API请求获取待审核任务列表`);
      const data: PendingTasksListResponse = await globalFetch('/api/task/pendingTasksList', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log(`[${formatTime()}] [AwaitingReviewNotification] API请求完成，开始处理响应数据`);
      console.log(`[${formatTime()}] [AwaitingReviewNotification] 原始响应数据:`, data);
      
      if (data.success && data.data) {
        const taskList = data.data.list || [];
        const newCount = taskList.length;
        
        console.log(`[${formatTime()}] [AwaitingReviewNotification] 检测到待审核任务数量: ${newCount}`);
        console.log(`[${formatTime()}] [AwaitingReviewNotification] 待审核任务列表:`, taskList);
        
        if (newCount > 0) {
          console.log(`[${formatTime()}] [AwaitingReviewNotification] 有待审核任务，设置提示状态为true`);
          setHasNewAwaitingReviewTasks(true);
          
          // 只要有待审核任务就播放提示音
          console.log(`[${formatTime()}] [AwaitingReviewNotification] 有待审核任务，准备播放提示音`);
          playNotificationSound();
        } else {
          console.log(`[${formatTime()}] [AwaitingReviewNotification] 没有待审核任务，重置提示状态`);
          setHasNewAwaitingReviewTasks(false);
        }
        
        // 更新上次检测到的任务数量
        lastTaskCountRef.current = newCount;
        
        console.log(`[${formatTime()}] [AwaitingReviewNotification] 更新待审核任务数量为: ${newCount}`);
        setAwaitingReviewCount(newCount);
      } else {
        console.log(`[${formatTime()}] [AwaitingReviewNotification] API响应失败或无数据`);
        
        // 检查是否是Token失效
        if (data.code === 401) {
          console.log(`[${formatTime()}] [AwaitingReviewNotification] Token已失效，重定向到登录页面`);
          // 重定向到登录页面
          router.push('/publisher/auth/login');
        }
        
        setAwaitingReviewCount(0);
        setHasNewAwaitingReviewTasks(false);
        lastTaskCountRef.current = 0;
      }
    } catch (error: any) {
      console.error(`[${formatTime()}] [AwaitingReviewNotification] 获取待审核任务数量失败:`, error);
      
      // 检查是否是Token失效
      if (error.response?.data?.code === 401 || error.code === 401) {
        console.log(`[${formatTime()}] [AwaitingReviewNotification] Token已失效，重定向到登录页面`);
        // 重定向到登录页面
        router.push('/publisher/auth/login');
      }
      
      setAwaitingReviewCount(0);
      setHasNewAwaitingReviewTasks(false);
      lastTaskCountRef.current = 0;
    } finally {
      isRefreshingRef.current = false;
      console.log(`[${formatTime()}] [AwaitingReviewNotification] 检测完成`);
    }
  };

  // 处理查看待审核任务
  const handleViewAwaitingReview = () => {
    // 使用 router.push 实现无感导航，避免页面重载
    router.push('/publisher/dashboard?tab=AwaitingReview');
  };

  // 倒计时引用
  const countdownRef = useRef<number>(config.pollingInterval / 1000);
  // 倒计时定时器引用
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 开始倒计时
  const startCountdown = () => {
    countdownRef.current = config.pollingInterval / 1000;
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    countdownIntervalRef.current = setInterval(() => {
      // 只有当不在刷新状态时才更新倒计时
      if (!isRefreshingRef.current) {
        countdownRef.current--;
        
        // 每5秒输出一次倒计时日志
        if (countdownRef.current % 5 === 0 && countdownRef.current > 0) {
          console.log(`[${formatTime()}] [AwaitingReviewNotification] 下次检测倒计时: ${countdownRef.current}秒`);
        }
        
        // 当倒计时为0时，触发检测
        if (countdownRef.current <= 0) {
          console.log(`[${formatTime()}] [AwaitingReviewNotification] 倒计时结束，触发检测`);
          handleCountdownComplete();
        }
      }
    }, 1000);
  };

  // 暂停倒计时（保持当前倒计时值）
  const pauseCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
      console.log(`[${formatTime()}] [AwaitingReviewNotification] 暂停倒计时，当前剩余: ${countdownRef.current}秒`);
    }
  };

  // 恢复倒计时
  const resumeCountdown = () => {
    if (!countdownIntervalRef.current) {
      startCountdown();
      console.log(`[${formatTime()}] [AwaitingReviewNotification] 恢复倒计时`);
    }
  };

  // 处理倒计时完成
  const handleCountdownComplete = async () => {
    // 暂停倒计时
    pauseCountdown();
    
    // 执行检测
    await fetchAwaitingReviewCount();
    
    // 重新开始倒计时
    startCountdown();
  };

  // 初始化和设置轮询
  useEffect(() => {
    console.log(`[${formatTime()}] [AwaitingReviewNotification] 组件初始化，开始首次检测`);
    
    // 重置刷新标志
    isRefreshingRef.current = false;
    
    // 初始获取待审核任务数量
    fetchAwaitingReviewCount().then(() => {
      // 首次检测完成后开始倒计时
      startCountdown();
    });

    // 清理函数
    return () => {
      console.log(`[${formatTime()}] [AwaitingReviewNotification] 组件卸载，清理资源`);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* 新的待审核任务提示 */}
      {hasNewAwaitingReviewTasks && (
        <div className="mx-4 mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-md shadow-sm flex items-center justify-between z-60 mt-2">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-yellow-700 font-medium">有新的待审核任务 ({awaitingReviewCount})</span>
          </div>
          <button
            onClick={handleViewAwaitingReview}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            查看
          </button>
        </div>
      )}
    </>
  );
}
