'use client';

import React, { useState, useEffect } from 'react';

// 定义周期选项类型
type PeriodOption = {
  label: string;
  value: string;
};

// 定义统计数据类型
interface Summary {
  total_income: number;
  total_expenditure: number;
  net_change: number;
}

// 定义每日数据类型
interface DailyData {
  date: string;
  income: number;
  expenditure: number;
  net_change: number;
}

// 定义分页信息类型
interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// 定义响应数据类型
interface StatisticData {
  period: string;
  summary: Summary;
  daily_data: DailyData[];
  pagination: Pagination;
}

// SVG图标组件
const IncomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExpenditureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l-3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NetIncomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function StatisticPage() {
  // 状态管理
  const [period, setPeriod] = useState<string>('7days');
  const [statisticData, setStatisticData] = useState<StatisticData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(100);

  // 周期选项
  const periodOptions: PeriodOption[] = [
    { label: '今天', value: 'today' },
    { label: '7天', value: '7days' },
    { label: '15天', value: '15days' },
    { label: '30天', value: '30days' }
  ];

  // 获取统计数据
  const fetchStatisticData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/statistics/getStatisticSummary?period=${period}&page=${currentPage}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('获取统计数据失败');
      }

      const data = await response.json();
      console.log('获取统计数据成功:', data);
      if (data.success) {
        setStatisticData(data.data);
      } else {
        setError(data.message || '获取统计数据失败');
      }
    } catch (err) {
      setError('网络异常，请稍后重试');
      console.error('获取统计数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 页面加载和周期变化时获取数据
  useEffect(() => {
    fetchStatisticData();
  }, [period, currentPage, limit]);

  // 处理周期变更
  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setCurrentPage(1); // 切换周期时重置到第一页
  };

  // 处理分页变更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理每页数量变更
  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(event.target.value));
    setCurrentPage(1); // 切换每页数量时重置到第一页
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">流水数据统计</h1>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <span className="text-blue-600 text-sm sm:text-base">加载中...</span>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* 统计数据展示 */}
        {!isLoading && !error && statisticData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-6">
            {/* 统计概览 */}
            <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 flex items-center">                
                <div>                  
                  <div className="flex items-center mb-2">
                    <IncomeIcon />
                    <h3 className="ml-2 text-center  text-xs sm:text-sm font-medium text-gray-500">总收入</h3>
                  </div>
                  <p className="text-center text-lg sm:text-xl font-semibold text-green-600">¥{statisticData.summary.total_income.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 sm:p-4 flex items-center">
                <div>
                  <div className="flex items-center mb-2">
                     <ExpenditureIcon />
                    <h3 className="ml-2 text-center  text-xs sm:text-sm font-medium text-gray-500">总支出</h3>
                  </div>
                  <p className="text-center text-lg sm:text-xl font-semibold text-red-600">¥{statisticData.summary.total_expenditure.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 flex items-center">
                <div>
                  <div className="flex items-center mb-2">
                     <NetIncomeIcon />
                    <h3 className="ml-2 text-center  text-xs sm:text-sm font-medium text-gray-500">净收入</h3>
                  </div>
                  <p className="text-center text-lg sm:text-xl font-semibold text-blue-600">¥{statisticData.summary.net_change.toFixed(2)}</p>
                </div>
              </div>
              
            </div>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center mb-2">
                  <CalendarIcon />
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 ml-2">统计周期</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handlePeriodChange(option.value)}
                      className={`px-5 sm:px-5 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                        period === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            {/* 每日数据详情 */}
            <div className="mb-4 sm:mb-6 mt-3">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">每日数据明细</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日期
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        收入(元)
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        支出(元)
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        净收入(元)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statisticData.daily_data.map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {item.date}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-green-600">
                          {item.income.toFixed(2)}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-red-600">
                          {item.expenditure.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-blue-600">
                          {item.net_change.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 分页信息 */}
            <div className="flex flex-col gap-3">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                共 {statisticData.pagination.total} 条记录，共 {statisticData.pagination.total_pages} 页
              </div>
              <div className="flex flex-wrap sm:justify-center lg:justify-end items-center gap-1 sm:gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 border rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  首页
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 border rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="px-2 sm:px-3 py-1 border rounded-md text-xs sm:text-sm font-medium text-white bg-blue-600">
                  {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === statisticData.pagination.total_pages}
                  className="px-2 sm:px-3 py-1 border rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
                <button
                  onClick={() => handlePageChange(statisticData.pagination.total_pages)}
                  disabled={currentPage === statisticData.pagination.total_pages}
                  className="px-2 sm:px-3 py-1 border rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  末页
                </button>
                <div className="flex items-center mt-2 sm:mt-0">
                  <span className="text-xs sm:text-sm text-gray-500 mr-2">100条/页</span>
                  <select
                    value={limit}
                    onChange={handleLimitChange}
                    className="w-28 px-3 py-1 border rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white"
                  >
                    <option value={10}>10条/页</option>
                    <option value={20}>20条/页</option>
                    <option value={50}>50条/页</option>
                    <option value={100}>100条/页</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
