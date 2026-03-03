'use client';

import { Card, Button, Input, Badge, AlertModal } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
// 导入类型定义
import { TaskTemplate, GetTaskTemplatesResponse } from '@/app/types/task/getTaskTemplatesTypes';

// 任务卡片组件
const TaskCard = ({ task, onClick }: { task: TaskTemplate, onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl px-5 py-3 shadow-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer active:scale-95"
    >
      {/* 任务头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <h3 className="font-bold text-lg">{task.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-500">
            ¥{task.price}
          </div>
        </div>
      </div>

      {/* 任务描述 */}
      <div className="mb-2">
        <p className="">{task.description1}</p>
        <p className="text-gray-700 text-sm">{task.description2}</p>
      </div>

      {/* 发布按钮 */}
      <div className="flex items-center justify-end">
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
          立即发布
        </div>
      </div>
    </div>
  );
};

export default function CreateTask() {
  const router = useRouter();
  
  // 任务模板状态
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });
  
  // 显示暂未开发提示
  const showNotDevelopedAlert = () => {
    setAlertConfig({
      title: '暂未开发',
      message: '该功能暂未开发',
      icon: '🔧'
    });
    setShowAlertModal(true);
  };

  // 获取任务模板
  useEffect(() => {
    const fetchTaskTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 调用API获取任务模板
        const response = await fetch('/api/task/getTaskTemplates');
        const data: GetTaskTemplatesResponse = await response.json();
        
        if (data.success && data.data) {
          setTaskTemplates(data.data);
        } else {
          setError(data.message || '获取任务模板失败');
        }
      } catch (err) {
        setError('网络错误，无法获取任务模板');
        console.error('获取任务模板失败:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskTemplates();
  }, []);

  const handleTaskClick = (task: TaskTemplate) => {
    // 处理任务选择，根据title或其他字段判断跳转路径
    // 这里根据实际业务逻辑调整
    const taskType = task.id;
    let url = '';
    const params = new URLSearchParams();
    
    // 根据任务类型设置URL和参数
    if (taskType === 1) {
      // 上评任务 - 跳转到上评任务发布页面
      url = `/publisher/create/publish-top-comment`;
      params.set('template_id', task.id.toString());
      params.set('price', task.price.toString());
    } else if (taskType === 2) {
      url = `/publisher/create/publish-middle-comment`;
      params.set('template_id', task.id.toString());
      params.set('price', task.price.toString());
    } else if (taskType === 4) {
      url = `/publisher/create/task-combination-top-middle`;
      // 组合任务，传递两个阶段的价格
      params.set('template_id', task.id.toString());
      params.set('price', task.price.toString());
      if (task.stage1) params.set('stage1Price', task.stage1.price.toString());
      if (task.stage2) params.set('stage2Price', task.stage2.price.toString());
    } else if (taskType === 5) {
      url = `/publisher/create/task-combination-middle-bottom`;
      // 组合任务，传递两个阶段的价格
      params.set('template_id', task.id.toString());
      params.set('price', task.price.toString());
      if (task.stage1) params.set('stage1Price', task.stage1.price.toString());
      if (task.stage2) params.set('stage2Price', task.stage2.price.toString());
    } else if (taskType === 3) {
      url = `/publisher/create/search-keyword-task`;
      params.set('template_id', task.id.toString());
      params.set('price', task.price.toString());
    } else {
      showNotDevelopedAlert();
      return;
    }
    
    // 跳转到发布页面，带上价格参数
    router.push(`${url}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 pb-10 mt-5">
      {/* 加载状态 */}
      {loading && (
        <div className="px-2 space-y-2">
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border-2 border-gray-100">
            <div className="flex items-center justify-center py-10">
              <div className="text-gray-500">加载中...</div>
            </div>
          </div>
        </div>
      )}
      
      {/* 错误状态 */}
      {error && (
        <div className="px-2 space-y-2">
          <div className="bg-red-50 rounded-2xl px-5 py-3">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      )}
      
      {/* 任务卡片列表 */}
      {!loading && !error && taskTemplates.length > 0 && (
        <div className="px-2 space-y-2">
          {taskTemplates.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>
      )}
      
      {/* 空状态 */}
      {!loading && !error && taskTemplates.length === 0 && (
        <div className="px-2 space-y-2">
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border-2 border-gray-100">
            <div className="flex items-center justify-center py-10">
              <div className="text-gray-500">暂无任务模板</div>
            </div>
          </div>
        </div>
      )}

      {/* 提示信息 */}
      <div className="px-2 space-y-2">
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <div>
              <h3 className="font-medium text-blue-900 mb-1">任务说明</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                请根据您的需求选择合适的任务类型。发布评论需求请规避抖音平台敏感词，否则会无法完成任务导致浪费宝贵时间。
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 通用提示模态框 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
}