'use client';

import { Button, Input, Modal } from '@/components/ui';
import GlobalWarningModal from '@/components/button/globalWarning/GlobalWarningModal';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ImageUpload from '@/components/imagesUpload/ImageUpload';
import TaskAssistance from '@/components/taskAssistance/middleTask';
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
  const taskPrice = parseFloat(getSearchParam('stage1Price') || getSearchParam('price').trim() || '2');
  const taskQuantity = parseInt(getSearchParam('stage1Count') || '3'); // 默认为3

  const [mentionInput, setMentionInput] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);

  // 保存每个评论的图片上传状态
  const [commentImages, setCommentImages] = useState<File[][]>(Array.from({ length: taskQuantity }, () => []));
  const [commentImageUrls, setCommentImageUrls] = useState<string[][]>(Array.from({ length: taskQuantity }, () => []));

  // 表单状态
  const [formData, setFormData] = useState<PublishTaskFormData>({
    videoUrl: '', // 默认视频链接
    quantity: taskQuantity, // 使用URL传递的任务数量
    deadline: '30', // 默认截止时间设为30分钟
    comments: Array.from({ length: taskQuantity }, () => ({
      content: '',
      image: null,
      imageUrl: ''
    }))
  });

  // 任务数量输入状态
  const [quantityInput, setQuantityInput] = useState(taskQuantity.toString());

  // 发布状态
  const [isPublishing, setIsPublishing] = useState(false);
  // AI评论生成状态
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  // 选择状态
  const [selectedIndustry, setSelectedIndustry] = useState('无');
  // 选项列表
  const [industryOptions, setIndustryOptions] = useState<string[]>(['无']);
  // 会话ID
  const [sessionId, setSessionId] = useState('');
  
  // 只在浏览器环境中初始化会话ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('comment_session_id');
      if (stored) {
        setSessionId(stored);
      } else {
        const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('comment_session_id', newId);
        setSessionId(newId);
      }
    }
  }, []);

  // 加载选项
  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const response = await fetch('/rules/middle_comment.json');
        if (response.ok) {
          const data = await response.json();
          if (data.rules?.Industry) {
            setIndustryOptions(data.rules.Industry);
          }
        }
      } catch (error) {
        console.error('加载选项失败:', error);
      }
    };
    loadIndustries();
  }, []);

  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    message: '',
    buttonText: '确认',
    redirectUrl: ''
  });



  // 任务帮助模态框状态
  const [showTaskAssistance, setShowTaskAssistance] = useState(false);

  // MiddleCommentGenerator模态框状态
  const [showMiddleCommentGenerator, setShowMiddleCommentGenerator] = useState(false);

  // 验证视频链接
  const validateVideoUrl = (url: string) => {
    return url.length > 35 && (
      url.includes('复制打开抖音') || 
      url.includes('复制此链接，打开Dou音搜索') || 
      url.includes('douyin.com')||
      url.includes('复制打开:/ 抖音')||
      url.includes('复制打开')||
      url.includes('抖音')
    );
  };



  // 显示通用提示框
  const showAlert = (
    message: string,
    buttonText?: string,
    redirectUrl?: string
  ) => {
    setAlertConfig({
      message,
      buttonText: buttonText || '确认',
      redirectUrl: redirectUrl || ''
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

      // 先从所有评论中移除@用户标记
      newComments = newComments.map(comment => ({
        ...comment,
        content: comment.content.replace(/ @\S+/g, '').replace(/@\S+/g, '').trim()
      }));

      // 检查是否有@用户标记，如果有，确保它在最新的最后一条评论中
      if (mentions.length > 0 && quantity > 0) {
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
      showAlert('仅支持添加一个@用户', '确认', '');
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
      showAlert('该用户昵称ID已添加', '确认', '');
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
        content: comment.content ? (
          // 以"@"符号作为标识，获取输入的ID所包含的位数，然后在评论内容中定位"@"符号的起始位置，接着从该起始位置开始，向右偏移等于ID位数的长度，最后将从"@"符号开始到偏移结束的整个区域（包括"@"符号本身）进行删除操作
          (() => {
            let content = comment.content;
            const atIndex = content.indexOf(`@${mention}`);
            if (atIndex !== -1) {
              const start = atIndex;
              const end = atIndex + 1 + mention.length;
              content = content.substring(0, start) + content.substring(end);
            }
            return content.trim();
          })()
        ) : comment.content
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
            showAlert('评论库加载失败，请稍后重试', '确认', '');
            return;
          }
      } catch (error) {
        console.error('加载评论库失败:', error);
        showAlert('评论库加载失败，请稍后重试', '确认', '');
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

      showAlert(`已为${commentCount}条评论生成内容！`, '确认', '');
    } catch (error) {
      console.error('AI生成评论评论失败:', error);
      showAlert('网络错误，请稍后重试', '确认', '');
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
          let processedComment = comment;
          if (index < comments.length - 1) {
            // 非最后一条评论，移除所有@用户标识
            processedComment = comment.replace(/@\S+/g, '').trim();
          } else if (mentions.length > 0) {
            // 最后一条评论，确保只包含一个@用户标识
            const atMatches = processedComment.match(/@\S+/g);
            if (atMatches && atMatches.length > 1) {
              // 如果有多个@标识，只保留第一个
              const firstAt = atMatches[0];
              processedComment = processedComment.replace(/@\S+/g, '').trim() + ` ${firstAt}`;
            } else if (!atMatches) {
              // 如果没有@标识，添加一个
              processedComment = processedComment.trim() + ` @${mentions[0]}`;
            }
          }
          newComments[index].content = processedComment;
        }
      });

      return {
        ...prevData,
        comments: newComments
      };
    });

    setShowMiddleCommentGenerator(false);
    showAlert(`已为${comments.length}条评论生成内容！`, '确认', '');
  };

  // 发布任务
  const handlePublish = async () => {
    // 防止重复提交
    if (isPublishing) {
      return;
    }



    // 表单验证
    if (!formData.videoUrl.trim()) {
      showAlert('请输入抖音视频链接', '确认', '');
      return;
    }

    // 验证视频链接格式
    if (!validateVideoUrl(formData.videoUrl)) {
      showAlert('请输入有效的视频链接', '确认', '');
      return;
    }

    // 验证评论内容
    const emptyComments = formData.comments.filter(comment => !comment.content || comment.content.trim() === '');
    if (emptyComments.length > 0) {
      showAlert('请填写所有评论内容', '确认', '');
      return;
    }

    try {
      // 设置加载状态
      setIsPublishing(true);

      // 计算总价格
      const totalPrice = taskPrice * formData.quantity;

      // 构建请求参数
      const requestData: PublishSingleTaskRequest = {
        template_id: templateId,
        video_url: formData.videoUrl.trim(),
        deadline: Math.floor(Date.now() / 1000) + 30 * 60,
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
      if (result.code === 0) {
        // 发布成功 - 统一跳转到 /publisher/create/douyin
        showAlert(result.message || '任务发布成功！', '确定', '/publisher/create/douyin');
      } else if (result.code === 4001) {
        showAlert('发布失败', '确定', '');
      } else if (result.code === 4002) {
        showAlert('发布失败', '确定', '');
      } else if (result.code === 4003) {
        showAlert('视频链接不能为空', '确定', '');
      } else if(result.code === 4004){
        showAlert('截止时间不能为空', '确定', '');
      } else if(result.code === 4005){
        showAlert('到期时间不能早于当前时间', '确定', '');
      } else if(result.code === 4006){
        showAlert('发布失败', '确定', '');
      } else if(result.code === 4007){
        showAlert('发布失败', '确定', '');
      } else if(result.code === 4008){
        showAlert('任务数量必须大于 0', '确定', '');
      } else if(result.code === 4009){
        showAlert('截止时间不能为空', '确定', '');
      } else if(result.code === 4016){
        showAlert('余额不足', '确定', '/publisher/recharge');
      } else if(result.code === 5002){
        showAlert('任务发布失败', '确定', '');
      } else if(result.code === 5001){
        showAlert('网络超时', '确定', '');
      }else if(result.code === 4014){
        showAlert('评论不能为空', '确定', '');
      }
    } catch (error) {
      // 处理错误
      console.error('发布任务失败:', error);
      showAlert('网络错误，请稍后重试', '确认', '');
    } finally {
      // 无论成功失败，都重置加载状态
      setIsPublishing(false);
    }
  };

  // 计算总费用
  const totalCost = (taskPrice * formData.quantity).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-3 space-y-2">
        <h1 className="text-2xl font-bold pl-5">
          发布中评评论<span className="text-blue-500 cursor-pointer hover:underline ml-5" onClick={() => setShowTaskAssistance(true)}>！派单演示</span>
        </h1>

        <div className="ml-5">
          <button
            onClick={() => setShowTaskAssistance(true)}
            className="transition-colors flex items-center text-blue-600"
          >
            派单禁止项
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
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <label className="text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
            <span>视频链接 <span className="text-red-500">*</span></span>
            <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => setShowTaskAssistance(true)}>*派单指引</span>
          </label>
          <Input
            placeholder="请输入抖音视频链接"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            className={`w-full ${formData.videoUrl.length > 0 && !validateVideoUrl(formData.videoUrl) ? 'border-red-500' : 'border-gray-200'}`}
          />
          {formData.videoUrl.length > 0 && !validateVideoUrl(formData.videoUrl) && (
            <p className="text-sm text-red-500 mt-1">
              {formData.videoUrl.length <= 35 ? '错误的口令，请提交你做单的评论口令' : '错误的口令，请提交你做单的评论口令'}
            </p>
          )}
        </div>



        {/* 派单示例模块 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            评论内容
          </label>
          {/* @用户标记 */}
          <div className="bg-white shadow-sm">
            <span className="text-sm text-red-500">@用户昵称 请使用抖音名称或唯一ID</span>
            <div className="space-y-3">
              <Input
                placeholder="输入用户ID或名称"
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
          {/* AI优化评论功能按钮 */}
          <div className="mb-4 mt-2">
            <Button
              onClick={() => setShowMiddleCommentGenerator(true)}
              disabled={isPublishing || isAIGenerating}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAIGenerating ? '生成中...' : 'AI生成评论'}
            </Button>
          </div>

          {/* 任务数量 */}
          <div className="mb-2">
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
                    placeholder={`第一条评论请输入你推荐的话术、默认最后一条评论带@功能`}
                    value={comment.content}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const newComments = [...formData.comments];

                      // 检查是否包含@用户标识
                      if (newValue.includes('@')) {
                        // 只有最后一条评论可以包含@用户标识
                        if (index !== formData.comments.length - 1) {
                          showAlert('@用户标识只能出现在最后一条评论中', '确认', '');
                          return;
                        }

                        // 检查@用户标识是否只出现一次
                        const atCount = (newValue.match(/@/g) || []).length;
                        if (atCount > 1) {
                          showAlert('每条评论只能包含一个@用户标识', '确认', '');
                          return;
                        }
                      }

                      newComments[index] = { ...newComments[index], content: newValue };
                      setFormData({ ...formData, comments: newComments });
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



        {/* 费用预览 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
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
          disabled={!formData.videoUrl.trim() || !validateVideoUrl(formData.videoUrl) || formData.quantity === undefined || formData.quantity < 1 || isPublishing || isAIGenerating || formData.comments.some(comment => !comment.content || comment.content.trim() === '')}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50"
        >
          {isPublishing ? '发布中...' : `发布任务 - ¥${totalCost}`}
        </Button>

      </div>

      {/* 通用提示框组件 */}
      <GlobalWarningModal
        isOpen={showAlertModal}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        redirectUrl={alertConfig.redirectUrl}
        iconType="success"
        onClose={() => setShowAlertModal(false)}
      />

      {/* MiddleCommentGenerator模态框 */}
      <Modal
        isOpen={showMiddleCommentGenerator}
        onClose={() => setShowMiddleCommentGenerator(false)}
        title="AI生成评论"
        className="w-full max-w-md"
      >
        {/* 筛选下拉菜单 */}
        <div className="bg-white rounded-md  shadow-sm ">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择
          </label>
          <select
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
          >
            {industryOptions.map((industry, index) => (
              <option key={index} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
        
        <MiddleCommentGenerator
          onCommentsGenerated={handleCommentsGenerated}
          onProgressUpdate={(current, total) => {
            // 可选：显示进度
            console.log(`生成进度: ${current}/${total}`);
          }}
          isLoading={isAIGenerating}
          onLoadingChange={setIsAIGenerating}
          commentCount={formData.quantity}
          atUser={mentions.length > 0 ? mentions[0] : undefined}
          userComments={formData.comments.map(comment => comment.content)}
          industry={selectedIndustry}
          sessionId={sessionId}
        />
      </Modal>

      {/* 任务帮助模态框 */}
      <TaskAssistance
        isOpen={showTaskAssistance}
        onClose={() => setShowTaskAssistance(false)}
      />

    </div>
  );
}
