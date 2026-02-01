// 骨架屏组件
// 用于在数据加载时显示占位符，提高用户体验
// 支持自定义宽度、高度和样式

import React from 'react';

interface SkeletonProps {
  /**
   * 骨架屏宽度
   */
  width?: string | number;
  /**
   * 骨架屏高度
   */
  height?: string | number;
  /**
   * 额外的CSS类名
   */
  className?: string;
  /**
   * 是否显示为圆形
   */
  circle?: boolean;
  /**
   * 是否显示为矩形
   */
  rect?: boolean;
}

/**
 * 骨架屏组件
 * @param props 组件属性
 * @returns 骨架屏组件
 */
const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className = '',
  circle = false,
  rect = false
}) => {
  // 计算样式
  const style: React.CSSProperties = {
    width,
    height
  };

  // 计算CSS类名
  let skeletonClassName = 'animate-pulse bg-gray-200';
  
  // 添加形状类名
  if (circle) {
    skeletonClassName += ' rounded-full';
  } else if (rect) {
    skeletonClassName += ' rounded';
  } else {
    skeletonClassName += ' rounded';
  }
  
  // 添加额外的CSS类名
  if (className) {
    skeletonClassName += ` ${className}`;
  }

  return (
    <div
      className={skeletonClassName}
      style={style}
    />
  );
};

/**
 * 骨架屏文本组件
 * @param props 组件属性
 * @returns 骨架屏文本组件
 */
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          className="mb-2"
          style={{ width: index === 0 ? '100%' : index === 1 ? '80%' : '60%' }}
        />
      ))}
    </div>
  );
};

/**
 * 骨架屏卡片组件
 * @param props 组件属性
 * @returns 骨架屏卡片组件
 */
export const SkeletonCard: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <Skeleton width="100%" height="160px" className="mb-4 rounded" />
      <Skeleton width="80%" height="1.5rem" className="mb-2" />
      <Skeleton width="60%" height="1rem" className="mb-3" />
      <Skeleton width="40%" height="2.5rem" className="rounded" />
    </div>
  );
};

/**
 * 骨架屏列表项组件
 * @param props 组件属性
 * @returns 骨架屏列表项组件
 */
export const SkeletonListItem: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div className={`flex items-center p-4 border-b border-gray-100 ${className}`}>
      <Skeleton width="48px" height="48px" circle className="mr-4" />
      <div className="flex-1">
        <Skeleton width="70%" height="1rem" className="mb-2" />
        <Skeleton width="90%" height="0.875rem" className="mb-2" />
        <Skeleton width="50%" height="0.75rem" />
      </div>
    </div>
  );
};

export default Skeleton;