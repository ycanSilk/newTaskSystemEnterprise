'use client';

import { Button, Input, AlertModal } from '@/components/ui';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PublishMiddleCommentForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL参数获取任务信息
  const taskId = searchParams?.get('taskId');
  const taskTitle = searchParams?.get('title') || '中评评论';
  const taskIcon = searchParams?.get('icon') || '📝';
  const taskPrice = parseFloat(searchParams?.get('price') || '0');
  const taskDescription = searchParams?.get('description') || '按照任务要求，在指定视频连接发布评论。';
  
  // @用户相关状态
  const [mentionInput, setMentionInput] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  
  // 新的表单数据结构，包含评论和图片上传信息
  // 添加默认信息填充以模拟补单操作
  const [formData, setFormData] = useState({
    videoUrl: '', // 空字符串，让用户手动输入
    quantity: 3, // 默认任务数量设为3
    comments: [
      {
        content: '', // 空内容，让用户手动输入
        image: null as File | null
      },
      {
        content: '', // 空内容，让用户手动输入
        image: null as File | null
      },
      {
        content: '', // 空内容，让用户手动输入
        image: null as File | null
      }
    ]
  });

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

  // 处理任务数量变化，实现与评论输入框的联动
  const handleQuantityChange = (newQuantity: number) => {
    const quantity = Math.max(1, newQuantity); // 确保最小数量为1
    setFormData(prevData => {
      let newComments = [...prevData.comments];
      
      // 如果新数量大于现有评论数量，添加新评论
      while (newComments.length < quantity) {
        newComments.push({
          content: `🔺终端评论${newComments.length + 1}，请输入评论内容`,
          image: null
        });
      }
      
      // 如果新数量小于现有评论数量，移除多余评论
      if (newComments.length > quantity) {
        newComments.splice(quantity);
      }
      
      // 检查是否有@用户标记，如果有，确保它在最新的最后一条评论中
      if (mentions.length > 0 && quantity > 0) {
        // 先从所有评论中移除@用户标记
        newComments = newComments.map(comment => ({
          ...comment,
          content: comment.content.replace(/ @\S+/g, '')
        }));
        
        // 然后将@用户标记添加到最新的最后一条评论
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
        setFormData(prevData => ({
          ...prevData,
          comments: prevData.comments.map((comment, index) => 
            index === lastIndex 
              ? { 
                  ...comment, 
                  content: comment.content 
                    ? `${comment.content} @${trimmedMention}` 
                    : `@${trimmedMention}` 
                } 
              : comment
          )
        }));
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
    // 实际项目中可能需要调用AI API
    setFormData(prevData => ({
      ...prevData,
      comments: prevData.comments.map(comment => ({
        ...comment,
        content: comment.content + ' '
      }))
    }));
    showAlert('优化成功', '评论内容已通过AI优化！', '✨');
  };

  // 图片压缩函数 - 仅在客户端执行
  const compressImage = (file: File): Promise<File> => {
    // 立即返回原始文件，如果在服务器端
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return Promise.resolve(file);
    }
    
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              resolve(file);
              return;
            }
            
            // 保持原图宽高比例
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > MAX_WIDTH) {
                height = height * (MAX_WIDTH / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = width * (MAX_HEIGHT / height);
                height = MAX_HEIGHT;
              }
            }
            
            // 设置canvas尺寸
            canvas.width = width;
            canvas.height = height;
            
            // 绘制图片到canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // 将canvas转换为Blob
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  // 创建新的File对象
                  const compressedFile = new File([blob], file.name, { type: blob.type });
                  resolve(compressedFile);
                } else {
                  // 如果压缩失败，返回原始文件
                  resolve(file);
                }
              },
              'image/jpeg',
              0.8
            );
          };
          
          // 设置图片源
          img.src = event.target?.result as string;
        };
        
        // 读取文件
        reader.readAsDataURL(file);
      } catch (error) {
        // 如果发生任何错误，返回原始文件
        resolve(file);
      }
    });
  };

  // 处理图片上传
  const handleImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('===== 图片上传处理开始 =====');
    console.log('  图片索引:', index);
    console.log('  文件信息:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      console.log('  ❌ 文件类型无效:', file.type);
      showAlert('文件类型错误', '请上传JPG或PNG格式的图片', '⚠️');
      return;
    }

    // 检查文件大小（预压缩检查）
    if (file.size > 2 * 1024 * 1024) { // 2MB
      console.log('  ❌ 文件过大:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
      showAlert('文件过大', '请上传小于2MB的图片', '⚠️');
      return;
    }

    try {
      // 压缩图片
      console.log('  🔄 开始压缩图片...');
      const compressedFile = await compressImage(file);
      
      // 更新表单数据
      setFormData(prevData => {
        const newComments = [...prevData.comments];
        newComments[index] = {
          ...newComments[index],
          image: compressedFile
        };
        return {
          ...prevData,
          comments: newComments
        };
      });
      
      console.log('  ✅ 图片上传处理完成');
    } catch (error) {
      console.error('  ❌ 图片上传处理失败:', error);
      showAlert('图片上传失败', '图片上传过程中发生错误，请重试', '❌');
    }
  };

  // 处理任务发布
  const handlePublishTask = () => {
    setIsPublishing(true);
    
    // 模拟API调用
    setTimeout(() => {
      setIsPublishing(false);
      showAlert('任务发布成功', '您的任务已成功发布！', '✅', '查看任务', () => {
        router.push('/publisher/tasks');
      });
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <span className="text-3xl mr-3">{taskIcon}</span>
          <div>
            <h1 className="text-xl font-bold">{taskTitle}</h1>
            <p className="text-gray-500 text-sm mt-1">{taskDescription}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 视频链接输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">视频链接</label>
            <Input
              type="text"
              placeholder="请输入抖音视频链接"
              value={formData.videoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* 任务数量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">任务数量</label>
            <Input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
              className="w-24"
            />
          </div>

          {/* @用户 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">@用户</label>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="输入用户ID或昵称"
                value={mentionInput}
                onChange={(e) => setMentionInput(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAddMention}
                className="bg-blue-500 hover:bg-blue-600"
              >
                添加
              </Button>
            </div>

            {mentions.length > 0 && (
              <div className="mt-3 flex items-center space-x-2">
                <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                  @{mentions[0]}
                </span>
                <button
                  onClick={() => removeMention(mentions[0])}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* 评论列表 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">评论内容</label>
              <Button
                onClick={handleAIOptimizeComments}
                className="bg-purple-500 hover:bg-purple-600"
              >
                AI优化评论
              </Button>
            </div>

            <div className="space-y-4">
              {formData.comments.map((comment, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      placeholder={`请输入评论内容${index + 1}`}
                      value={comment.content}
                      onChange={(e) => {
                        setFormData(prev => {
                          const newComments = [...prev.comments];
                          newComments[index].content = e.target.value;
                          return { ...prev, comments: newComments };
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      rows={2}
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        className="text-sm text-gray-500"
                      />
                      {comment.image && (
                        <span className="ml-2 text-xs text-gray-400">
                          已选择: {comment.image.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 发布按钮 */}
          <Button
            onClick={handlePublishTask}
            disabled={isPublishing}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            {isPublishing ? '发布中...' : '发布任务'}
          </Button>
        </div>
      </div>

      {/* 通用提示框 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        buttonText={alertConfig.buttonText}
        onClose={() => setShowAlertModal(false)}
        onButtonClick={() => {
          alertConfig.onButtonClick();
          setShowAlertModal(false);
        }}
      />
    </div>
  );
};

export default PublishMiddleCommentForm;