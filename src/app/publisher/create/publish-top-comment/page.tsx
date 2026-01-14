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
  const taskPrice = parseFloat(getSearchParam('price').trim() || '4');

  // 表单状态
  const [formData, setFormData] = useState<PublishTaskFormData>({
    videoUrl: '', // 默认视频链接
    quantity: 1, // 默认任务数量设为1
    comments: [
      {
        content: '',
        image: null,
        imageUrl: ''
      }
    ],
    deadline: '30' // 默认截止时间设为30分钟
  });
  
  // 保存每个评论的图片上传状态
  const [commentImages, setCommentImages] = useState<File[][]>([]);
  const [commentImageUrls, setCommentImageUrls] = useState<string[][]>([]);

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

  // 任务数量变化处理 - 允许1-10个任务
  const handleQuantityChange = (newQuantity: number) => {
    // 限制数量在1-10之间
    const quantity = Math.max(1, Math.min(10, newQuantity));
    
    setFormData(prevData => {
      // 获取当前评论数量
      const currentCommentCount = prevData.comments.length;
      
      // 如果新的数量大于当前评论数量，添加新的评论项
      if (quantity > currentCommentCount) {
        const newComments = [...prevData.comments];
        for (let i = currentCommentCount; i < quantity; i++) {
          newComments.push({
            content: ``,
            image: null,
            imageUrl: ''
          });
        }
        return {
          ...prevData,
          quantity,
          comments: newComments
        };
      }
      // 如果新的数量小于当前评论数量，减少评论项
      else if (quantity < currentCommentCount) {
        return {
          ...prevData,
          quantity,
          comments: prevData.comments.slice(0, quantity)
        };
      }
      // 如果数量不变，只更新quantity
      return {
        ...prevData,
        quantity
      };
    });
    
    // 更新图片数组
    setCommentImages(prevImages => {
      const newImages = [...prevImages];
      // 如果新的数量大于当前图片数组长度，添加空数组
      if (quantity > newImages.length) {
        for (let i = newImages.length; i < quantity; i++) {
          newImages.push([]);
        }
      }
      // 如果新的数量小于当前图片数组长度，减少数组长度
      else if (quantity < newImages.length) {
        return newImages.slice(0, quantity);
      }
      return newImages;
    });
    
    setCommentImageUrls(prevUrls => {
      const newUrls = [...prevUrls];
      // 如果新的数量大于当前URL数组长度，添加空数组
      if (quantity > newUrls.length) {
        for (let i = newUrls.length; i < quantity; i++) {
          newUrls.push([]);
        }
      }
      // 如果新的数量小于当前URL数组长度，减少数组长度
      else if (quantity < newUrls.length) {
        return newUrls.slice(0, quantity);
      }
      return newUrls;
    });
  };
  
  // AI优化评论功能
  const handleAIOptimizeComments = () => {
    // 模拟AI优化评论的逻辑
    setFormData(prevData => ({
      ...prevData,
      comments: prevData.comments.map(comment => ({
        ...comment,
        content: comment.content + ' '
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
    const validComments = formData.comments.filter(comment => comment.content.trim() !== '');
    if (validComments.length === 0) {
      showAlert('验证失败', '请输入评论内容', 'error');
      setShowPasswordModal(false);
      return;
    }
    
    // 验证任务数量
    if (!formData.quantity || formData.quantity < 1) {
      showAlert('验证失败', '请设置有效的任务数量', 'error');
      setShowPasswordModal(false);
      return;
    }
    
    try {
      // 设置加载状态
      setIsPublishing(true);
      
      // 计算总价格
      const totalPrice = taskPrice * formData.quantity;
      
      // 计算截止时间戳（当前时间 + 任务截止时间（分钟））
      const currentTime = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
      const deadline = currentTime + parseInt(formData.deadline) * 60;
      
      // 构建请求体
      const requestBody: PublishSingleTaskRequest = {
        template_id: templateId,
        video_url: formData.videoUrl.trim(),
        deadline,
        task_count: formData.quantity,
        total_price: totalPrice,
        pswd: password,
        recommend_marks: formData.comments.map(comment => ({
          comment: comment.content.trim(),
          image_url: comment.imageUrl,
          at_user: ''
        }))
      };

      // 调用API
      const apiUrl = '/api/task/publishSingleTask';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const result: PublishSingleTaskResponse = await response.json();
      
      // 关闭密码模态框
      setShowPasswordModal(false);
      
      // 处理响应
      if (result.code === 0) {
        // 成功处理
        showAlert('发布成功', result.message, 'success', '确定', () => {
          router.push('/publisher/dashboard');
        });
      } else {
        // 失败处理
        showAlert('发布失败', result.message || '发布任务失败，请稍后重试', 'error');
      }
    } catch (error) {
      // 错误处理
      console.error('发布任务失败:', error);
      setShowPasswordModal(false);
      showAlert('发布失败', '网络错误，请稍后重试', 'error');
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
          发布上评评论
        </h1>

        <div className="text-lg pl-5 text-red-500">
          <span className="text-1xl text-red-500">⚠️</span>提示：发布评论需求请规避抖音平台敏感词，否则会无法完成任务导致浪费宝贵时间。
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
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          >
            <option value="0.5">30分钟内</option>
            <option value="12">12小时</option>
            <option value="24">24小时</option>
          </select>
        </div>

        {/* 评论内容 */}
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
          
          {/* 动态渲染评论输入框 */}
          {formData.comments.map((comment, index) => (
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
                      gridWidth="100px" // 设置网格宽度与单个上传项宽度一致
                      itemSize="100x100" // 设置单个上传项尺寸为100x100像素
                    />
                  </div>
                </div>
          ))}

        </div>

        {/* 任务数量 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务数量 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleQuantityChange(formData.quantity - 1)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${formData.quantity <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
              disabled={formData.quantity <= 1}
            >
              -
            </button>
            <div className="flex-1">
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-full text-2xl font-bold text-gray-900 text-center py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => handleQuantityChange(formData.quantity + 1)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${formData.quantity >= 10 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
              disabled={formData.quantity >= 10}
            >
              +
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            上评任务单价为¥{taskPrice}，最多可发布10个任务
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
        <Button 
          onClick={handlePublish}
          disabled={!formData.videoUrl.trim() || formData.quantity === undefined || formData.quantity < 1 || isPublishing}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50"
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
