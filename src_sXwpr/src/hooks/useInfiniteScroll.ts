'use client';

// 导入React钩子：useEffect用于处理副作用，useRef用于创建容器引用，useCallback用于缓存函数
import { useEffect, useRef, useCallback } from 'react';

// 定义无限滚动钩子的参数类型
interface UseInfiniteScrollOptions {
  hasMore: boolean; // 是否还有更多数据
  loading: boolean; // 是否正在加载中
  onLoadMore: () => void; // 加载更多数据的回调函数
  threshold?: number; // 触底阈值，默认100px
}

// 导出无限滚动自定义钩子
export function useInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  threshold = 100,
}: UseInfiniteScrollOptions) {
  // 创建一个容器引用，用于绑定滚动事件
  const containerRef = useRef<HTMLDivElement>(null);

  // 定义滚动事件处理函数，使用useCallback缓存
  const handleScroll = useCallback(() => {
    // 获取当前容器元素
    const container = containerRef.current;
    // 如果容器不存在、正在加载或没有更多数据，直接返回
    if (!container || loading || !hasMore) return;

    // 获取容器的滚动信息
    const { scrollTop, scrollHeight, clientHeight } = container;
    // 计算是否滚动到了接近底部的位置
    const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;

    // 如果接近底部，调用加载更多的回调函数
    if (isNearBottom) {
      onLoadMore();
    }
  }, [loading, hasMore, onLoadMore, threshold]); // 依赖项数组，当这些值变化时重新创建函数

  // 使用useEffect监听容器变化，绑定和移除滚动事件
  useEffect(() => {
    // 获取当前容器元素
    const container = containerRef.current;
    // 如果容器不存在，直接返回
    if (!container) return;

    // 为容器添加滚动事件监听器，passive: true表示事件不会调用preventDefault
    container.addEventListener('scroll', handleScroll, { passive: true });
    // 组件卸载时移除事件监听器，防止内存泄漏
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]); // 当handleScroll函数变化时重新执行

  // 返回容器引用，供组件使用
  return { containerRef };
}