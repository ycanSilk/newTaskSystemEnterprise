'use client';

import { Button, Input, AlertModal } from '@/components/ui';
import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ImageUpload from '@/components/imagesUpload/ImageUpload';
import TaskAssistance from '@/components/taskAssistance/taskAssistance';

import {
  PublishTaskFormData,
  PublishSingleTaskRequest,
  PublishSingleTaskResponse
} from '@/app/types/task/publishSingleTaskTypes';

export default function PublishTaskPage() {

    // 状态管理 - 只保留必要的UI状态
  const [showModal, setShowModal] = useState(false); // 控制模态框显示
  const [modalMessage, setModalMessage] = useState(''); // 模态框消息内容
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // 用于放大查看的图片URL
  const [currentTemplateId, setCurrentTemplateId] = useState<number | null>(null); // 当前任务的template_id
  const [showTaskAssistance, setShowTaskAssistance] = useState(false); // 控制任务帮助模态框显示

  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL参数获取任务信息，确保searchParams不为null
  const getSearchParam = (key: string) => {
    return searchParams?.get(key) || '';
  };
  
  // 从URL参数获取模板ID和价格
  const templateId = parseInt(getSearchParam('template_id') || '0');
  const taskPrice = parseFloat(getSearchParam('price').trim() || '4');
    // 生成相关
  const [maxLength, setMaxLength] = useState(10);
  const [generated, setGenerated] = useState('');

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
  const [quantityInput, setQuantityInput] = useState(formData.quantity.toString());
  
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
  
  // AI生成评论功能
  const handleAIGenerateComments = async () => {
    try {
      setIsPublishing(true);
      
      const response = await fetch('/api/deepseek/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxLength }), // 只发送 maxLength
      });

      
      const result = await response.json();
      console.log('DeepSeek API 响应:', result);
      if (!response.ok) throw new Error(result.error || '生成失败');

      setFormData(prevData => ({
        ...prevData,
        comments: prevData.comments.map(comment => ({
          ...comment,
          content: result.comment || ''
        }))
      }));
      showAlert('生成成功', '评论内容已通过AI生成！', '✨');
    } catch (error) {
      console.error('AI生成评论失败:', error);
      showAlert('生成失败', '网络错误，请稍后重试', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // AI生成评论评论功能
  const handleAIPolishComments = async () => {
    try {
      const commentCount = formData.comments.length;
      
      // 获取第一个评论的内容作为提示词
      let firstComment = formData.comments[0]?.content || '';
      
      // 如果评论为空，从comment.json文件中随机获取一个评论
      if (!firstComment) {
        try {
          const response = await fetch('/file/comment.json');
          const comments = await response.json();
          if (Array.isArray(comments) && comments.length > 0) {
            const randomIndex = Math.floor(Math.random() * comments.length);
            firstComment = comments[randomIndex];
          } else {
            showAlert('提示', '评论库加载失败，请先输入评论内容', '⚠️');
            return;
          }
        } catch (error) {
          console.error('加载评论库失败:', error);
          showAlert('提示', '评论库加载失败，请先输入评论内容', '⚠️');
          return;
        }
      }
      
      setIsPublishing(true);
      console.log('生成提示词:', firstComment);
      
      // 为每个评论生成不同的内容
      const generatedComments: string[] = [];
      
      for (let i = 0; i < commentCount; i++) {
        const response = await fetch('/api/deepseek/polish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            draft: firstComment, 
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
              draft: firstComment, 
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

  // 检查评论是否包含屏蔽词并返回具体的屏蔽词
  const checkShieldWordsWithDetails = (content: string, shieldWords: string[]) => {
    return shieldWords.filter(word => content.includes(word));
  };

  // 发布任务
  const handlePublish = async () => {
    // 防止重复提交
    if (isPublishing) {
      return;
    }
    
    // 1. 验证视频链接
    if (!formData.videoUrl.trim()) {
      showAlert('验证失败', '请输入抖音视频链接', 'error');
      return;
    }
    
    // 2. 验证截止时间
    if (!formData.deadline) {
      showAlert('验证失败', '请选择任务截止时间', 'error');
      return;
    }
    
    // 3. 验证评论内容
    const validComments = formData.comments.filter(comment => comment.content.trim() !== '');
    if (validComments.length === 0) {
      showAlert('验证失败', '请输入评论内容', 'error');
      return;
    }
    
    // 4. 验证任务数量
    if (!formData.quantity || formData.quantity < 1) {
      showAlert('验证失败', '请设置有效的任务数量', 'error');
      return;
    }
    
    try {
      // 加载屏蔽词列表
      const shieldWords = await loadShieldWords();
      
      // 5. 检查评论是否包含屏蔽词
      let foundShieldWords: string[] = [];
      formData.comments.forEach(comment => {
        const commentShieldWords = checkShieldWordsWithDetails(comment.content, shieldWords);
        if (commentShieldWords.length > 0) {
          foundShieldWords = [...foundShieldWords, ...commentShieldWords];
        }
      });
      
      if (foundShieldWords.length > 0) {
        // 去重并显示屏蔽词
        const uniqueShieldWords = foundShieldWords.filter((word, index, self) => self.indexOf(word) === index);
        showAlert('验证失败', `评论中包含敏感词: ${uniqueShieldWords.join('、')}，请重新输入评论`, 'error');
        return;
      }
      
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
      
      // 处理响应
      if (result.code === 0) {
        // 成功处理
        showAlert('发布成功', result.message, 'success', '确定', () => {
          router.push('/publisher/create/douyin');
        });
      } else {
        // 失败处理
        showAlert('发布失败', result.message || '发布任务失败，请稍后重试', 'error');
      }
    } catch (error) {
      // 错误处理
      console.error('发布任务失败:', error);
      showAlert('发布失败', '网络错误，请稍后重试', 'error');
    } finally {
      // 无论成功失败，都重置加载状态
      setIsPublishing(false);
    }
  };
  
  // 计算总费用
  const totalCost = (taskPrice * formData.quantity).toFixed(2);

  // 加载屏蔽词列表
  const loadShieldWords = async () => {
    try {
      const response = await fetch('/file/shield.json');
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('加载屏蔽词列表失败:', error);
      return [];
    }
  };

  // 过滤评论中的屏蔽词
  const filterShieldWords = (content: string, shieldWords: string[]) => {
    let filteredContent = content;
    shieldWords.forEach(word => {
      if (filteredContent.includes(word)) {
        const replacement = '**'.repeat(Math.ceil(word.length / 2));
        filteredContent = filteredContent.replace(new RegExp(word, 'gi'), replacement);
      }
    });
    return filteredContent;
  };

  // 检查评论是否包含屏蔽词
  const checkShieldWords = (content: string, shieldWords: string[]) => {
    return shieldWords.some(word => content.includes(word));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-3 space-y-2">
        <h1 className="text-2xl font-bold pl-5">
          发布上评评论
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
          <span className="text-1xl text-red-500">⚠️</span>派单禁止提示：<br />
            1.作者有删除评论习惯的视频<br />
            2.违反平台的：引导词，极限词，赌博以及其他限制词<br />
            3.违反国家禁止的言论
        </div>

        {/* 视频链接 */}
        <div className="bg-white rounded-md px-4  py-2 shadow-sm">
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
        <div className="bg-white rounded-md px-4  py-2 shadow-sm">
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

        {/* 评论内容 */}
        <div className="bg-white rounded-md px-4  py-2 shadow-sm overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            评论内容
          </label>
          
          {/* AI优化评论功能按钮 */}
          <div className="mb-2 flex justify-center space-x-4">
            <Button 
              onClick={() => handleAIPolishComments()}
              className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex-1 "
            >
              AI生成评论
            </Button>
          </div>
          {/* 任务数量 */}
        <div className="bg-white rounded-md shadow-sm">
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
            上评任务单价为¥{taskPrice}，最多可发布10个任务
          </div>
        </div>
          {/* 动态渲染评论输入框 */}
          {formData.comments.map((comment, index) => (
            <div key={index} className="mb-2 py-2 border-b border-gray-200 last:border-b-0">
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
                    const newComments = [...formData.comments];
                    newComments[index] = {...newComments[index], content: e.target.value};
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
          ))}

        </div>

        

        {/* 费用预览 */}
        <div className="bg-white rounded-md px-4  py-2 shadow-sm">
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
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md font-bold text-lg disabled:opacity-50"
        >
          发布任务 - ¥{totalCost}
        </Button>
        <Button 
          onClick={() => router.back()}
          variant="secondary"
          className="w-full py-3 border border-gray-200 text-gray-700 rounded-md"
        >
          取消
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
      

    </div>
  );
}
