'use client';

import { Button, Input, AlertModal } from '@/components/ui';
import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PaymentPasswordModal from '@/components/payPalPwd/payPalPwd';
import ImageUpload from '@/components/imagesUpload/ImageUpload';
import {
  PublishTaskFormData,
  PublishSingleTaskRequest,
  PublishSingleTaskResponse
} from '@/app/types/task/publishSingleTaskTypes';

export default function PublishTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL参数获取任务信息，确保searchParams不为null
  const getSearchParam = (key: string) => {
    return searchParams?.get(key) || '';
  };
  
  // 从URL参数获取模板ID和价格
  const templateId = parseInt(getSearchParam('template_id') || '0');
  const taskPrice = parseFloat(getSearchParam('price').trim() || '2');
  
  const [mentionInput, setMentionInput] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  
  // 保存每个评论的图片上传状态
  const [commentImages, setCommentImages] = useState<File[][]>([]);
  const [commentImageUrls, setCommentImageUrls] = useState<string[][]>([]);
  
  // 表单状态
  const [formData, setFormData] = useState<PublishTaskFormData>({
    videoUrl: '', // 默认视频链接
    quantity: 3, // 默认任务数量设为3
    deadline: '30', // 默认截止时间设为30分钟
    comments: [
      {
        content: '',
        image: null,
        imageUrl: ''
      },
      {
        content: '',
        image: null,
        imageUrl: ''
      },
      {
        content: '',
        image: null,
        imageUrl: ''
      }
    ]
  });
  
  // 发布状态
  const [isPublishing, setIsPublishing] = useState(false);
  
  // 支付密码模态框状态
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
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
  
  // 处理任务数量变化，实现与评论输入框的联动
  const handleQuantityChange = (newQuantity: number) => {
    const quantity = Math.max(1, newQuantity); // 确保最小数量为1
    
    setFormData(prevData => {
      let newComments = [...prevData.comments];
      
      // 如果新数量大于现有评论数量，添加新评论
      while (newComments.length < quantity) {
        newComments.push({
          content: '',
          image: null,
          imageUrl: ''
        });
      }
      
      // 如果新数量小于现有评论数量，减少评论
      if (newComments.length > quantity) {
        newComments = newComments.slice(0, quantity);
      }
      
      // 检查是否有@用户标记，如果有，确保它在最新的最后一条评论中
      if (mentions.length > 0 && quantity > 0) {
        // 先从所有评论中移除@用户标记
        newComments = newComments.map(comment => ({
          ...comment,
          content: comment.content.replace(/ @\S+/g, '').trim()
        }));
        
        // 将@用户标记添加到最新的最后一条评论
        const lastIndex = newComments.length - 1;
        newComments[lastIndex] = {
          ...newComments[lastIndex],
          content: newComments[lastIndex].content 
            ? `${newComments[lastIndex].content} @${mentions[0]}` 
            : `@${mentions[0]}`
        };
      }
      
      return {
        ...prevData,
        quantity,
        comments: newComments
      };
    });
    
    // 更新图片数组
    setCommentImages(prevImages => {
      const newImages = [...prevImages];
      // 如果新的数量大于当前图片数组长度，添加空数组
      while (newImages.length < quantity) {
        newImages.push([]);
      }
      // 如果新的数量小于当前图片数组长度，减少数组长度
      if (newImages.length > quantity) {
        return newImages.slice(0, quantity);
      }
      return newImages;
    });
    
    setCommentImageUrls(prevUrls => {
      const newUrls = [...prevUrls];
      // 如果新的数量大于当前URL数组长度，添加空数组
      while (newUrls.length < quantity) {
        newUrls.push([]);
      }
      // 如果新的数量小于当前URL数组长度，减少数组长度
      if (newUrls.length > quantity) {
        return newUrls.slice(0, quantity);
      }
      return newUrls;
    });
  };
  
  // 处理添加@用户标记
  const handleAddMention = () => {
    const trimmedMention = mentionInput.trim();
    
    // 1. 检查是否已经有一个@用户（限制数量为1）
    if (mentions.length >= 1) {
      showAlert('提示', '仅支持添加一个@用户', '💡');
      return;
    }
    
    // 2. 非法字符校验（只允许字母、数字、下划线、中文和@符号）
    const validPattern = /^[a-zA-Z0-9_\u4e00-\u9fa5@]+$/;
    if (!validPattern.test(trimmedMention)) {
      showAlert('提示', '用户ID或昵称包含非法字符，仅支持字母、数字、下划线和中文', '⚠️');
      return;
    }
    
    // 3. 确保用户昵称ID唯一
    if (trimmedMention && !mentions.includes(trimmedMention)) {
      setMentions([trimmedMention]); // 只保留一个用户
      setMentionInput('');
      
      // 将@标记插入到评论列表的最后一条
      if (formData.comments.length > 0) {
        const lastIndex = formData.comments.length - 1;
        setFormData(prevData => {
          const newComments = [...prevData.comments];
          newComments[lastIndex] = {
            ...newComments[lastIndex],
            content: newComments[lastIndex].content 
              ? `${newComments[lastIndex].content} @${trimmedMention}` 
              : `@${trimmedMention}`
          };
          return {
            ...prevData,
            comments: newComments
          };
        });
      }
    } else if (mentions.includes(trimmedMention)) {
      showAlert('提示', '该用户昵称ID已添加', '💡');
    }
  };
  
  // 移除@用户标记
  const removeMention = (mention: string) => {
    setMentions(mentions.filter(m => m !== mention));
    
    // 从所有评论中移除该@标记
    setFormData(prevData => ({
      ...prevData,
      comments: prevData.comments.map(comment => ({
        ...comment,
        content: comment.content?.replace(` @${mention}`, '').replace(`@${mention}`, '') || comment.content
      }))
    }));
  };
  
  // AI优化评论功能
  const handleAIOptimizeComments = () => {
    // 模拟AI优化评论的逻辑
    setFormData(prevData => ({
      ...prevData,
      comments: prevData.comments.map(comment => ({
        ...comment,
        content: comment.content + ' [AI优化]'
      }))
    }));
    showAlert('优化成功', '评论内容已通过AI优化！', '✨');
  };
  
  // 处理图片变化 - 使用useCallback避免无限循环
  const handleImagesChange = useCallback((commentIndex: number, images: File[], urls: string[]) => {
    // 更新评论的图片URL
    setFormData(prevData => {
      const newComments = [...prevData.comments];
      newComments[commentIndex] = {
        ...newComments[commentIndex],
        imageUrl: urls[0] || ''
      };
      return {
        ...prevData,
        comments: newComments
      };
    });
    
    // 更新图片数组状态
    setCommentImages(prevImages => {
      const newImages = [...prevImages];
      newImages[commentIndex] = images;
      return newImages;
    });
    
    setCommentImageUrls(prevUrls => {
      const newUrls = [...prevUrls];
      newUrls[commentIndex] = urls;
      return newUrls;
    });
  }, [setFormData, setCommentImages, setCommentImageUrls]);
  
  // 发布任务 - 处理支付密码提交
  const handlePublishWithPassword = async (password: string) => {
    // 防止重复提交
    if (isPublishing) {
      return;
    }
    
    // 表单验证
    if (!formData.videoUrl.trim()) {
      showAlert('验证失败', '请输入抖音视频链接', 'error');
      setShowPasswordModal(false);
      return;
    }
    
    // 验证评论内容
    const emptyComments = formData.comments.filter(comment => !comment.content || comment.content.trim() === '');
    if (emptyComments.length > 0) {
      showAlert('输入错误', '请填写所有评论内容', '⚠️');
      setShowPasswordModal(false);
      return;
    }
    
    try {
      // 设置加载状态
      setIsPublishing(true);
      
      // 计算总价格
      const totalPrice = taskPrice * formData.quantity;
      
      // 计算截止时间戳（当前时间 + 任务截止时间分钟数）
      const currentTime = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
      const deadlineMinutes = parseInt(formData.deadline);
      const deadline = currentTime + deadlineMinutes * 60;
      
      // 构建请求参数
      const requestData: PublishSingleTaskRequest = {
        template_id: templateId,
        video_url: formData.videoUrl.trim(),
        deadline,
        task_count: formData.quantity,
        total_price: totalPrice,
        pswd: password,
        recommend_marks: formData.comments.map((comment, index) => {
          // 构建recommend_mark对象
          const recommendMark = {
            comment: comment.content?.replace(/ @\S+/g, '').trim() || '',
            image_url: comment.imageUrl,
            at_user: ''
          };
          
          // 如果是最后一条评论且有@用户标记，添加at_user字段
          if (index === formData.comments.length - 1 && mentions.length > 0) {
            recommendMark.at_user = mentions[0];
          }
          
          return recommendMark;
        })
      };

      // 调用API
      const apiUrl = '/api/task/publishSingleTask';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const result: PublishSingleTaskResponse = await response.json();
      
      // 关闭密码模态框
      setShowPasswordModal(false);
      
      // 处理响应
      if (result.code === 0) {
        // 显示成功提示，1秒后自动跳转到指定页面
        showAlert(
          '成功', 
          result.message || '', 
          '✅',
          '确定',
          () => {
            // 延迟1秒后跳转
            setTimeout(() => {
              router.push('/publisher/create/douyin');
            }, 1000);
          }
        );
      } else {
        // 显示失败提示
        showAlert('发布失败', result.message || '任务发布失败，请稍后重试', '❌');
      }
    } catch (error) {
      // 关闭密码模态框
      setShowPasswordModal(false);
      
      // 处理错误
      console.error('发布任务失败:', error);
      showAlert('发布失败', '网络错误，请稍后重试', '⚠️');
    } finally {
      // 无论成功失败，都重置加载状态
      setIsPublishing(false);
    }
  };
  
  // 显示支付密码模态框
  const handlePublish = () => {
    setShowPasswordModal(true);
  };
  
  // 计算总费用
  const totalCost = (taskPrice * formData.quantity).toFixed(2);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-3 space-y-4">
        <h1 className="text-2xl font-bold pl-5">
          发布中评评论
        </h1>

        <div className="text-lg pl-5 text-red-500">
          <span className="text-2xl text-red-500">⚠️</span>提示：发布评论需求请规避抖音平台敏感词，否则会无法完成任务导致浪费宝贵时间。
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

        {/* 截止时间 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务截止时间
          </label>
          <select 
            className="w-full p-3 border border-gray-200 rounded-lg"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          >
            <option value="30">30分钟内</option>
            <option value="720">12小时内</option>
            <option value="1440">24小时内</option>
          </select>
        </div>

        {/* 派单示例模块 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            评论内容
          </label>
          
          {/* AI优化评论功能按钮 */}
          <div className="mb-4">
            <Button 
              onClick={handleAIOptimizeComments}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              AI评论
            </Button>
          </div>
          
          {/* 动态生成评论输入框 */}
          {formData.comments.map((comment, index) => {
            return (
              <div key={index} className="mb-4 py-2 border-b border-gray-200 last:border-b-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  推荐评论 {index + 1}
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder={`请输入推荐评论内容`}
                  value={comment.content}
                  onChange={(e) => {
                    const newComments = [...formData.comments];
                    newComments[index] = {...newComments[index], content: e.target.value};
                    setFormData({...formData, comments: newComments});
                  }}
                />
                       
                {/* 图片上传组件 */}
                <div className="mt-3">
                  <ImageUpload
                    maxCount={1}
                    onImagesChange={(images, urls) => handleImagesChange(index, images, urls)}
                    savePath="comments"
                    title="上传评论图片"
                    columns={1}
                    gridWidth="100px"
                    itemSize="100x100"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* @用户标记 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            @用户标记
          </label>
          <span className="text-sm text-red-500">@用户昵称 请使用抖音唯一名字，如有相同名字请截图发送给评论员识别，否则会造成不便和结算纠纷</span>
          <div className="space-y-3">
            <Input
              placeholder="输入用户ID或昵称（仅支持字母、数字、下划线和中文）"
              value={mentionInput}
              onChange={(e) => setMentionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (!mentions.length && handleAddMention())}
              className="w-full"
              disabled={mentions.length >= 1}
            />
            <Button 
              onClick={handleAddMention}
              className={`w-full py-2 rounded-lg transition-colors ${mentions.length >= 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              disabled={mentions.length >= 1}
            >
              {mentions.length >= 1 ? '已添加用户标记' : '添加用户标记'}
            </Button>
          </div>
          {mentions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {mentions.map((mention, index) => (
                <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                  <span>@{mention}</span>
                  <button 
                    onClick={() => removeMention(mention)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 任务数量 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务数量 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <button 
                onClick={() => handleQuantityChange(formData.quantity - 1)}
                disabled={formData.quantity <= 1}
                className={`w-10 h-10 rounded-full text-lg font-bold transition-colors ${formData.quantity <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-600'}`}
              >
                -
              </button>
            <div className="flex-1">
              <Input
                type="number"
                min="1"
                value={formData.quantity.toString()}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                max="10"
                className="w-full text-2xl font-bold text-gray-900 text-center py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => handleQuantityChange(formData.quantity + 1)}
              className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            中评任务单价为¥{taskPrice}
          </div>
        </div>

        {/* 费用预览 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">费用预览</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">任务费用</span>
              <span className="font-bold text-lg">¥{(taskPrice * formData.quantity).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">总计费用</span>
                <span className="font-bold text-lg text-orange-500">¥{totalCost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部固定发布按钮 - 增强表单提交控制 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3 z-50">
        <Button 
              onClick={handlePublish}
              disabled={!formData.videoUrl.trim() || formData.quantity === undefined || formData.quantity < 1 || isPublishing || formData.comments.some(comment => !comment.content || comment.content.trim() === '')}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50"
            >
              {isPublishing ? '发布中...' : `立即发布任务 - ¥${totalCost}`}
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
      
      {/* 支付密码模态框组件 */}
      <PaymentPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePublishWithPassword}
        loading={isPublishing}
      />
    </div>
  );
}
