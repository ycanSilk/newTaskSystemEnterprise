'use client';
import React, { useState, useEffect, useRef } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

/**
 * 搜索模块配置接口
 * 用于定义不同功能模块的搜索规则
 */
export interface SearchModule {
  /** 匹配关键词数组 */
  keywords: string[];
  /** 匹配成功后跳转的路径 */
  urlPath: string;
  /** 是否需要精确匹配，默认为false（模糊匹配） */
  exactMatch?: boolean;
  /** 模块名称 */
  moduleName?: string;
  /** 模块图标 */
  icon?: string;
}

/**
 * 搜索结果项接口
 */
export interface SearchResult {
  /** 结果ID */
  id: string;
  /** 结果标题 */
  title: string;
  /** 结果描述 */
  description?: string;
  /** 结果类型 */
  type: 'module' | 'order';
  /** 跳转路径 */
  urlPath: string;
  /** 时间戳 */
  timestamp: number;
  /** 模块名称（如果是模块类型） */
  moduleName?: string;
}

/**
 * 默认搜索模块配置数组
 * 默认为空，通过调用时传入customModules来提供所需的关键词和URL路径
 */
export const searchModules: SearchModule[] = [];

/**
 * 搜索框组件属性接口
 */
export interface SearchBarProps {
  /** 搜索框占位文本 */
  placeholder?: string;
  /** 自定义CSS类名 */
  className?: string;
  /** 搜索框初始值 */
  initialValue?: string;
  /**
   * 自定义搜索模块配置
   * 调用时传入所需的关键词和URL路径
   * 格式：[{keywords: ['关键词1', '关键词2'], urlPath: '/path/to/module', exactMatch?: false}]
   */
  customModules?: SearchModule[];
}

/**
 * 移动端适配的搜索框组件
 * 显示搜索按钮，点击弹出全屏模态框进行搜索
 */
const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索订单号、标题或描述',
  className = '',
  initialValue = '',
  customModules = [],
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 合并默认模块和自定义模块，使用useMemo避免每次渲染都创建新数组
  const allModules = React.useMemo(() => [...searchModules, ...customModules], [searchModules, customModules]);

  // 点击搜索按钮，显示模态框
  const handleSearchButtonClick = () => {
    setIsModalVisible(true);
    // 确保模态框显示后输入框获得焦点
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalVisible(false);
    // 清除搜索内容，但保留初始值
    setSearchTerm(initialValue);
    setSearchResults([]);
  };

  // 清空搜索框内容
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // 处理搜索框输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  // 执行搜索逻辑，使用useCallback避免每次渲染都创建新函数
  const performSearch = React.useCallback((term: string) => {
    setIsSearching(true);
    const results: SearchResult[] = [];
    const searchLower = term.toLowerCase();
    const now = Date.now();

    // 搜索模块
    allModules.forEach((module, index) => {
      if (!module || !module.keywords || !module.urlPath) return;
      
      const moduleKeywords = module.keywords.map(keyword => keyword.toLowerCase());
      let hasMatchingKeyword = false;
      
      if (module.exactMatch) {
        hasMatchingKeyword = moduleKeywords.some(keyword => searchLower === keyword);
      } else {
        hasMatchingKeyword = moduleKeywords.some(keyword => searchLower.includes(keyword));
      }
      
      if (hasMatchingKeyword) {
        results.push({
          id: `module-${index}`,
          title: module.moduleName || module.keywords[0],
          description: `功能模块: ${module.keywords.join(', ')}`,
          type: 'module',
          urlPath: `${module.urlPath}?search=${encodeURIComponent(term)}`,
          timestamp: now - index * 1000, // 模拟时间戳，用于排序
          moduleName: module.moduleName
        });
      }
    });

    // 搜索订单号
    if (/^\d+$/.test(term)) {
      // 模拟订单搜索结果
      results.push({
        id: `order-${term}`,
        title: `订单 ${term}`,
        description: `订单详情查看`,
        type: 'order',
        urlPath: `/publisher/orders?search=${encodeURIComponent(term)}`,
        timestamp: now - 10000 // 模拟时间戳
      });
    }

    // 按类型和时间戳排序，确保模块类型优先，并且按时间降序排列
    results.sort((a, b) => {
      // 首先按类型排序，模块类型优先
      if (a.type !== b.type) {
        return a.type === 'module' ? -1 : 1;
      }
      // 然后按时间戳降序排序
      return b.timestamp - a.timestamp;
    });

    // 限制结果数量，最多显示20条
    const limitedResults = results.slice(0, 20);
    
    // 设置搜索结果
    setSearchResults(limitedResults);
    setIsSearching(false);
  }, [allModules]);

  // 实时搜索功能
  useEffect(() => {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) {
      setSearchResults([]);
      return;
    }

    // 添加防抖，避免频繁搜索
    const timer = setTimeout(() => {
      performSearch(trimmedTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, performSearch]);

  // 处理搜索结果点击
  const handleResultClick = (result: SearchResult) => {
    router.push(result.urlPath as any);
    handleCloseModal();
  };

  return (
    <>
      {/* 搜索按钮 - 显示白色放大镜图标，居中对齐 */}
      <button 
        className={`pl-2.5 pt-2 pr-1 pb-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${className}`}
        onClick={handleSearchButtonClick}
        aria-label="搜索"
      >
        <SearchOutlined className="h-6 w-6 text-white" />
      </button>

      {/* 全屏搜索模态框 */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 bg-blue-50 flex flex-col">
          {/* 搜索头部 */}
          <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-200 flex items-center">
            <div className="relative flex-1 mr-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchOutlined className="h-7 w-7 " />
              </div>
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="待输入"
                value={searchTerm}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                aria-label="搜索输入框"
              />
              {/* 清除按钮 - 仅当有输入内容时显示 */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="清除搜索内容"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              onClick={handleCloseModal}
              className="px-3 py-1 text-gray-700 font-medium text-base hover:text-blue-600 active:text-blue-600 transition-colors duration-200"
              aria-label="取消搜索"
            >
              取消
            </button>
          </div>

          {/* 搜索结果区域 */}
          <div className="flex-1 overflow-y-auto">
            {isSearching && (
              <div className="flex justify-center">
                <div className="animate-spin h-6 w-6 border-4 border-blue-200 border-t-blue-600 rounded-full" />
              </div>
            )}
            
            {!isSearching && searchResults.length > 0 ? (
              <div>
                {/* 功能模块结果 */}
                {(searchResults.some(r => r.type === 'module') && (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-600 bg-white border-b border-gray-300">
                      功能模块
                    </div>
                    {searchResults
                      .filter(result => result.type === 'module')
                      .map(result => (
                        <div
                          key={result.id}
                          className="px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-150 bg-white border-b border-gray-800"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="font-medium text-black">{result.title}</div>
                          {result.description && (
                            <div className="text-sm text-black mt-1">{result.description}</div>
                          )}
                        </div>
                      ))}
                  </>
                ))}

                {/* 订单结果 */}
                {(searchResults.some(r => r.type === 'order') && (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-800 bg-white border-b border-gray-800">
                      订单
                    </div>
                    {searchResults
                      .filter(result => result.type === 'order')
                      .map(result => (
                        <div
                          key={result.id}
                          className="px-4 py-3 hover:bg-gray-50  cursor-pointer transition-colors duration-150 bg-white border-b border-gray-300"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="font-medium text-black">{result.title}</div>
                          {result.description && (
                            <div className="text-sm text-black mt-1">{result.description}</div>
                          )}
                        </div>
                      ))}
                  </>
                ))}
              </div>
            ) : (
              !isSearching && searchTerm && (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                  <svg className="h-16 w-16 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-base">未找到相关结果</p>
                  <p className="text-sm mt-1">请尝试其他关键词</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;