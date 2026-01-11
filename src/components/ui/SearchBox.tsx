import React, { useState } from 'react';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';

interface SearchBoxProps {
  // 可选的自定义className
  className?: string;
  // 占位符文本
  placeholder?: string;
  // 搜索回调函数
  onSearch: (query: string) => void;
  // 支持清除搜索内容
  allowClear?: boolean;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  className = '',
  placeholder = '搜索...',
  onSearch,
  allowClear = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div 
      className={`relative flex items-center 
        ${isFocused ? 'ring-2 ring-blue-500' : ''} 
        ${className}
      `}
    >
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="
          w-full h-10 px-4 pl-10 
          bg-white border border-gray-300 rounded-full 
          focus:outline-none text-black
        "
      />
      <SearchOutlined size={18} className="absolute left-3 text-gray-400" />
      {allowClear && searchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-gray-400 hover:text-gray-600"
          aria-label="清除搜索内容"
        >
          <CloseOutlined size={16} />
        </button>
      )}
    </div>
  );
};