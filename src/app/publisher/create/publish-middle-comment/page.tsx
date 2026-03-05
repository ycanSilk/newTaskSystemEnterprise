'use client';

import { Button, Input, AlertModal, Modal } from '@/components/ui';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ImageUpload from '@/components/imagesUpload/ImageUpload';
import TaskAssistance from '@/components/taskAssistance/taskAssistance';
import MiddleCommentGenerator from '@/components/aiCommentBtn/MiddleCommentGenerator';
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
  
  // 任务数量输入状态
  const [quantityInput, setQuantityInput] = useState(formData.quantity.toString());
  
  // 发布状态
  const [isPublishing, setIsPublishing] = useState(false);
  // AI评论生成状态
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  
  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: '',
    buttonText: '确认',
    onButtonClick: () => {}
  });
  
  // 任务帮助模态框状态
  const [showTaskAssistance, setShowTaskAssistance] = useState(false);
  
  // MiddleCommentGenerator模态框状态
  const [showMiddleCommentGenerator, setShowMiddleCommentGenerator] = useState(false);
  
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
  const handleQuantityChange = (newQuantityStr: string) => {
    // 只允许输入数字
    const cleanValue = newQuantityStr.replace(/[^0-9]/g, '');
    setQuantityInput(cleanValue);
    
    // 如果输入为空，保持内部状态为1
    if (!cleanValue) {
      setFormData(prevData => ({
        ...prevData,
        quantity: 1 // 内部状态保持为1，确保其他逻辑正常
      }));
      return;
    }
    
    const newQuantity = parseInt(cleanValue);
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
  const handleAIOptimizeComments = async () => {
    try {
      const commentCount = formData.comments.length;
      
      // 从comment.json文件中随机获取对应数量的评论作为提示词
      let prompts: string[] = [];
      try {
        const response = await fetch('/file/comment.json');
        const comments = await response.json();
        if (Array.isArray(comments) && comments.length > 0) {
          // 随机获取对应数量的评论，确保不重复
          const shuffled = [...comments].sort(() => 0.5 - Math.random());
          prompts = shuffled.slice(0, commentCount);
          // 如果评论库数量不足，重复使用
          while (prompts.length < commentCount) {
            const randomIndex = Math.floor(Math.random() * comments.length);
            prompts.push(comments[randomIndex]);
          }
        } else {
          showAlert('提示', '评论库加载失败，请稍后重试', '⚠️');
          return;
        }
      } catch (error) {
        console.error('加载评论库失败:', error);
        showAlert('提示', '评论库加载失败，请稍后重试', '⚠️');
        return;
      }
      
      setIsPublishing(true);
      
      // 为每个提示词生成评论
      const generatedComments: string[] = [];
      for (let i = 0; i < commentCount; i++) {
        const response = await fetch('/api/deepseek/polish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            draft: prompts[i], 
            variation: i + 1 // 添加变化参数，确保生成不同的评论
          }),
        });
        
        const result = await response.json();
        console.log(`DeepSeek API 响应 ${i + 1}:`, result);
        if (!response.ok) throw new Error(result.error || '生成失败');
        
        // 确保评论不重复
        let comment = result.polished || '';
        while (generatedComments.includes(comment)) {
          // 如果重复，重新生成
          const retryResponse = await fetch('/api/deepseek/polish', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              draft: prompts[i], 
              variation: i + 1 + Math.random() // 添加随机值确保不同
            }),
          });
          const retryResult = await retryResponse.json();
          comment = retryResult.polished || '';
        }
        
        generatedComments.push(comment);
      }
      
      // 更新所有评论输入框
      setFormData(prevData => ({
        ...prevData,
        comments: prevData.comments.map((comment, index) => ({
          ...comment,
          content: generatedComments[index] || ''
        }))
      }));
      
      showAlert('成功', `已为${commentCount}条评论生成内容！`, '✨');
    } catch (error) {
      console.error('AI生成评论评论失败:', error);
      showAlert('生成失败', '网络错误，请稍后重试', 'error');
    } finally {
      setIsPublishing(false);
    }
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
  
  // 处理MiddleCommentGenerator生成的评论
  const handleCommentsGenerated = (comments: string[]) => {
    setFormData(prevData => {
      let newComments = [...prevData.comments];
      
      // 更新评论内容
      comments.forEach((comment, index) => {
        if (index < newComments.length) {
          newComments[index].content = comment;
        }
      });
      
      return {
        ...prevData,
        comments: newComments
      };
    });
    
    setShowMiddleCommentGenerator(false);
    showAlert('成功', `已为${comments.length}条评论生成内容！`, '✨');
  };
  
  // 发布任务
  const handlePublish = async () => {
    // 防止重复提交
    if (isPublishing) {
      return;
    }
    
    // 表单验证
    if (!formData.videoUrl.trim()) {
      showAlert('验证失败', '请输入抖音视频链接', 'error');
      return;
    }
    
    // 验证评论内容
    const emptyComments = formData.comments.filter(comment => !comment.content || comment.content.trim() === '');
    if (emptyComments.length > 0) {
      showAlert('输入错误', '请填写所有评论内容', '⚠️');
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
      // 处理错误
      console.error('发布任务失败:', error);
      showAlert('发布失败', '网络错误，请稍后重试', '⚠️');
    } finally {
      // 无论成功失败，都重置加载状态
      setIsPublishing(false);
    }
  };
  
  // 计算总费用
  const totalCost = (taskPrice * formData.quantity).toFixed(2);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-3 space-y-4">
        <h1 className="text-2xl font-bold pl-5">
          发布中评评论
        </h1>

        <div className="ml-5">
          <button 
            onClick={() => setShowTaskAssistance(true)}
            className="transition-colors flex items-center text-blue-600"
          >
            任务接单帮助
          </button>
        </div>
         {/* 任务帮助模态框 */}
        <TaskAssistance 
          isOpen={showTaskAssistance} 
          onClose={() => setShowTaskAssistance(false)} 
        />
        <div className="text-lg pl-5 text-red-500">
          <span className="text-1xl text-red-500">⚠️</span>派单禁止提示<br />           
            1.违反平台的：引导词，极限词，赌博以及其他限制词<br />
            2.违反国家禁止的言论<br />
            3.上评没有本@名字的“上评名字或词汇”
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
            <option value="10">10分钟内</option>
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
              onClick={() => setShowMiddleCommentGenerator(true)}
              disabled={isPublishing || isAIGenerating}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAIGenerating ? '生成中...' : 'AI生成评论'}
            </Button>
          </div>
          
          {/* 任务数量 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务数量 <span className="text-red-500">*</span>
            </label>
            <div className="flex-1">
              <Input
                type="text"
                value={quantityInput}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-full text-2xl font-bold text-gray-900 text-center py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入任务数量"
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              中评任务单价为¥{taskPrice}
            </div>
          </div>
          
          {/* 动态生成评论输入框 */}
          {formData.comments.map((comment, index) => {
            return (
              <div key={index} className="mb-4 py-2 border-b border-gray-200 last:border-b-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  推荐评论 {index + 1}
                </label>
                <div className="flex space-x-3">
                  <textarea
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder={`请输入推荐评论内容`}
                    value={comment.content}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const newComments = [...formData.comments];
                      
                      // 检查是否包含@用户标识
                      if (newValue.includes('@')) {
                        // 只有最后一条评论可以包含@用户标识
                        if (index !== formData.comments.length - 1) {
                          showAlert('提示', '@用户标识只能出现在最后一条评论中', '⚠️');
                          return;
                        }
                        
                        // 检查@用户标识是否只出现一次
                        const atCount = (newValue.match(/@/g) || []).length;
                        if (atCount > 1) {
                          showAlert('提示', '每条评论只能包含一个@用户标识', '⚠️');
                          return;
                        }
                      }
                      
                      newComments[index] = {...newComments[index], content: newValue};
                      setFormData({...formData, comments: newComments});
                    }}
                    style={{ height: '80px' }}
                  />
                         
                  {/* 图片上传组件 */}
                  <div>
                    <ImageUpload
                      maxCount={1}
                      onImagesChange={(images, urls) => handleImagesChange(index, images, urls)}
                      savePath="comments"
                      title=""
                      columns={1}
                      gridWidth="80px"
                      itemSize="80x80"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* @用户标记 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3 z-40">
        <Button 
              onClick={handlePublish}
              disabled={!formData.videoUrl.trim() || formData.quantity === undefined || formData.quantity < 1 || isPublishing || isAIGenerating || formData.comments.some(comment => !comment.content || comment.content.trim() === '')}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50"
            >
              {isPublishing ? '发布中...' : `发布任务 - ¥${totalCost}`}
        </Button>
       
      </div>

      {/* 通用提示框组件 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        onButtonClick={() => {
          alertConfig.onButtonClick();
          setShowAlertModal(false);
        }}
        onClose={() => setShowAlertModal(false)}
      />
      
      {/* MiddleCommentGenerator模态框 */}
      <Modal
        isOpen={showMiddleCommentGenerator}
        onClose={() => setShowMiddleCommentGenerator(false)}
        title="AI生成评论"
        className="w-full max-w-md"
      >
        <MiddleCommentGenerator
          onCommentsGenerated={handleCommentsGenerated}
          isLoading={isAIGenerating}
          onLoadingChange={setIsAIGenerating}
          commentCount={formData.quantity}
          atUser={mentions.length > 0 ? mentions[0] : undefined}
          userComments={formData.comments.map(comment => comment.content)}
        />
      </Modal>
      

    </div>
  );
}
