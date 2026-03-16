'use client';

import { Button, Input, AlertModal } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 导入放大镜任务发布的类型定义
import type { CreateMagnifierTaskRequest, CreateMagnifierTaskApiResponse } from '@/api/types/task/createMagnifierTaskTypes';

// 定义API响应类型
interface PublishSingleTaskResponse {
  code: number;
  message: string;
  data?: any;
}

export default function PublishSearchKeywordTaskPage() {
  const router = useRouter();
  
  // 表单状态
  const [formData, setFormData] = useState({
    videoUrl: '',
    deadline: '30',
    searchKeywords: '',
    quantity: '1',
    unitPrice: '5'
  });

  // API调用状态
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: '',
    buttonText: '确认',
    onButtonClick: () => {}
  });

  // 计算任务基础费用（总计费用）
  const quantity = parseInt(formData.quantity) || 1;
  const unitPrice = parseInt(formData.unitPrice) || 0;
  const baseCost = quantity * unitPrice;
  const totalCost = baseCost.toFixed(2);

  // 任务数量变化处理 - 允许1-10个任务
  const handleQuantityChange = (newQuantity: string) => {
    // 只允许输入数字
    const cleanValue = newQuantity.replace(/[^0-9]/g, '');
    // 限制数量不超过10
    const limitedValue = cleanValue ? Math.min(10, parseInt(cleanValue)).toString() : '';
    setFormData(prevData => ({ ...prevData, quantity: limitedValue }));
  };

  // 显示提示框
  const showAlertModal = (title: string, message: string, icon: string, buttonText?: string, onButtonClick?: () => void) => {
    setAlertConfig({
      title,
      message,
      icon,
      buttonText: buttonText || '确认',
      onButtonClick: onButtonClick || (() => {})
    });
    setShowAlert(true);
  };

  // 页面加载时不调用API，只在点击发布按钮时调用

  // 发布任务
  const handlePublish = async () => {
    try {
      setIsLoading(true);
      
      // 表单验证 - 按要求顺序进行校验
      // 1. 验证视频地址
      if (!formData.videoUrl) {
        showAlertModal('验证失败', '请输入视频链接', '⚠️');
        return;
      }
      
      // 2. 验证任务截止时间
      const deadlineMinutes = parseInt(formData.deadline);
      if (isNaN(deadlineMinutes) || deadlineMinutes < 1) {
        showAlertModal('验证失败', '请选择有效的截止时间', '⚠️');
        return;
      }
      
      // 3. 验证指定搜索词内容
      if (!formData.searchKeywords.trim()) {
        showAlertModal('验证失败', '请输入搜索词内容', '⚠️');
        return;
      }
      
      // 4. 验证任务数量
      const taskQuantity = parseInt(formData.quantity);
      if (isNaN(taskQuantity) || taskQuantity < 1) {
        showAlertModal('验证失败', '请输入有效的任务数量', '⚠️');
        return;
      }
      
      // 5. 验证任务单价
      const taskUnitPrice = parseInt(formData.unitPrice);
      if (isNaN(taskUnitPrice) || taskUnitPrice < 1) {
        showAlertModal('验证失败', '请输入有效的任务单价', '⚠️');
        return;
      }
      
      // 构建请求体
      const requestBody: CreateMagnifierTaskRequest = {
        video_url: formData.videoUrl,
        deadline: Math.floor(Date.now() / 1000) + deadlineMinutes * 60,
        task_count: taskQuantity,
        unit_price: taskUnitPrice,
        total_price: baseCost,
        title: '放大镜搜索词',
        recommend_marks: [
          {
            comment: formData.searchKeywords,
            at_user: '',
            image_url: ''
          }
        ]
      };

      console.log('发布任务API请求体:', requestBody);
      console.log('截止时间格式化后输出:', requestBody.deadline);
      
      // 调用API - 使用新的放大镜任务发布端点
      const response = await fetch('/api/task/createMagnifierTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result: CreateMagnifierTaskApiResponse = await response.json();
      console.log('发布任务API响应结果:', result);
      
      // 显示API响应结果
      if (result.code === 0) {
        showAlertModal('发布成功', result.message, '✅', '确定', () => {
          router.push('/publisher/dashboard');
        });
      } else {
        showAlertModal('发布失败', result.message, '❌');
      }
    } catch (error) {
      console.error('发布任务错误:', error);
      showAlertModal('网络错误', '发布任务失败，请稍后重试', '⚠️');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <h1 className="text-2xl font-bold pl-5">
          放大镜
        </h1>

        <div className="text-lg pl-5 text-red-500"></div>

      <div className="px-4 py-3 space-y-2">
        {/* 视频链接 */}
        <div className="bg-white rounded-xl py-1 px-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务发布 <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="发布评论/视频链接。"
            value={formData.videoUrl}
            onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
            className="w-full"
          />
        </div>

        {/* 截止时间 */}
        <div className="bg-white rounded-xl py-1 px-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务截止时间
          </label>
          <select 
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          >
            <option value="10">10分钟内</option>
            <option value="30">30分钟内</option>
            <option value="720">12小时内</option>
            <option value="1440">24小时内</option>
          </select>
        </div>

        {/* 搜索词内容 */}
        <div className="bg-white rounded-xl py-1 px-4 shadow-sm overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            指定搜索词内容 <span className="text-red-500">*</span>
          </label>
          
          {/* 搜索词输入框 */}
          <div className="mb-2">
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="请输入需要搜索的关键词，完成后系统会自动生成相应的搜索词"
              value={formData.searchKeywords}
              onChange={(e) => setFormData({...formData, searchKeywords: e.target.value})}
            />
          </div>
        </div>

        {/* 任务数量 */}
        <div className="bg-white rounded-xl py-1 px-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务数量 <span className="text-red-500">*</span>
          </label>
          <div className="flex-1">
            <Input
              type="text"
              value={formData.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full text-2xl font-bold text-gray-900 text-center py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入任务数量"
            />
          </div>
        </div>

        {/* 任务单价 */}
        <div className="bg-white rounded-xl py-1 px-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务单价（元） <span className="text-red-500">*</span>
          </label>
          <div className="flex-1">
            <Input
              type="text"
              value={formData.unitPrice}
              onChange={(e) => {
                // 只允许输入数字
                const cleanValue = e.target.value.replace(/[^0-9]/g, '');
                setFormData(prevData => ({ ...prevData, unitPrice: cleanValue }));
              }}
              className="w-full text-2xl font-bold text-gray-900 text-center py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入任务单价"
            />
          </div>
        </div>

        {/* 费用预览 */}
        <div className="bg-white rounded-xl py-1 px-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">费用预览</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">任务费用</span>
              <span className="font-bold text-lg">¥{baseCost.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">总计费用</span>
                <span className="font-bold text-lg text-orange-500">¥{baseCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部固定发布按钮 - 增强表单提交控制 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
        <Button 
          onClick={handlePublish}
          disabled={!formData.videoUrl || !formData.searchKeywords.trim() || !formData.quantity || !formData.unitPrice || isLoading}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50"
        >
          {isLoading ? '发布中...' : `发布任务 - ¥${totalCost}`}
        </Button>
        <Button 
          onClick={() => router.back()}
          variant="secondary"
          className="w-full py-3 border border-gray-200 text-gray-700 rounded-2xl"
        >
          取消
        </Button>
      </div>

      {/* 通用提示框组件 */}
      <AlertModal
        isOpen={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        onButtonClick={() => {
          alertConfig.onButtonClick();
          setShowAlert(false);
        }}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}