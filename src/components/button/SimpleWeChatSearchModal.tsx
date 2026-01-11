'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SimpleWeChatSearchModalProps {
  /** 是否打开模态框 */
  isOpen: boolean;
  /** 关闭模态框的回调函数 */
  onClose: () => void;
  /** 搜索框占位文本 */
  placeholder?: string;
  /** 自定义CSS类名 */
  className?: string;
  /** 搜索回调函数 */
  onSearch?: (query: string) => void;
}

/**
 * 简化版微信风格搜索模态框组件
 * 不依赖Ant Design，使用原生React和Tailwind CSS实现
 */
export const SimpleWeChatSearchModal: React.FC<SimpleWeChatSearchModalProps> = ({
  isOpen,
  onClose,
  placeholder = '搜索',
  className = '',
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 当模态框打开时，自动聚焦到搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // 短暂延迟以确保模态框已经渲染完成
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 处理搜索逻辑
  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery && onSearch) {
      onSearch(trimmedQuery);
    } else if (trimmedQuery) {
      // 默认搜索逻辑：可以根据项目需求进行修改
      console.log('搜索:', trimmedQuery);
    }
  };

  // 处理取消按钮点击
  const handleCancel = () => {
    setSearchQuery(''); // 清空搜索内容
    onClose(); // 关闭模态框
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 如果模态框未打开，则不渲染
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-white z-50 flex flex-col ${className}`}>
      {/* 顶部搜索栏 */}
      <div className="p-2 border-b border-gray-200 flex items-center">
        <div className="flex-1 flex items-center bg-gray-100 rounded-full h-10 px-3">
          {/* 使用Unicode搜索图标替代Ant Design图标 */}
          <span className="text-gray-400 mr-2">🔍</span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="bg-transparent border-none outline-none flex-1 text-sm"
            autoFocus
          />
        </div>
        <button 
          onClick={handleCancel}
          className="ml-3 text-blue-500 font-medium text-sm"
        >
          取消
        </button>
      </div>
      
      {/* 搜索结果区域 - 暂时为空，根据实际需求实现 */}
      <div className="flex-1 overflow-auto p-4">
        {searchQuery.trim() === '' && (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-sm">点击搜索图标开始搜索</p>
          </div>
        )}
        {searchQuery.trim() !== '' && (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-sm">搜索结果将显示在这里</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleWeChatSearchModal;