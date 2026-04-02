'use client';

import { Button, Input, Modal } from '@/components/ui';
import GlobalWarningModal from '@/components/button/globalWarning/GlobalWarningModal';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ImageUpload from '@/components/imagesUpload/ImageUpload';
import TaskAssistance from '@/components/taskAssistance/taskAssistance';
import MiddleCommentGenerator from '@/components/aiCommentBtn/MiddleCommentGenerator';
import type {
  CommentData,
  FormData,
  PublishCombineTaskRequest,
  PublishCombineTaskResponse,
  AlertConfig,
  RecommendMark
} from '@/app/types/task/publishCombineTaskTypes';

export default function PublishTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从URL参数获取任务信息，确保searchParams不为null
  const getSearchParam = (key: string) => {
    return searchParams?.get(key) || '';
  };

  // 从URL参数获取模板ID、阶段价格
  const templateId = parseInt(getSearchParam('template_id').trim() || '0');
  const stage1Price = parseFloat(getSearchParam('stage1Price').trim() || '0');
  const stage1Count = parseInt(getSearchParam('stage1Count').trim() || '1'); // 默认为1
  const stage2Price = parseFloat(getSearchParam('stage2Price').trim() || '0');
  const stage2Count = parseInt(getSearchParam('stage2Count').trim() || '2'); // 默认为2

  // 当前时间戳（秒）
  const [currentTime, setCurrentTime] = useState<number>(Math.floor(Date.now() / 1000));

  // 实时更新当前时间
  useEffect(() => {
    setCurrentTime(Math.floor(Date.now() / 1000));
  }, []);


  // @用户相关状态
  const [mentionInput, setMentionInput] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);

  // 表单数据结构
  const [formData, setFormData] = useState<FormData>({
    videoUrl: '',

    // 中评评论模块 - 固定为1条
    topComment: {
      comment: '',
      image: null,
      imageUrl: ''
    },

    // 下评评论模块 - 固定为1条
    middleQuantity: 1,
    middleComments: [{
      comment: '',
      image: null,
      imageUrl: ''
    }],
    deadline: '1440' // 存储分钟数，默认24小时
  });

  // 状态管理
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  // 选择状态
  const [selectedTopIndustry, setSelectedTopIndustry] = useState('无');
  const [selectedMiddleIndustry, setSelectedMiddleIndustry] = useState('无');
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

  const [alertConfig, setAlertConfig] = useState({
    message: '',
    buttonText: '确认',
    redirectUrl: ''
  });

  // 任务帮助模态框状态
  const [showTaskAssistance, setShowTaskAssistance] = useState(false);

  // MiddleCommentGenerator模态框状态
  const [showMiddleCommentGenerator, setShowMiddleCommentGenerator] = useState(false);
  // 中评评论的MiddleCommentGenerator模态框状态
  const [showTopCommentGenerator, setShowTopCommentGenerator] = useState(false);

  // 验证视频链接 - 统一使用 quick-task-top-middle 页面的验证条件
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



  // 处理添加@用户标记
  const handleAddMention = () => {
    const trimmedMention = mentionInput.trim();

    // 1. 检查是否已经有一个@用户（限制数量为1）
    if (mentions.length >= 1) {
      showAlert('仅支持添加一个@用户');
      return;
    }

    
    // 3. 确保用户昵称ID唯一
    if (trimmedMention && !mentions.includes(trimmedMention)) {
      setMentions([trimmedMention]); // 只保留一个用户
      setMentionInput('');

      // 将@标记插入到下评评论中（固定为第一条）
      setFormData((prevData: FormData) => ({
        ...prevData,
        middleComments: prevData.middleComments.map((comment: CommentData) => ({
          ...comment,
          comment: comment.comment
            ? `${comment.comment} @${trimmedMention}`
            : `@${trimmedMention}`
        }))
      }));
    } else if (mentions.includes(trimmedMention)) {
      showAlert('该用户昵称ID已添加');
    }
  };

  // 移除@用户标记
  const removeMention = (mention: string) => {
    setMentions(mentions.filter(m => m !== mention));

    // 从所有下评评论中移除该@标记
    setFormData((prevData: FormData) => ({
      ...prevData,
      middleComments: prevData.middleComments.map((comment: CommentData) => ({
        ...comment,
        comment: comment.comment ? (
          // 以"@"符号作为标识，获取输入的ID所包含的位数，然后在评论内容中定位"@"符号的起始位置，接着从该起始位置开始，向右偏移等于ID位数的长度，最后将从"@"符号开始到偏移结束的整个区域（包括"@"符号本身）进行删除操作
          (() => {
            let content = comment.comment;
            const atIndex = content.indexOf(`@${mention}`);
            if (atIndex !== -1) {
              const start = atIndex;
              const end = atIndex + 1 + mention.length;
              content = content.substring(0, start) + content.substring(end);
            }
            return content.trim();
          })()
        ) : comment.comment
      }))
    }));
  };

  // 处理MiddleCommentGenerator生成的评论
  const handleMiddleCommentsGenerated = (comments: string[]) => {
    setFormData((prevData: FormData) => {
      let newComments = [...prevData.middleComments];

      // 更新评论内容（只处理第一条）
      if (comments.length > 0) {
        let processedComment = comments[0];
        if (mentions.length > 0) {
          // 确保只包含一个@用户标识
          const atMatches = processedComment.match(/@\S+/g);
          if (atMatches && atMatches.length > 1) {
            // 如果有多个@标识，只保留第一个
            const firstAt = atMatches[0];
            processedComment = processedComment.replace(/@\S+/g, '').trim() + ` ${firstAt}`;
          } else if (!atMatches) {
            // 如果没有@标识，添加一个
            processedComment = processedComment.trim() + ` @${mentions[0]}`;
          }
        } else {
          // 移除所有@用户标识
          processedComment = processedComment.replace(/@\S+/g, '').trim();
        }
        newComments[0].comment = processedComment;
      }

      return {
        ...prevData,
        middleComments: newComments
      };
    });

    setShowMiddleCommentGenerator(false);
    showAlert('已生成1条下评评论内容！');
  };

  // 处理中评评论的MiddleCommentGenerator生成的评论
  const handleTopCommentGenerated = (comments: string[]) => {
    if (comments.length > 0) {
      // 过滤掉可能的@用户标识
      const filteredComment = comments[0].replace(/@\S+/g, '').trim();
      setFormData((prevData: FormData) => ({
        ...prevData,
        topComment: {
          ...prevData.topComment,
          comment: filteredComment
        }
      }));
      setShowTopCommentGenerator(false);
      showAlert('中评评论内容已通过AI生成！');
    }
  };





  // 发布任务
  const handlePublish = async () => {
    // 表单验证 - 完整验证逻辑
    if (!formData.videoUrl) {
      showAlert('请输入视频链接');
      return;
    }

    // 验证视频链接
    if (!validateVideoUrl(formData.videoUrl)) {
      showAlert('请输入有效的视频链接');
      return;
    }

    // 验证任务数量
    if (formData.middleQuantity === undefined) {
      showAlert('请输入任务数量');
      return;
    }

    // 验证评论内容
    if (!formData.topComment.comment || formData.topComment.comment.trim() === '') {
      showAlert('中评评论不能为空');
      return;
    }

    if (formData.middleComments.length === 0) {
      showAlert('请至少添加一条下评评论');
      return;
    }

    const emptyMiddleComments = formData.middleComments.filter(comment => !comment.comment || comment.comment.trim() === '');
    if (emptyMiddleComments.length > 0) {
      showAlert('下评评论不能为空');
      return;
    }

    // 显示加载状态
    setIsPublishing(true);

    try {
      // 计算总价格
      const stage2Count = formData.middleQuantity;
      const totalPrice = (stage1Price * stage1Count) + (stage2Price * stage2Count);

      

      // 构建recommend_marks数组
      const recommendMarks: RecommendMark[] = [];

      // 添加中评评论（第0条）
      recommendMarks.push({
        comment: formData.topComment.comment || '',
        image_url: formData.topComment.imageUrl || ''
      });

      // 添加下评评论
      for (let i = 0; i < formData.middleComments.length; i++) {
        const commentItem = formData.middleComments[i];
        const recommendMark: RecommendMark = {
          comment: commentItem.comment || '',
          image_url: commentItem.imageUrl || ''
        };

        // 只在最后一条下评评论添加@用户标记
        if (i === formData.middleComments.length - 1 && mentions.length > 0) {
          recommendMark.at_user = mentions[0];
        }

        recommendMarks.push(recommendMark);
      }

      // 构建请求体
      const requestData: PublishCombineTaskRequest = {
        template_id: templateId,
        video_url: formData.videoUrl,
      deadline: Math.floor(Date.now() / 1000) + 30 * 60,
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
      // 分析错误类型给出更具体的提示
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        showAlert('网络超时，请重试');
      } else {
        showAlert('发布任务失败，请稍后重试');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // 价格计算
  const totalPrice = (stage1Price * stage1Count) + (stage2Price * formData.middleQuantity);
  const totalCost = totalPrice.toFixed(2);



  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-3 space-y-2">
        <h1 className="text-2xl font-bold pl-5">
          发布中下评评论<span className="text-blue-500 cursor-pointer hover:underline ml-5" onClick={() => setShowTaskAssistance(true)}>！派单演示</span>
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
          <span className="text-1xl text-red-500">⚠️</span>提示：<br />
          1.违反平台的：引导词，极限词，赌博以及其他限制词<br />
          2.违反国家禁止的言论<br />
          3.本评论已经有人在做“广告@”<br />
          4.发布上评的点开头像发现没有作品，没什么关注或者粉丝的假人号和新号
        </div>
        {/* 视频链接 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <label className="text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
            <span>视频链接 <span className="text-red-500">*</span></span>
          </label>
          <Input
            placeholder="请输入抖音视频链接"
            value={formData.videoUrl}
            onChange={(e) => {
              setFormData({ ...formData, videoUrl: e.target.value });
            }}
            className={`w-full ${formData.videoUrl.length > 0 && !validateVideoUrl(formData.videoUrl) ? 'border-red-500' : 'border-gray-200'}`}
          />
          {formData.videoUrl.length > 0 && !validateVideoUrl(formData.videoUrl) && (
            <p className="text-sm text-red-500 mt-1">
              {formData.videoUrl.length <= 35 ? '错误的口令，请提交你做单的评论口令' : '错误的口令，请提交你做单的评论口令'}
            </p>
          )}
        </div>

        

        {/* 中评评论模块 - 固定为1条 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            中评评论
          </label>

          {/* AI优化评论功能按钮 */}
          <div className="mb-4">
            <Button
              onClick={() => setShowTopCommentGenerator(true)}
              disabled={isPublishing}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? '生成中...' : 'AI生成评论'}
            </Button>
          </div>

          {/* 中评评论输入框 - 固定一条 */}
          <div className="mb-1 py-2 border-b border-gray-900">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              中评评论
            </label>
            <div className="flex space-x-3">
              <textarea
                className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="请输入中评评论内容（不能包含@用户标识）"
                value={formData.topComment.comment}
                onChange={(e) => {
                  const newValue = e.target.value;
                  // 检查是否包含@用户标识
                  if (newValue.includes('@')) {
                    showAlert('提示', '中评评论不能包含@用户标识', '⚠️');
                    return;
                  }
                  setFormData({ ...formData, topComment: { ...formData.topComment, comment: newValue } });
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

        {/* 下评评论模块 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            下评评论
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
              disabled={isPublishing}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? '生成中...' : 'AI生成评论'}
            </Button>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            中评任务固定1条，下评任务固定1条，下评任务单价为¥{(stage2Price || 0).toFixed(1)}
          </div>

          {/* 动态生成下评评论输入框 */}
          {formData.middleComments.map((comment: CommentData, index: number) => {
            return (
              <div key={index} className="mb-1 py-2 border-b border-gray-900">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  下评评论{index + 1}
                </label>
                <div className="flex space-x-3">
                  <textarea
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder={`第一条评论请输入你推荐的话术、默认最后一条评论带@功能`}
                    value={comment.comment}
                    onChange={(e) => {
                      const newComments = [...formData.middleComments];
                      newComments[index] = { ...newComments[index], comment: e.target.value };
                      setFormData({ ...formData, middleComments: newComments });
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
                        newComments[index] = { ...newComments[index], imageUrl: urls[0] || '' };
                        setFormData({ ...formData, middleComments: newComments });
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>





        {/* 费用预览 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
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
          disabled={!formData.videoUrl || !validateVideoUrl(formData.videoUrl) || formData.middleQuantity === undefined}
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

      {/* 通用提示框组件 - 使用 GlobalWarningModal */}
      <GlobalWarningModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        redirectUrl={alertConfig.redirectUrl}
        iconType="success"
      />

      {/* 中评评论的MiddleCommentGenerator模态框 */}
      <Modal
        isOpen={showTopCommentGenerator}
        onClose={() => setShowTopCommentGenerator(false)}
        title="AI生成评论"
        className="w-full max-w-md"
      >
        {/* 筛选下拉菜单 */}
        <div className="bg-white rounded-md  shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择
          </label>
          <select
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedTopIndustry}
            onChange={(e) => setSelectedTopIndustry(e.target.value)}
          >
            {industryOptions.map((industry, index) => (
              <option key={index} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
        
        <MiddleCommentGenerator
          onCommentsGenerated={handleTopCommentGenerated}
          onProgressUpdate={(current, total) => {
            // 可选：显示进度
            console.log(`中评评论生成进度: ${current}/${total}`);
          }}
          isLoading={isPublishing}
          onLoadingChange={setIsPublishing}
          commentCount={1}
          atUser={undefined}
          userComments={[formData.topComment.comment]}
          industry={selectedTopIndustry}
          sessionId={sessionId}
        />
      </Modal>

      {/* 下评评论的MiddleCommentGenerator模态框 */}
      <Modal
        isOpen={showMiddleCommentGenerator}
        onClose={() => setShowMiddleCommentGenerator(false)}
        title="AI生成评论"
        className="w-full max-w-md"
      >
        {/* 筛选下拉菜单 */}
        <div className="bg-white rounded-md  shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择
          </label>
          <select
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMiddleIndustry}
            onChange={(e) => setSelectedMiddleIndustry(e.target.value)}
          >
            {industryOptions.map((industry, index) => (
              <option key={index} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
        
        <MiddleCommentGenerator
          onCommentsGenerated={handleMiddleCommentsGenerated}
          onProgressUpdate={(current, total) => {
            // 可选：显示进度
            console.log(`下评评论生成进度: ${current}/${total}`);
          }}
          isLoading={isPublishing}
          onLoadingChange={setIsPublishing}
          commentCount={1}
          atUser={mentions.length > 0 ? mentions[0] : undefined}
          userComments={formData.middleComments.map(comment => comment.comment)}
          industry={selectedMiddleIndustry}
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