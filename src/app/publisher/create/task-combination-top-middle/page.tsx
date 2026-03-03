'use client';

import { Button, Input, AlertModal } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ImageUpload from '@/components/imagesUpload/ImageUpload';
import TaskAssistance from '@/components/taskAssistance/taskAssistance';
import type {
  CommentData,
  FormData,
  PublishCombineTaskRequest,
  PublishCombineTaskResponse,
  AlertConfig,
  RecommendMark
} from '../../../types/task/publishCombineTaskTypes';

export default function PublishTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL参数获取任务信息，确保searchParams不为null
  const getSearchParam = (key: string) => {
    return searchParams?.get(key) || '';
  };

  // 从URL参数获取模板ID和阶段价格
  const templateId = parseInt(getSearchParam('template_id').trim() || '0');
  const stage1Price = parseFloat(getSearchParam('stage1Price').trim() || '0');
  const stage2Price = parseFloat(getSearchParam('stage2Price').trim() || '0');

  // @用户相关状态 - 只用于中评
  const [mentionInput, setMentionInput] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  
  // 表单数据
  const [formData, setFormData] = useState<FormData>({
    videoUrl: '',
    
    // 上评评论模块 - 固定为1条
    topComment: {
      comment: '',
      image: null,
      imageUrl: ''
    },
    
    // 中评评论模块 - 默认3条
    middleQuantity: 3,
    middleComments: [
      {
        comment: '',
        image: null,
        imageUrl: ''
      },
      {
        comment: '',
        image: null,
        imageUrl: ''
      },
      {
        comment: '',
        image: null,
        imageUrl: ''
      }
    ],
    deadline: '30' // 存储分钟数
  });
  
  // 中评任务数量输入状态
  const [middleQuantityInput, setMiddleQuantityInput] = useState(formData.middleQuantity.toString());

  // 状态管理
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(Math.floor(Date.now() / 1000));

  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    icon: '',
    buttonText: '确认',
    onButtonClick: () => {}
  });
  
  // 任务帮助模态框状态
  const [showTaskAssistance, setShowTaskAssistance] = useState(false);

  // 更新当前时间戳
  useEffect(() => {
    setCurrentTime(Math.floor(Date.now() / 1000));
  }, []);

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
  const handleMiddleQuantityChange = (newQuantityStr: string) => {
    // 只允许输入数字
    const cleanValue = newQuantityStr.replace(/[^0-9]/g, '');
    setMiddleQuantityInput(cleanValue);
    
    // 如果输入为空，保持内部状态为1
    if (!cleanValue) {
      setFormData((prevData: FormData) => ({
        ...prevData,
        middleQuantity: 1 // 内部状态保持为1，确保其他逻辑正常
      }));
      return;
    }
    
    const newQuantity = parseInt(cleanValue);
    const quantity = Math.max(1, newQuantity); // 中评数量至少为1
    
    setFormData((prevData: FormData) => {
      let newComments = [...prevData.middleComments];
      
      // 如果新数量大于现有评论数量，添加新评论
      while (newComments.length < quantity) {
        newComments.push({
          comment: ``,
          image: null,
          imageUrl: ''
        });
      }
      
      // 如果新数量小于现有评论数量，移除多余评论
      if (newComments.length > quantity) {
        newComments.splice(quantity);
      }
      
      // 检查是否有@用户标记，如果有，确保它在最新的最后一条评论中
      if (mentions.length > 0 && quantity > 0) {
        // 先从所有评论中移除@用户标记
        newComments = newComments.map((comment: CommentData) => ({
          ...comment,
          comment: comment.comment.replace(/ @\S+/g, '')
        }));
        
        // 然后将@用户标记添加到最新的最后一条评论
        const lastIndex = newComments.length - 1;
        newComments[lastIndex] = {
          ...newComments[lastIndex],
          comment: newComments[lastIndex].comment 
            ? `${newComments[lastIndex].comment} @${mentions[0]}` 
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
      setFormData((prevData: FormData) => ({
        ...prevData,
        middleComments: prevData.middleComments.map((comment: CommentData, index: number) => 
          index === lastIndex 
            ? { 
                ...comment, 
                comment: comment.comment 
                  ? `${comment.comment} @${trimmedMention}` 
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
    setFormData((prevData: FormData) => ({
      ...prevData,
      middleComments: prevData.middleComments.map((comment: CommentData) => ({
        ...comment,
        comment: comment.comment?.replace(` @${mention}`, '').replace(`@${mention}`, '') || comment.comment
      }))
    }));
  };

  // AI优化上评评论功能
  const handleAITopCommentOptimize = async () => {
    try {
      // 从comment.json文件中随机获取一个评论作为提示词
      let prompt = '';
      try {
        const response = await fetch('/file/comment.json');
        const comments = await response.json();
        if (Array.isArray(comments) && comments.length > 0) {
          const randomIndex = Math.floor(Math.random() * comments.length);
          prompt = comments[randomIndex];
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
      
      // 调用AI生成评论API
      const response = await fetch('/api/deepseek/polish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draft: prompt }),
      });
      
      const result = await response.json();
      console.log('DeepSeek API 响应:', result);
      if (!response.ok) throw new Error(result.error || '润色失败');
      
      setFormData((prevData: FormData) => ({
        ...prevData,
        topComment: {
          ...prevData.topComment,
          comment: result.polished || ''
        }
      }));
      
      showAlert('生成成功', '上评评论内容已通过AI生成！', '✨');
    } catch (error) {
      console.error('AI生成评论评论失败:', error);
      showAlert('润色失败', '网络错误，请稍后重试', 'error');
    } finally {
      setIsPublishing(false);
    }
  };
  
  // AI优化中评评论功能
  const handleAIMiddleCommentsOptimize = async () => {
    try {
      // 从comment.json文件中随机获取对应数量的评论作为提示词
      let prompts: string[] = [];
      try {
        const response = await fetch('/file/comment.json');
        const comments = await response.json();
        if (Array.isArray(comments) && comments.length > 0) {
          // 随机获取对应数量的评论，确保不重复
          const shuffled = [...comments].sort(() => 0.5 - Math.random());
          prompts = shuffled.slice(0, formData.middleQuantity);
          // 如果评论库数量不足，重复使用
          while (prompts.length < formData.middleQuantity) {
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
      for (let i = 0; i < formData.middleQuantity; i++) {
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
        if (!response.ok) throw new Error(result.error || '润色失败');
        
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
      
      // 构建新的评论数组
      const newComments: Array<{ comment: string; image: null; imageUrl: string }> = generatedComments.map(comment => ({
        comment,
        image: null,
        imageUrl: ''
      }));
      
      // 检查是否有@用户标记，如果有，确保它在最新的最后一条评论中
      if (mentions.length > 0 && newComments.length > 0) {
        // 先从所有评论中移除@用户标记
        const commentsWithMention = newComments.map((comment: CommentData) => ({
          ...comment,
          comment: comment.comment.replace(/ @\S+/g, '')
        }));
        
        // 然后将@用户标记添加到最新的最后一条评论
        const lastIndex = commentsWithMention.length - 1;
        commentsWithMention[lastIndex] = {
          ...commentsWithMention[lastIndex],
          comment: commentsWithMention[lastIndex].comment 
            ? `${commentsWithMention[lastIndex].comment} @${mentions[0]}` 
            : `@${mentions[0]}`
        };
        
        setFormData((prevData: FormData) => ({
          ...prevData,
          middleComments: commentsWithMention
        }));
      } else {
        setFormData((prevData: FormData) => ({
          ...prevData,
          middleComments: newComments
        }));
      }
      
      showAlert('生成成功', `已生成 ${formData.middleQuantity} 条中评评论内容！`, '✨');
    } catch (error) {
      console.error('AI生成评论评论失败:', error);
      showAlert('润色失败', '网络错误，请稍后重试', 'error');
    } finally {
      setIsPublishing(false);
    }
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
    
    // 显示加载状态
    setIsPublishing(true);
    
    try {
      // 计算总价格
      const stage1Count = 1; // 上评固定为1条
      const stage2Count = formData.middleQuantity;
      const totalPrice = (stage1Price * stage1Count) + (stage2Price * stage2Count);
      
      // 计算截止时间（时间戳）
      const deadlineMinutes = parseInt(formData.deadline);
      const deadlineTimestamp = currentTime + (deadlineMinutes * 60);
      
      // 构建recommend_marks数组
      const recommendMarks: RecommendMark[] = [];
      
      // 添加上评评论（第0条）
      recommendMarks.push({
        comment: formData.topComment.comment || '',
        image_url: formData.topComment.imageUrl || ''
      });
      
      // 添加中评评论
      for (let i = 0; i < formData.middleComments.length; i++) {
        const commentItem = formData.middleComments[i];
        const recommendMark: RecommendMark = {
          comment: commentItem.comment || '',
          image_url: commentItem.imageUrl || ''
        };
        
        // 只在最后一条中评评论添加@用户标记
        if (i === formData.middleComments.length - 1 && mentions.length > 0) {
          recommendMark.at_user = mentions[0];
        }
        
        recommendMarks.push(recommendMark);
      }
      
      // 构建请求体
      const requestData: PublishCombineTaskRequest = {
        template_id: templateId,
        video_url: formData.videoUrl,
        deadline: deadlineTimestamp,
        stage1_count: stage1Count,
        stage2_count: stage2Count,
        total_price: totalPrice,
        recommend_marks: recommendMarks
      };
      
      // 调用API
      const response = await fetch('/api/task/publishCombineTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });
      
      // 解析响应
      const result: PublishCombineTaskResponse = await response.json();
      
      console.log('请求API结果：', result);
      // 处理响应结果
      if (result.code === 0) {
        // 发布成功
        showAlert(
          '发布成功', 
          result.message || '任务发布成功！', 
          '✅',
          '确定',
          () => {
            // 在用户点击确认按钮后跳转
            router.push('/publisher/create/douyin');
          }
        );
      } else {
        // 发布失败
        if (result.message?.includes('余额不足')) {
          // 特定处理余额不足的情况
          showAlert('账户余额不足', '您的账户余额不足以支付任务费用，请先充值后再尝试发布任务。', '⚠️', '前往充值', () => {
            router.push('/publisher/finance');
          });
        } else {
          // 显示错误信息
          showAlert('发布失败', result.message || '任务发布失败', '❌');
        }
      }
    } catch (error) {
      // 分析错误类型给出更具体的提示
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        showAlert('网络错误', '无法连接到服务器，请检查网络连接后重试', '⚠️');
      } else {
        showAlert('发布错误', '发布任务时发生错误，请稍后重试', '⚠️');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // 使用URL参数中的阶段价格计算总费用，默认值为4和2
  const stage1Count = 1; // 上评固定为1条
  const totalCost = ((stage1Price || 4) * stage1Count + formData.middleQuantity * (stage2Price || 2)).toFixed(2);
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-3 space-y-4">
        <h1 className="text-2xl font-bold pl-5">
          发布上中评评论
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
          <span className="text-1xl text-red-500">⚠️</span>提示：<br />
            1.平台限制词不可发送<br />
            2.违反平台的：引导词，极限词，赌博以及其他限制词<br />
            3.违反国家禁止的言论
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
            <option value="10">10分钟内</option>
            <option value="30">30分钟内</option>
            <option value="720">12小时内</option>
            <option value="1440">24小时内</option>
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
                disabled={isPublishing}
                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? '生成中...' : 'AI生成评论'}
              </Button>
            </div>
            
            {/* 上评评论输入框 - 固定一条 */}
            <div className="mb-1 py-2 border-b border-gray-900">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上评评论
              </label>
              <div className="flex space-x-3">
                <textarea
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="请输入上评评论内容"
                  value={formData.topComment.comment}
                  onChange={(e) => {
                    setFormData({...formData, topComment: {...formData.topComment, comment: e.target.value}});
                  }}
                  style={{ height: '80px' }}
                />
                
                {/* 图片上传区域 */}
                <div>
                  <ImageUpload 
                    maxCount={1} 
                    columns={1}
                    gridWidth="80px"
                    itemSize="80x80"
                    title=""
                    onImagesChange={(images: File[], urls: string[]) => {
                      setFormData((prev: FormData) => ({
                        ...prev,
                        topComment: {
                          ...prev.topComment,
                          imageUrl: urls[0] || ''
                        }
                      }));
                    }}
                  />
                </div>
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
                disabled={isPublishing}
                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? '生成中...' : 'AI生成评论'}
              </Button>
            </div>
            
            {/* 任务数量 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                中评任务数量 <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <Input
                  type="text"
                  value={middleQuantityInput}
                  onChange={(e) => handleMiddleQuantityChange(e.target.value)}
                  className="w-full text-2xl font-bold text-gray-900 text-center py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入任务数量"
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                上评任务固定1条，中评任务单价为¥{(stage2Price || 0).toFixed(1)}
              </div>
            </div>
            
            {/* 动态生成中评评论输入框 */}
            {formData.middleComments.map((comment: CommentData, index: number) => {
              return (
                <div key={index} className="mb-1 py-2 border-b border-gray-900">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    中评评论{index + 1}
                  </label>
                  <div className="flex space-x-3">
                    <textarea
                      className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder={`默认最后一条评论带@功能`}
                      value={comment.comment}
                      onChange={(e) => {
                        const newComments = [...formData.middleComments];
                        newComments[index] = {...newComments[index], comment: e.target.value};
                        setFormData({...formData, middleComments: newComments});
                      }}
                      style={{ height: '80px' }}
                    />
                    
                    {/* 图片上传区域 */}
                    <div>
                      <ImageUpload 
                        maxCount={1} 
                        columns={1}
                        gridWidth="80px"
                        itemSize="80x80"
                        title=""
                        onImagesChange={(images: File[], urls: string[]) => {
                          const newComments = [...formData.middleComments];
                          newComments[index] = {...newComments[index], imageUrl: urls[0] || ''};
                          setFormData({...formData, middleComments: newComments});
                        }}
                      />
                    </div>
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
            发布任务 - ¥{totalCost}
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