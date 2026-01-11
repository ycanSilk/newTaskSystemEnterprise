'use client';

import { Button, Input, AlertModal } from '@/components/ui';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';



// 全包任务详情页 - 参考publish/page.tsx实现
// 包含上评、中评、下评的完整评论任务套餐

export default function TaskCombinationAllPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL参数获取任务信息，确保searchParams不为null
  const getSearchParam = (key: string) => {
    return searchParams?.get(key) || '';
  };
  
  const taskId = getSearchParam('taskId').trim();
  const taskTitle = getSearchParam('title').trim() || '全包任务发布页';
  const taskIcon = getSearchParam('icon').trim() || '🌟';
  const taskPrice = parseFloat(getSearchParam('price').trim() || '0');
  const taskDescription = getSearchParam('description').trim() || '任务描述';
  
  // 新的表单数据结构，包含上评、中评和下评的完整套餐
  const [formData, setFormData] = useState({
    videoUrl: '', // 视频链接
    comments: {
      topComment: '🔺上评：这款产品真的很棒，质量很好，强烈推荐！',
      middleComment: '🔺中评：产品还不错，使用体验良好，有需要的可以尝试。',
      bottomComment: '🔻下评：这款产品质量一般，不太符合我的预期。'
    },
    deadline: '24',
    needImageComment: false
  });

  const [mentionInput, setMentionInput] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);

  const handleAddMention = () => {
    const trimmedMention = mentionInput.trim();
    // 确保用户昵称ID唯一
    if (trimmedMention && !mentions.includes(trimmedMention)) {
      setMentions([...mentions, trimmedMention]);
      setMentionInput('');
    } else if (mentions.includes(trimmedMention)) {
      showAlert('提示', '该用户昵称ID已添加', '💡');
    }
  };

  const removeMention = (mention: string) => {
    setMentions(mentions.filter(m => m !== mention));
  };

  const [isPublishing, setIsPublishing] = useState(false);

  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: '',
    buttonText: '确认',
    onButtonClick: () => {}
  });

  // 显示通用提示框
  const showAlert = (
    title: string, 
    message: string, 
    icon: string, 
    buttonText?: string, 
    onButtonClick?: () => void
  ) => {
    setAlertConfig({
      title, 
      message, 
      icon,
      buttonText: buttonText || '确认',
      onButtonClick: onButtonClick || (() => {})
    });
    setShowAlertModal(true);
  };

  // AI优化评论功能
  const handleAIOptimizeComments = () => {
    // 模拟AI优化评论的逻辑
    const optimizedComments = {
      ...formData.comments,
      topComment: formData.comments.topComment + ' ',
      middleComment: formData.comments.middleComment + ' ',
      bottomComment: formData.comments.bottomComment + ' '
    };
    
    setFormData(prevData => ({
      ...prevData,
      comments: optimizedComments
    }));
    showAlert('优化成功', '评论内容已通过AI优化！', '✨');
  };

  // 推荐评论功能
  const handleRecommendComments = () => {
    // 生成随机推荐评论
    const randomComments = {
      topComment: `🔺上评：这款产品真的很棒，质量很好，强烈推荐大家购买！`,
      middleComment: mentions.length > 0 ? 
        `🔺中评：@${mentions[0]} 产品还不错，使用体验良好，有需要的可以尝试一下。` : 
        `🔺中评：产品还不错，使用体验良好，有需要的可以尝试一下。`,
      bottomComment: `🔻下评：产品质量一般，不太符合预期，性价比不高。`
    };
    
    setFormData(prevData => ({
      ...prevData,
      comments: randomComments
    }));
    showAlert('推荐成功', '已为您生成随机推荐评论！', '🎉');
  };

  // 发布任务
  const handlePublish = async () => {
    // 表单验证 - 完整验证逻辑
    if (!formData.videoUrl) {
      showAlert('输入错误', '请输入视频链接', '⚠️');
      return;
    }
    
    // 验证评论框的内容
    const allComments = Object.values(formData.comments).filter(Boolean);
    const hasEmptyComment = allComments.some(comment => !comment || comment.trim().length < 5);
    
    if (hasEmptyComment) {
      showAlert('输入错误', '请确保所有评论内容都已填写完整', '⚠️');
      return;
    }

    // 显示加载状态
    setIsPublishing(true);
    console.log('开始发布任务...');
    console.log('表单数据:', formData);
    console.log('任务ID:', taskId);

    try {
      // 移除token获取逻辑，后端API会自动处理认证

      // 计算总费用 - 全包任务总价为上评价格+中评价格+下评价格
      const totalCost = taskPrice * 3;
      
      // 余额校验 - 获取当前用户的可用余额
      console.log('[任务发布] 开始余额校验，总费用:', totalCost);
      const balanceResponse = await fetch('/api/finance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      const balanceData = await balanceResponse.json();
      console.log('[任务发布] 余额校验结果:', balanceData);
      
      if (!balanceData.success || !balanceData.data) {
        console.log('[任务发布] 获取余额失败');
        showAlert('系统错误', '获取账户余额失败，请稍后重试', '❌');
        return;
      }
      
      // 获取可用余额
      const availableBalance = balanceData.data.balance?.available || 0;
      console.log('[任务发布] 当前可用余额:', availableBalance);
      
      // 比较余额和总费用
      if (availableBalance < totalCost) {
        console.log('[任务发布] 余额不足，可用余额:', availableBalance, '总费用:', totalCost);
        showAlert(
          '余额不足', 
          `您的账户可用余额为 ¥${availableBalance.toFixed(2)}，完成此任务需要 ¥${totalCost.toFixed(2)}，请先充值再发布任务。`, 
          '⚠️'
        );
        return;
      }
      
      console.log('[任务发布] 余额充足，继续发布流程');

      // 构建API请求体 - 将评论合并为requirements字段
      const requirements = allComments.join('\n\n');
      
      const requestBody = {
        taskId: taskId || '',
        taskTitle,
        taskPrice: taskPrice,
        requirements: requirements,
        videoUrl: formData.videoUrl,
        quantity: 3, // 固定3条评论（上中下各一条）
        deadline: formData.deadline,
        mentions: mentions,
        needImageComment: formData.needImageComment,
        taskMode: 'all'
      };

      console.log('API请求体:', requestBody);
      
      // 调用API发布任务
      const response = await fetch('/api/comment-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('API响应状态:', response.status);

      const result = await response.json();
      console.log('API响应结果:', result);
      
      if (result.success) {
        // 修改为用户点击确认后才跳转
        showAlert(
          '发布成功', 
          `任务发布成功！订单号：${result.order?.orderNumber || ''}`, 
          '✅',
          '确定',
          () => {
            // 在用户点击确认按钮后跳转
            router.push('/publisher/dashboard');
          }
        );
      } else {
        // 发布失败，显示错误提示
        if (result.errorType === 'InsufficientBalance') {
          // 特定处理余额不足的情况
          showAlert('账户余额不足', '您的账户余额不足以支付任务费用，请先充值后再尝试发布任务。', '⚠️', '前往充值', () => {
            router.push('/publisher/finance');
          });
        } else {
          showAlert('发布失败', `任务发布失败: ${result.message || '未知错误'}`, '❌');
        }
      }
    } catch (error) {
      console.error('发布任务时发生错误:', error);
      showAlert('网络错误', '发布任务时发生错误，请稍后重试', '⚠️');
    } finally {
      setIsPublishing(false);
    }
  };

  // 计算总费用
  const totalCost = (taskPrice * 3).toFixed(2);

  // 如果没有找到任务类型，返回错误页面
  if (!taskId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">❌</div>
          <div className="text-lg font-medium text-gray-800 mb-2">任务信息不完整</div>
          <Button 
            onClick={() => router.push('/publisher/create')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回选择任务
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">


      <div className="px-4 py-6 space-y-6">
        {/* 任务套餐介绍 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">任务套餐介绍</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                🔺
              </div>
              <div>
                <h4 className="font-medium text-gray-900">上评任务</h4>
                <p className="text-gray-600 text-sm mt-1">高质量正面评价，突出产品优点和推荐理由</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                🔺
              </div>
              <div>
                <h4 className="font-medium text-gray-900">中评任务</h4>
                <p className="text-gray-600 text-sm mt-1">平衡的评价，既提到优点也可以适度提到一些不影响整体的小问题</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                🔻
              </div>
              <div>
                <h4 className="font-medium text-gray-900">下评任务</h4>
                <p className="text-gray-600 text-sm mt-1">真实的负面评价，指出产品存在的一些不足</p>
              </div>
            </div>
          </div>
        </div>

        {/* 视频链接 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            视频链接 <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="请输入抖音视频链接"
            value={formData.videoUrl}
            onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
            className="w-full"
          />
        </div>

        {/* @用户标记 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            @用户标记
          </label>
          <div className="space-y-3">
            <Input
              placeholder="输入用户ID或昵称"
              value={mentionInput}
              onChange={(e) => setMentionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddMention()}
              className="w-full"
            />
            <Button 
              onClick={handleAddMention}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              添加用户标记
            </Button>
          </div>
          {mentions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {mentions.map((mention, index) => (
                <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                  <span>@{mention}</span>
                  <button 
                    onClick={() => removeMention(mention)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 派单示例模块 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            派单示例模块
          </label>
          
          {/* AI优化和推荐评论功能按钮 */}
          <div className="flex space-x-3 mb-4">
            <Button 
              onClick={handleAIOptimizeComments}
              className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              AI优化评论
            </Button>
            <Button 
              onClick={handleRecommendComments}
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              推荐评论
            </Button>
          </div>
          
          {/* 上评评论 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上评内容
            </label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              rows={3}
              placeholder="请输入上评内容"
              value={formData.comments.topComment}
              onChange={(e) => setFormData({...formData, comments: {...formData.comments, topComment: e.target.value}})}
            />
          </div>
          
          {/* 中评评论 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              中评内容
            </label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              rows={3}
              placeholder="请输入中评内容"
              value={formData.comments.middleComment}
              onChange={(e) => setFormData({...formData, comments: {...formData.comments, middleComment: e.target.value}})}
            />
          </div>
          
          {/* 下评评论 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              下评内容
            </label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              rows={3}
              placeholder="请输入下评内容"
              value={formData.comments.bottomComment}
              onChange={(e) => setFormData({...formData, comments: {...formData.comments, bottomComment: e.target.value}})}
            />
          </div>
          
          {/* 图片评论勾选功能 */}
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="checkbox"
              id="needImageComment"
              checked={formData.needImageComment}
              onChange={(e) => setFormData({...formData, needImageComment: e.target.checked})}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="needImageComment" className="block text-sm font-medium text-gray-700">
              是否需要图片评论，图片评论请在任务要求中明确图片内容要求，然后评论时按照要求发送图片评论。
            </label>
          </div>
          {formData.needImageComment && (
            <div className="mt-2 text-sm text-gray-500">
              请在任务要求中明确图片内容要求
            </div>
          )}
        </div>

        {/* 截止时间 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务截止时间
          </label>
          <select 
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          >
            <option value="0.5">30分钟内</option>
            <option value="12">12小时</option>
            <option value="24">24小时</option>
          </select>
        </div>

        {/* 费用预览 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">费用预览</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">任务费用（上评+中评+下评）</span>
              <span className="font-medium">¥{(taskPrice * 3).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">总计费用</span>
                <span className="font-bold text-lg text-purple-600">¥{totalCost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部固定发布按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
        <Button 
          onClick={handlePublish}
          disabled={!formData.videoUrl}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50"
        >
          立即发布任务 - ¥{totalCost}
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
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        buttonText={alertConfig.buttonText}
        onButtonClick={() => {
          alertConfig.onButtonClick();
          setShowAlertModal(false);
        }}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
}