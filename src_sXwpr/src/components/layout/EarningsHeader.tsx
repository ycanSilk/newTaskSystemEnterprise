'use client';

import React from 'react';
import { useUser } from '@/hooks/useUser';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface EarningsHeaderProps {
  showBalance?: boolean;
  onToggleBalance?: () => void;
}

export const EarningsHeader: React.FC<EarningsHeaderProps> = ({ 
  showBalance = true, 
  onToggleBalance 
}) => {
  const { user } = useUser();
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(showBalance);

  const handleToggleBalance = () => {
    setIsBalanceVisible(!isBalanceVisible);
    if (onToggleBalance) {
      onToggleBalance();
    }
  };

  if (!user) return null;

  // 根据用户角色显示不同的收益信息
  const renderEarningsInfo = () => {
    switch (user.role) {
      case 'commenter':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">账户余额</div>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-white">
                    {isBalanceVisible ? `¥${user.balance.toFixed(2)}` : '****'}
                  </span>
                  <button
                    onClick={handleToggleBalance}
                    className="ml-2 text-white/70 hover:text-white touch-target"
                  >
                    {isBalanceVisible ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {user.stats && (
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">今日任务</div>
                  <div className="text-lg font-bold text-white">
                    {user.stats.todayTasks || 0}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              {user.stats?.level && (
                <div className="text-xs text-gray-400 mb-1">等级</div>
              )}
              <div className="text-sm font-medium text-white">
                {user.stats?.level || '新手'}
              </div>
            </div>
          </div>
        );

      case 'publisher':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">账户余额</div>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-white">
                    {isBalanceVisible ? `¥${user.balance.toFixed(2)}` : '****'}
                  </span>
                  <button
                    onClick={handleToggleBalance}
                    className="ml-2 text-white/70 hover:text-white touch-target"
                  >
                    {isBalanceVisible ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {user.stats && (
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">活跃任务</div>
                  <div className="text-lg font-bold text-white">
                    {user.stats.activeTasks || 0}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              {user.stats && (
                <>
                  <div className="text-xs text-gray-400 mb-1">已完成</div>
                  <div className="text-sm font-medium text-white">
                    {user.stats.completedTasks || 0}
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">系统余额</div>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-white">
                    {isBalanceVisible ? `¥${user.balance.toFixed(2)}` : '****'}
                  </span>
                  <button
                    onClick={handleToggleBalance}
                    className="ml-2 text-white/70 hover:text-white touch-target"
                  >
                    {isBalanceVisible ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">身份</div>
              <div className="text-sm font-medium text-white">
                系统管理员
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">账户余额</div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-white">
                  {isBalanceVisible ? `¥${user.balance.toFixed(2)}` : '****'}
                </span>
                <button
                  onClick={handleToggleBalance}
                  className="ml-2 text-white/70 hover:text-white touch-target"
                >
                  {isBalanceVisible ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <header className="bg-gradient-to-r from-primary to-blue-600 px-4 py-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{user.avatar}</span>
          <div>
            <div className="text-sm font-medium">{user.nickname || user.username}</div>
            <div className="text-xs text-gray-300">
              {user.role === 'admin' && '系统管理员'}
              {user.role === 'publisher' && '派单员'}
              {user.role === 'commenter' && '评论员'}
            </div>
          </div>
        </div>
      </div>

      {renderEarningsInfo()}
    </header>
  );
};