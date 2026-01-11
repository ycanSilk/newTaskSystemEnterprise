'use client';

import { Button, Input, AlertModal } from '@/components/ui';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PublishTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL参数获取任务信息，确保searchParams不为null
  const getSearchParam = (key: string) => {
    return searchParams?.get(key) || '';
  };

  const taskPrice = parseFloat(getSearchParam('price').trim() || '0');

  
  // @用户相关状态 - 只用于中评
  const [mentionInput, setMentionInput] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  
  // 新的表单数据结构，分离上评和中评的数据
  const [formData, setFormData] = useState({
    videoUrl: '',
    
    // 上评评论模块 - 固定为1条
    topComment: {
      content: '',
      image: null as File | null
    },
    
    // 中评评论模块 - 默认3条
    middleQuantity: 3,
    middleComments: [
      {
        content: '',
        image: null as File | null
      },
      {
        content: '',
        image: null as File | null
      },
      {
        content: '',
        image: null as File | null
      }
    ],
    deadline: '1'
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

  // 处理中评任务数量变化，实现与评论输入框的联动
  const handleMiddleQuantityChange = (newQuantity: number) => {
    const quantity = Math.max(0, newQuantity); // 允许数量为0，实现完全移除
    setFormData(prevData => {
      let newComments = [...prevData.middleComments];
      
      // 如果新数量大于现有评论数量，添加新评论
      while (newComments.length < quantity) {
        newComments.push({
          content: `🔺中评评论${newComments.length + 1}，请输入评论内容`,
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
        middleQuantity: quantity,
        middleComments: newComments
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
      
      // 将@标记插入到中评评论列表的最后一条
      if (formData.middleComments.length > 0) {
        const lastIndex = formData.middleComments.length - 1;
        setFormData(prevData => ({
          ...prevData,
          middleComments: prevData.middleComments.map((comment, index) => 
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
    
    // 从所有中评评论中移除该@标记
    setFormData(prevData => ({
      ...prevData,
      middleComments: prevData.middleComments.map(comment => ({
        ...comment,
        content: comment.content?.replace(` @${mention}`, '').replace(`@${mention}`, '') || comment.content
      }))
    }));
  };

  // AI优化上评评论功能
  const handleAITopCommentOptimize = () => {
    // 模拟AI优化评论的逻辑
    // 实际项目中可能需要调用AI API
    setFormData(prevData => ({
      ...prevData,
      topComment: {
        ...prevData.topComment,
        content: prevData.topComment.content + ' '
      }
    }));
    showAlert('优化成功', '上评评论内容已通过AI优化！', '✨');
  };
  
  // AI优化中评评论功能
  const handleAIMiddleCommentsOptimize = () => {
    // 模拟AI优化评论的逻辑
    // 实际项目中可能需要调用AI API
    setFormData(prevData => ({
      ...prevData,
      middleComments: prevData.middleComments.map(comment => ({
        ...comment,
        content: comment.content + ' '
      }))
    }));
    showAlert('优化成功', '中评评论内容已通过AI优化！', '✨');
  };

  // 图片压缩函数
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
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
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // 质量参数，从0到1，1表示最佳质量
          let quality = 0.9;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // 如果压缩后大小仍大于200KB，继续降低质量
          while (compressedDataUrl.length * 0.75 > 200 * 1024 && quality > 0.1) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          
          // 将DataURL转换回File对象
          const byteString = atob(compressedDataUrl.split(',')[1]);
          const mimeString = compressedDataUrl.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          
          const blob = new Blob([ab], { type: mimeString });
          const compressedFile = new File([blob], file.name, { type: mimeString });
          resolve(compressedFile);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // 处理上评评论图片上传
  const handleTopCommentImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 压缩图片
      const compressedFile = await compressImage(file);
      
      // 更新表单数据中的图片
      setFormData(prevData => ({
        ...prevData,
        topComment: { ...prevData.topComment, image: compressedFile }
      }));
      
      showAlert('上传成功', '上评图片已成功上传并压缩！', '✅');
    } catch (error) {
      showAlert('上传失败', '图片上传失败，请重试', '❌');
    }
  };

  // 处理中评评论图片上传
  const handleMiddleCommentImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 压缩图片
      const compressedFile = await compressImage(file);
      
      // 更新表单数据中的图片
      setFormData(prevData => ({
        ...prevData,
        middleComments: prevData.middleComments.map((comment, i) => 
          i === index ? { ...comment, image: compressedFile } : comment
        )
      }));
      
      showAlert('上传成功', '中评图片已成功上传并压缩！', '✅');
    } catch (error) {
      showAlert('上传失败', '图片上传失败，请重试', '❌');
    }
  };

  // 移除上评已上传的图片
  const removeTopCommentImage = () => {
    setFormData(prevData => ({
      ...prevData,
      topComment: { ...prevData.topComment, image: null }
    }));
  };

  // 移除中评已上传的图片
  const removeMiddleCommentImage = (index: number) => {
    setFormData(prevData => ({
      ...prevData,
      middleComments: prevData.middleComments.map((comment, i) => 
        i === index ? { ...comment, image: null } : comment
      )
    }));
  };

  // 发布任务
  const handlePublish = async () => {
    // 表单验证 - 完整验证逻辑
    if (!formData.videoUrl) {
      showAlert('输入错误', '请输入视频链接', '⚠️');
      return;
    }
    
    // 验证任务数量
    if (formData.middleQuantity === undefined) {
      showAlert('输入错误', '请输入任务数量', '⚠️');
      return;
    }
    
    // 评论已调整为可选填项，不再强制验证

    // 显示加载状态
    setIsPublishing(true);

    try {
      // 构建评论详情数据
      const commentDetail: Record<string, string | number> = {};
      
      // 添加commentType字段 - 设置为组合任务
      commentDetail.commentType = 'COMBINATION';
      
      const quantity = parseInt(formData.middleQuantity.toString(), 10);
      
      // 创建FormData用于上传图片和其他数据
      const formDataToSend = new FormData();
      
      console.log('===== 开始构建FormData =====');
      

      formDataToSend.append('taskPrice', taskPrice.toString());
      formDataToSend.append('videoUrl', formData.videoUrl);
      formDataToSend.append('quantity', quantity.toString());
      formDataToSend.append('deadline', formData.deadline); // 使用表单中选择的截止时间
      formDataToSend.append('mentions', JSON.stringify(mentions || []));

      
      // 明确指定上传路径参数 - 使用相对路径格式
      formDataToSend.append('uploadPath', 'public/uploads');
      console.log('已指定上传路径参数: public/uploads');
      
      // 添加上评评论数据
      console.log('处理上评评论数据...');
      formDataToSend.append('linkUrl1', formData.videoUrl || '');
      formDataToSend.append('unitPrice1', taskPrice.toString());
      formDataToSend.append('quantity1', '1');
      
      // 移除上评评论中的@用户标记
      const cleanTopContent = (formData.topComment.content || '').replace(/ @\S+/g, '').trim();
      formDataToSend.append('commentText1', cleanTopContent);
      console.log(`  添加上评评论内容: ${cleanTopContent.substring(0, 50)}${cleanTopContent.length > 50 ? '...' : ''}`);
      
      // 处理上评评论图片上传
      if (formData.topComment.image) {
        const fieldName = 'commentImages1';
        console.log(`  添加上评图片到FormData - 字段名: ${fieldName}`, {
          name: formData.topComment.image.name,
          type: formData.topComment.image.type,
          size: formData.topComment.image.size
        });
        
        try {
          formDataToSend.append(fieldName, formData.topComment.image, formData.topComment.image.name);
          console.log(`  上评图片成功添加到FormData`);
          formDataToSend.append('hasImage1', 'true');
          formDataToSend.append('imagePath1', `uploads/${formData.topComment.image.name}`);
        } catch (e) {
          console.error(`  上评图片添加到FormData失败:`, e);
        }
      } else {
        formDataToSend.append('commentImages1', '');
        formDataToSend.append('hasImage1', 'false');
        console.log(`  上评评论无图片`);
      }
      
      // 为每个中评评论添加数据
      for (let i = 2; i <= quantity + 1; i++) {
        const commentIndex = (i - 2) % formData.middleComments.length;
        const comment = formData.middleComments[commentIndex] || {};
        
        console.log(`\n处理中评评论${i-1}的数据...`);
        
        // 添加评论字段到FormData
        formDataToSend.append(`linkUrl${i}`, formData.videoUrl || '');
        formDataToSend.append(`unitPrice${i}`, taskPrice.toString());
        formDataToSend.append(`quantity${i}`, '1');
        
        // 移除评论内容中的@用户标记
        const cleanContent = (comment.content || '').replace(/ @\S+/g, '').trim();
        formDataToSend.append(`commentText${i}`, cleanContent);
        console.log(`  添加评论内容: ${cleanContent.substring(0, 50)}${cleanContent.length > 50 ? '...' : ''}`);
        
        // 处理图片上传
        if (comment.image) {
          const fieldName = `commentImages${i}`;
          console.log(`  添加图片${i}到FormData - 字段名: ${fieldName}`, {
            name: comment.image.name,
            type: comment.image.type,
            size: comment.image.size
          });
          
          try {
            formDataToSend.append(fieldName, comment.image, comment.image.name);
            console.log(`  图片${i}成功添加到FormData`);
            formDataToSend.append(`hasImage${i}`, 'true');
            formDataToSend.append(`imagePath${i}`, `uploads/${comment.image.name}`);
          } catch (e) {
            console.error(`  图片${i}添加到FormData失败:`, e);
          }
        } else {
          formDataToSend.append(`commentImages${i}`, '');
          formDataToSend.append(`hasImage${i}`, 'false');
          console.log(`  评论${i}无图片`);
        }
        
        // 仅在最后一条评论设置mentionUser
        if (i === quantity + 1 && mentions.length > 0) {
          formDataToSend.append(`mentionUser${i}`, mentions[0]);
        } else {
          formDataToSend.append(`mentionUser${i}`, '');
        }
      }
      
      // 调用API端点，使用FormData进行多部分表单上传
      // 添加超时控制和重试机制
      const MAX_RETRIES = 2;
      let retries = 0;
      let response;
      
      while (retries <= MAX_RETRIES) {
        try {
          // 使用Promise.race添加超时控制
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('请求超时')), 30000); // 30秒超时
          });
          
          console.log('===== 准备发送API请求 =====');
          
          // 统计图片数量
          let imageCount = 0;
          if (formData.topComment.image) imageCount++;
          for (let j = 0; j < formData.middleComments.length; j++) {
            if (formData.middleComments[j].image) imageCount++;
          }
          console.log(`  请求包含图片数量: ${imageCount}`);
          
          response = await Promise.race([
            fetch('/api/task/topmiddlecommnet', {
              method: 'POST',
              body: formDataToSend,
              credentials: 'include',
              headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-File-Upload-Count': imageCount.toString()
              }
            }),
            timeoutPromise
          ]);
          
          console.log(`===== API请求完成 =====`);
          console.log(`  状态码: ${response.status}`);
          
          // 如果响应状态码不是服务器错误，可以继续处理
          if (!response.status.toString().startsWith('5')) {
            break;
          }
          
          // 服务器错误，尝试重试
          retries++;
          if (retries <= MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        } catch (error) {
          retries++;
          if (retries > MAX_RETRIES) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      if (!response) {
        throw new Error('所有上传重试均失败');
      }
      
      // 始终尝试解析响应体
      let result;
      try {
        result = await response.json();
        console.log('响应数据:', result);
      } catch (e) {
        console.error('解析响应失败:', e);
        result = {
          success: false,
          message: '服务器返回无效响应'
        };
      }
      
      // 根据状态码和响应结果进行处理
      if (response.status === 200) {
        if (result.success) {
          // 修改为用户点击确认后才跳转
          showAlert(
            '发布成功', 
            `任务发布成功！订单号：${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`, 
            '✅',
            '确定',
            () => {
              // 在用户点击确认按钮后跳转
              router.push('/publisher/dashboard');
            }
          );
          
          console.log('===== 任务发布成功信息 =====');
          console.log('响应数据:', result);
        } else {
          // 200状态码但success为false的情况
          if (result.errorType === 'InsufficientBalance') {
            // 特定处理余额不足的情况
            showAlert('账户余额不足', '您的账户余额不足以支付任务费用，请先充值后再尝试发布任务。', '⚠️', '前往充值', () => {
              router.push('/publisher/finance');
            });
          } else {
            // 提取并显示返回结果中的message字段内容作为错误提示信息
            showAlert('发布失败', result.message || '任务发布失败', '❌');
          }
        }
      } else {
        // 当API调用返回非200状态码时
        if (response.status === 500) {
          // 特别处理500错误，显示更详细的错误信息
          const errorMessage = result.message || '服务器内部错误，请稍后重试';
          showAlert('发布失败', errorMessage, '❌');
        } else {
          // 其他非200错误
          showAlert('发布失败', result.message || `服务器错误 (${response.status})`, '❌');
        }
      }
    } catch (error) {
      // 分析错误类型给出更具体的提示
      if (error instanceof Error && error.message.includes('时间格式转换失败')) {
        showAlert('时间格式错误', '任务截止时间转换失败，请检查后重试', '⚠️');
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        showAlert('网络错误', '无法连接到服务器，请检查网络连接后重试', '⚠️');
      } else {
        showAlert('网络错误', '发布任务时发生错误，请稍后重试', '⚠️');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const totalCost = (4 + formData.middleQuantity * 2).toFixed(2);
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-3 space-y-4">
        <div className="text-lg text-red-500">
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
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          >
            <option value="0.5">30分钟内</option>
            <option value="12">12小时</option>
            <option value="24">24小时</option>
          </select>
        </div>

        {/* 上评评论模块 - 新增 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上评评论
            </label>
            
            {/* AI优化评论功能按钮 */}
            <div className="mb-4">
              <Button 
                onClick={handleAITopCommentOptimize}
                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                AI优化评论
              </Button>
            </div>
            
            {/* 上评评论输入框 - 固定一条 */}
            <div className="mb-1 py-2 border-b border-gray-900">
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="请输入上评评论内容"
                value={formData.topComment.content}
                onChange={(e) => {
                  setFormData({...formData, topComment: {...formData.topComment, content: e.target.value}});
                }}
              />
              
              {/* 图片上传区域 */}
              <div className="mt-1">
                <div className="flex items-end space-x-3">
                  <div 
                    className={`w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${formData.topComment.image ? 'border-green-500' : 'border-gray-300 hover:border-blue-500'}`}
                    onClick={() => document.getElementById('top-comment-image-upload')?.click()}
                  >
                    {formData.topComment.image ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={URL.createObjectURL(formData.topComment.image)} 
                          alt="上评评论图片" 
                          className="w-full h-full object-cover rounded"
                        />
                        <button 
                          type="button"
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTopCommentImage();
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xl">+</span>
                        <span className="text-xs text-gray-500 mt-1">点击上传图片</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    支持JPG、PNG格式，最大200KB
                  </div>
                </div>
                <input
                  id="top-comment-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleTopCommentImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* 中评评论模块 - 修改自原评论区域 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm overflow-y-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              中评评论
            </label>
            
            {/* AI优化评论功能按钮 */}
            <div className="mb-4">
              <Button 
                onClick={handleAIMiddleCommentsOptimize}
                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                AI优化评论
              </Button>
            </div>
            
            {/* 动态生成中评评论输入框 */}
            {formData.middleComments.map((comment, index) => {
              return (
                <div key={index} className="mb-1 py-2 border-b border-gray-900">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    中评评论{index + 1}
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder={`默认最后一条评论带@功能`}
                    value={comment.content}
                    onChange={(e) => {
                      const newComments = [...formData.middleComments];
                      newComments[index] = {...newComments[index], content: e.target.value};
                      setFormData({...formData, middleComments: newComments});
                    }}
                  />
                  
                  {/* 图片上传区域 */}
                  <div className="mt-1">
                    <div className="flex items-end space-x-3">
                      <div 
                        className={`w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${comment.image ? 'border-green-500' : 'border-gray-300 hover:border-blue-500'}`}
                        onClick={() => document.getElementById(`middle-image-upload-${index}`)?.click()}
                      >
                        {comment.image ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={URL.createObjectURL(comment.image)} 
                              alt={`中评评论${index + 1}图片`} 
                              className="w-full h-full object-cover rounded"
                            />
                            <button 
                              type="button"
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMiddleCommentImage(index);
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xl">+</span>
                            <span className="text-xs text-gray-500 mt-1">点击上传图片</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        支持JPG、PNG格式，最大200KB
                      </div>
                    </div>
                    <input
                      id={`middle-image-upload-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMiddleCommentImageUpload(index, e)}
                      className="hidden"
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

        {/* 任务数量 - 移至评论区域下方 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              中评任务数量 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleMiddleQuantityChange(Math.max(1, formData.middleQuantity - 1))}
                className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center text-lg font-bold transition-colors"
              >
                -
              </button>
              <div className="flex-1">
                <Input
                  type="number"
                  min="1"
                  value={formData.middleQuantity.toString()}
                  onChange={(e) => handleMiddleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-full text-2xl font-bold text-gray-900 text-center py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                onClick={() => handleMiddleQuantityChange(formData.middleQuantity + 1)}
                className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center text-lg font-bold transition-colors"
              >
                +
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              上评任务固定1条，中评任务单价为¥{taskPrice.toFixed(1)}
            </div>
          </div>

        {/* 费用预览 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between">
                <span className="font-medium text-gray-900">总计费用</span>
                <span className="font-bold text-lg text-orange-500">¥{totalCost}</span>
            </div>
        </div>
      </div>

      {/* 底部固定发布按钮 - 增强表单提交控制 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
        <Button 
            onClick={handlePublish}
            disabled={!formData.videoUrl || formData.middleQuantity === undefined}
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
    </div>
  );
}