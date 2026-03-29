'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PendingTasksListResponse } from '../../types/task/pendingTasksListTypes';


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
  // 页面是否已初始化完成
  const isPageInitializedRef = useRef<boolean>(false);
  // 轮询是否已启动
  const isPollingStartedRef = useRef<boolean>(false);
  // 是否为登录页面
  const isLoginPageRef = useRef<boolean>(false);

  // 配置参数
  const config = {
    pollingInterval: 30000, // 固定30秒检测间隔   
  };





  // 检测用户交互
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteractedRef.current) {       
        userInteractedRef.current = true;
        // 预加载音频以获得播放权限
        const audio = new Audio('/videos/preview.mp3');
        audio.muted = true;
        audio.play().catch(() => {
          // 预加载音频失败（正常现象）
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
      return;
    }
    
    try {
      const audio = new Audio('/videos/preview.mp3');
      audio.volume = 1;
      isPlayingSoundRef.current = true;
      
      
      audio.play().then(() => {
       
      }).catch(error => {
       
        isPlayingSoundRef.current = false;
      });
      
      audio.addEventListener('ended', () => {
       
        isPlayingSoundRef.current = false;
      });
      
      audio.addEventListener('error', () => {
       
        isPlayingSoundRef.current = false;
      });
    } catch (error) {
     
      isPlayingSoundRef.current = false;
    }
  };

  // 尝试获取音频播放权限
  const tryGetAudioPermission = () => {
    if (!userInteractedRef.current) {
      // 创建一个不可见的音频元素并尝试播放，以获取音频播放权限
      const audio = new Audio('/videos/preview.mp3');
      audio.muted = true;
      audio.play().then(() => {
        userInteractedRef.current = true;
      }).catch(() => {
        // 获取音频播放权限失败（需要用户交互）
      });
    }
  };

  // 获取待审核任务数量
  const fetchAwaitingReviewCount = async () => {
    // 尝试获取音频播放权限
    tryGetAudioPermission();
    
    isRefreshingRef.current = true;
    
    try {
      const response = await fetch('/api/task/pendingTasksList', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const data: PendingTasksListResponse = await response.json();
      
      if (data.success && data.data) {
        const taskList = data.data.list || [];
        const newCount = taskList.length;
        
        if (newCount > 0) {
          setAwaitingReviewCount(newCount);
          setHasNewAwaitingReviewTasks(true);
          
          // 播放提示音
          playNotificationSound();
          
        } else {
          setHasNewAwaitingReviewTasks(false);          
        }
      } else {
        // 检查是否是Token失效
        if (data.code === 401) {
          // 重定向到登录页面
          router.push('/publisher/auth/login');
        } 
        setAwaitingReviewCount(0);
        setHasNewAwaitingReviewTasks(false);      
      }
    } catch (error: any) {
      // 检查是否是Token失效
      if (error.response?.data?.code === 401 || error.code === 401) {
        // 重定向到登录页面
        router.push('/publisher/auth/login');
      }
   
      setHasNewAwaitingReviewTasks(false);
    } finally {
      isRefreshingRef.current = false;
    }
  };

  // 处理查看待审核任务
  const handleViewAwaitingReview = () => {
    // 使用window.location.href实现页面重新加载
    window.location.href = '/publisher/dashboard?tab=AwaitingReview';
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
        if (countdownRef.current <= 0) {
          clearInterval(countdownIntervalRef.current!);
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
    }
  };

  // 恢复倒计时
  const resumeCountdown = () => {
    if (!countdownIntervalRef.current) {
      startCountdown();
    }
  };

  // 处理倒计时完成
  const handleCountdownComplete = async () => {
    // 暂停倒计时
    pauseCountdown();
    
    // 重新检测页面状态
    isLoginPageRef.current = window.location.pathname.includes('/login');
    const isLoggedIn = isUserLoggedIn();
    
    // 检查是否应该继续轮询
    if (!isLoginPageRef.current && isLoggedIn) {
      // 执行检测
      await fetchAwaitingReviewCount();
      
      // 重新开始倒计时
      startCountdown();
    } else {
      isPollingStartedRef.current = false;
    }
  };

  // 检测用户是否已登录
  const isUserLoggedIn = () => {
    // 检查localStorage中是否存在token
    const token = localStorage.getItem('token');
    return !!token;
  };

  // 初始化和设置轮询
  useEffect(() => {
    // 检测当前页面是否为登录页面
    isLoginPageRef.current = window.location.pathname.includes('/login');
    
    // 重置刷新标志
    isRefreshingRef.current = false;
    
    // 检查是否应该启动轮询
    const shouldStartPolling = !isLoginPageRef.current && isUserLoggedIn() && !isPollingStartedRef.current;
    
    if (shouldStartPolling) {
      // 初始获取待审核任务数量
      fetchAwaitingReviewCount().then(() => {
        // 首次检测完成后开始倒计时
        isPollingStartedRef.current = true;
        startCountdown();
      });
    }

    // 清理函数
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      isPollingStartedRef.current = false;
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
            <span className="text-yellow-700 font-medium">有新的待审核任务 <span className='text-red-500 font-bold'>({awaitingReviewCount})</span></span>
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
