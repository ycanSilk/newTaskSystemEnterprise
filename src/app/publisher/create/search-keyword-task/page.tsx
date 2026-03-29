'use client';

import { Button, Input } from '@/components/ui';
import GlobalWarningModal from '@/components/button/globalWarning/GlobalWarningModal';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskAssistance from '@/components/taskAssistance/topTask';
import AiCommentGenerator from '@/components/aiCommentBtn/AiCommentGenerator';


// 定义API请求参数类型
interface PublishSingleTaskRequest {
  template_id: number;
  video_url: string;
  deadline: number;
  task_count: number;
  total_price: number;
  recommend_marks: Array<{
    comment: string;
    image_url: string;
    keyword: string;
  }>;
}

// 定义API响应类型
interface PublishSingleTaskResponse {
  code: number;
  message: string;
  data?: any;
}

// 定义钱包余额响应类型
interface GetWalletBalanceResponse {
  code: number;
  message: string;
  data?: {
    wallet: {
      balance: string;
    };
  };
}

export default function PublishSearchKeywordTaskPage() {
  const router = useRouter();
  
  // 表单状态
  const [formData, setFormData] = useState({
    videoUrl: '',
    deadline: '30',
    searchKeywords: '',
    quantity: '1'
  });

  // API调用状态
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    message: '',
    buttonText: '确认',
    redirectUrl: ''
  });



  // 任务单价
  const taskPrice = 5;

  // 计算任务基础费用（总计费用）
  const quantity = parseInt(formData.quantity) || 1;
  const baseCost = taskPrice * quantity;
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
  const showAlertModal = (message: string, buttonText?: string, redirectUrl?: string) => {
    setAlertConfig({
      message,
      buttonText: buttonText || '确认',
      redirectUrl: redirectUrl || ''
    });
    setShowAlert(true);
  };
  const [showTaskAssistance, setShowTaskAssistance] = useState(false); // 控制任务帮助模态框显示
  // 发布任务
  const handlePublish = async () => {
    try {
      setIsLoading(true);
      
      // 表单验证
      // 1. 验证视频链接
      if (!formData.videoUrl) {
        showAlertModal('请输入视频链接');
        return;
      }
      
      // 2. 验证搜索词内容
      if (!formData.searchKeywords.trim()) {
        showAlertModal('请输入搜索词内容');
        return;
      }
      
      // 3. 验证任务数量
      const taskQuantity = parseInt(formData.quantity);
      if (isNaN(taskQuantity) || taskQuantity < 1) {
        showAlertModal('请输入有效的任务数量');
        return;
      }
      
      // 4. 验证截止时间
      const deadlineMinutes = parseInt(formData.deadline);
      if (isNaN(deadlineMinutes) || deadlineMinutes < 1) {
        showAlertModal('请选择有效的截止时间');
        return;
      }
      
      // 构建请求体
      const requestBody: PublishSingleTaskRequest = {
        template_id: 3,
        video_url: formData.videoUrl,
        deadline: Math.floor(Date.now() / 1000) + deadlineMinutes * 60,
        task_count: taskQuantity,
        total_price: baseCost,
        recommend_marks: [
          {
            comment: '',
            image_url: '',
            keyword: formData.searchKeywords
          }
        ]
      };

      console.log('发布任务API请求体:', requestBody);
      console.log('截止时间格式化后输出:', requestBody.deadline);
      
      // 调用API
      const response = await fetch('/api/task/publishSingleTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result: PublishSingleTaskResponse = await response.json();
      console.log('发布任务API响应结果:', result);
      
      if (result.code === 0) {
        // 发布成功 - 统一跳转到 /publisher/create/douyin
        showAlertModal(result.message || '任务发布成功！', '确定', '/publisher/create/douyin');
      } else if (result.code === 4001) {
        showAlertModal('发布失败', '确定', '');
      } else if (result.code === 4002) {
        showAlertModal('发布失败', '确定', '');
      } else if (result.code === 4003) {
        showAlertModal('视频链接不能为空', '确定', '');
      } else if(result.code === 4004){
        showAlertModal('截止时间不能为空', '确定', '');
      } else if(result.code === 4005){
        showAlertModal('到期时间不能早于当前时间', '确定', '');
      } else if(result.code === 4006){
        showAlertModal('发布失败', '确定', '');
      } else if(result.code === 4007){
        showAlertModal('发布失败', '确定', '');
      } else if(result.code === 4008){
        showAlertModal('任务数量必须大于 0', '确定', '');
      } else if(result.code === 4009){
        showAlertModal('截止时间不能为空', '确定', '');
      } else if(result.code === 4016){
        showAlertModal('余额不足', '确定', '/publisher/recharge');
      } else if(result.code === 5002){
        showAlertModal('任务发布失败', '确定', '');
      } else if(result.code === 5001){
        showAlertModal('网络超时', '确定', '');
      }else if(result.code === 4014){
        showAlertModal('评论不能为空', '确定', '');
      }
      
    } catch (error) {
      console.error('发布任务错误:', error);
      showAlertModal('发布任务失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <h1 className="text-2xl font-bold pl-5">
        放大镜任务<span className="text-blue-500 cursor-pointer hover:underline ml-5" onClick={() => setShowTaskAssistance(true)}>！派单演示</span>
      </h1>

        <TaskAssistance 
                isOpen={showTaskAssistance} 
                onClose={() => setShowTaskAssistance(false)} 
              />
      <div className="px-4 py-3 space-y-4">
        {/* 视频链接 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
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
        <div className="bg-white rounded-2xl p-4 shadow-sm">
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
        <div className="bg-white rounded-2xl p-4 shadow-sm overflow-y-auto">
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
        <div className="bg-white rounded-2xl p-4 shadow-sm">
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

        {/* 费用预览 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
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
          disabled={!formData.videoUrl || !formData.searchKeywords.trim() || isLoading}
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

      {/* 通用提示框组件 - 使用 GlobalWarningModal */}
      <GlobalWarningModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        redirectUrl={alertConfig.redirectUrl}
        iconType="info"
      />
    </div>
  );
}