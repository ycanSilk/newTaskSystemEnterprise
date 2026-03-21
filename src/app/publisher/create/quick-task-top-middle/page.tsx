'use client';

import { Button, Input, AlertModal, Modal } from '@/components/ui';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ImageUpload from '@/components/imagesUpload/ImageUpload';
import TaskAssistance from '@/components/taskAssistance/taskAssistance';
import AIcoment from '@/components/aiCommentBtn/AIcoment';
// 类型定义
interface CommentData {
  comment: string;
  image: File | null;
  imageUrl: string;
  at_user?: string;
}

interface AlertConfig {
  title: string;
  message: string;
  icon: string;
  buttonText: string;
  onButtonClick: () => void;
}

interface RecommendMark {
  comment: string;
  image_url: string;
  at_user?: string;
}

interface PublishCombineTaskRequest {
  template_id: number;
  video_url: string[];
  deadline: number;
  releases_number: number;
  stage1_count: number;
  stage2_count: number;
  total_price: number;
  recommend_marks: RecommendMark[];
}

interface PublishCombineTaskResponse {
  success: boolean;
  message: string;
  data: any;
  code?: number;
  timestamp?: number;
}

// 自定义表单数据类型，避免与浏览器FormData冲突
interface QuickTaskFormData {
  videoUrls: string[];
  topComment: CommentData;
  middleQuantity: number;
  middleComments: CommentData[];
  deadline: string;
  releasesNumber: string;
}

// 类型定义
interface ConfigInfo {
  name: string; // 固定名称
  douyin_id: string; // 抖音ID（@用户ID）
}

interface QuickTaskConfigData {
  id: number;
  b_user_id: number;
  username: string;
  config_info: ConfigInfo;
  created_at: string;
  updated_at: string;
}

interface GetConfigResponse {
  success: boolean;
  message: string;
  data: QuickTaskConfigData | null;
  code?: number;
  timestamp?: number;
}

interface CreateQuickTaskRequest {
  template_id: number;
  video_url: string[];
  deadline: number;
  releases_number: number;
  stage1_count: number;
  stage2_count: number;
  total_price: number;
  recommend_marks: RecommendMark[];
}

interface CreateQuickTaskResponse {
  success: boolean;
  message: string;
  data: {
    releases_number: number;
    total_price: number;
    tasks: {
      combo_task_id: string;
      stage1_task_id: number;
      stage2_task_id: number;
    }[];
    wallet: {
      before_balance: string;
      after_balance: string;
      deducted: string;
    };
  } | null;
  code?: number;
  timestamp?: number;
}

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

  // 配置信息
  const [config, setConfig] = useState<ConfigInfo>({
    name: '',
    douyin_id: ''
  });
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // AI按钮冷却时间
  const [commentCooldown, setCommentCooldown] = useState(0);

  // 实时更新当前时间
  useEffect(() => {
    setCurrentTime(Math.floor(Date.now() / 1000));
  }, []);

  // 冷却时间倒计时
  useEffect(() => {
    if (commentCooldown > 0) {
      const timer = setTimeout(() => {
        setCommentCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [commentCooldown]);

  // 表单数据结构
  const [formData, setFormData] = useState<QuickTaskFormData>({
    videoUrls: [] as string[], // 视频链接数组

    // 上评评论模块 - 固定为1条
    topComment: {
      comment: '',
      image: null,
      imageUrl: ''
    },

    // 中评评论模块 - 固定为2条
    middleQuantity: 2,
    middleComments: [{
      comment: '',
      image: null,
      imageUrl: ''
    }, {
      comment: '',
      image: null,
      imageUrl: ''
    }],
    deadline: '1440', // 存储分钟数，默认24小时
    releasesNumber: '1' // 任务发布次数，默认1次，使用字符串类型
  });

  // 状态管理
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  // 视频链接输入状态
  const [videoUrlInput, setVideoUrlInput] = useState('');
  // 行业选择状态
  const [selectedIndustry, setSelectedIndustry] = useState('无行业');
  // 行业选项列表
  const [industryOptions, setIndustryOptions] = useState<string[]>(['无行业']);
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

  // 页面加载时获取配置信息
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoadingConfig(true);
      try {
        const response = await fetch('/api/quickTask/getConfig');
        const data: GetConfigResponse = await response.json();
        
        if (data.success && data.data) {
          setConfig({
            name: data.data?.config_info?.name || '',
            douyin_id: data.data?.config_info?.douyin_id || ''
          });
          
          // 将抖音ID自动填充到第二条中评评论里
          setFormData((prev: QuickTaskFormData) => ({
            ...prev,
            middleComments: prev.middleComments.map((comment, index) => 
              index === 1 ? { ...comment, comment: `@${data.data?.config_info?.douyin_id || '无抖音ID'}` } : comment
            )
          }));
        }
      } catch (error) {
        console.error('获取配置失败:', error);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  // 加载行业选项
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
        console.error('加载行业选项失败:', error);
      }
    };
    loadIndustries();
  }, []);

  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    icon: '',
    buttonText: '确认',
    onButtonClick: () => { }
  });

  // 任务帮助模态框状态
  const [showTaskAssistance, setShowTaskAssistance] = useState(false);

  // 统一的评论生成器模态框状态
  const [showCommentGenerator, setShowCommentGenerator] = useState(false);

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
      onButtonClick: onButtonClick || (() => { })
    });
    setShowAlertModal(true);
  };





  // 处理统一的评论生成器生成的评论
  const handleCommentGenerated = (comments: string[]) => {
    setFormData((prevData: QuickTaskFormData) => {
      let newData = { ...prevData };

      // 处理上评评论（第一条）
      if (comments.length > 0) {
        // 过滤掉可能的@用户标识，因为上评评论只需要带name
        const filteredTopComment = comments[0].replace(/@\S+/g, '').trim();
        newData.topComment = {
          ...newData.topComment,
          comment: filteredTopComment
        };
      }

      // 处理中评评论（第二、三条）
      if (comments.length > 1) {
        let newMiddleComments = [...newData.middleComments];
        for (let i = 1; i < Math.min(3, comments.length); i++) {
          let processedComment = comments[i];
          // 只移除第一条中评评论的@用户标识，保留第二条中评评论的@用户标识
          if (i === 1) { // 第一条中评评论（索引为1）
            processedComment = processedComment.replace(/@\S+/g, '').trim();
          }
          // 第二条中评评论（索引为2）保留@用户标识
          if (i - 1 < newMiddleComments.length) {
            newMiddleComments[i - 1].comment = processedComment;
          }
        }
        newData.middleComments = newMiddleComments;
      }

      return newData;
    });

    setShowCommentGenerator(false);
    showAlert('生成成功', '已生成3条评论内容！', '✨');
  };

  // 添加视频链接
  const handleAddVideoUrl = () => {
    console.log('开始添加视频链接，输入内容:', videoUrlInput);
    
    const trimmedInput = videoUrlInput.trim();
    if (!trimmedInput) {
      showAlert('输入错误', '请输入视频链接', '⚠️');
      return;
    }
    
    // 按中英文分号分割链接
    const urls = trimmedInput.split(/[;；]+/).map(url => url.trim()).filter(url => url);
    console.log('分割后的链接:', urls);
    
    if (urls.length === 0) {
      showAlert('输入错误', '请输入有效的视频链接', '⚠️');
      return;
    }
    
    // 计算可添加的链接数量
    const remainingSlots = 10 - formData.videoUrls.length;
    console.log('剩余可添加数量:', remainingSlots);
    
    if (remainingSlots <= 0) {
      showAlert('输入错误', '视频链接数量不能超过10个', '⚠️');
      return;
    }
    
    // 过滤并验证链接
    const validUrls = urls.filter(url => {
      const isValid = url.length > 35 && !formData.videoUrls.includes(url);
      console.log(`链接验证: ${url} -> ${isValid}`);
      return isValid;
    });
    
    if (validUrls.length === 0) {
      showAlert('输入错误', '所有链接已添加或无效', '⚠️');
      return;
    }
    
    // 限制添加数量
    const urlsToAdd = validUrls.slice(0, remainingSlots);
    console.log('最终添加的链接:', urlsToAdd);
    
    // 添加链接到列表
    setFormData(prev => ({
      ...prev,
      videoUrls: [...prev.videoUrls, ...urlsToAdd]
    }));
    
    // 清空输入框
    setVideoUrlInput('');
    
    console.log('添加完成，当前链接数量:', formData.videoUrls.length + urlsToAdd.length);
    showAlert('成功', `已添加 ${urlsToAdd.length} 个视频链接`, '✅');
  };

  // 删除视频链接
  const handleRemoveVideoUrl = (index: number) => {
    console.log('删除视频链接，索引:', index);
    setFormData(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.filter((_, i) => i !== index)
    }));
    console.log('删除完成，当前链接数量:', formData.videoUrls.length - 1);
  };





  // 发布任务
  const handlePublish = async () => {
    console.log('开始发布任务流程');
    
    // 表单验证 - 完整验证逻辑
    if (formData.videoUrls.length === 0) {
      console.log('验证失败：视频链接数量为0');
      showAlert('输入错误', '请输入视频链接', '⚠️');
      return;
    }

    if (formData.videoUrls.length > 10) {
      console.log('验证失败：视频链接数量超过10个');
      showAlert('输入错误', '视频链接数量不能超过10个', '⚠️');
      return;
    }

    if (formData.videoUrls.some(url => url.length <= 35)) {
      console.log('验证失败：存在无效的视频链接');
      showAlert('输入错误', '所有视频链接长度必须大于35个字符', '⚠️');
      return;
    }

    // 验证任务发布次数
    const releasesNumber = parseInt(formData.releasesNumber) || 1;
    if (releasesNumber < 1 || releasesNumber > 10) {
      console.log('验证失败：任务发布次数无效');
      showAlert('输入错误', '任务发布次数必须在1-10之间', '⚠️');
      return;
    }

    // 验证评论内容
    if (!formData.topComment.comment || formData.topComment.comment.trim() === '') {
      console.log('验证失败：上评评论为空');
      showAlert('输入错误', '上评评论不能为空', '⚠️');
      return;
    }

    // 验证上评评论必须包含固定名称
    if (config.name && !formData.topComment.comment.includes(config.name)) {
      console.log('验证失败：上评评论必须包含固定名称');
      showAlert('输入错误', `上评评论必须包含固定名称 "${config.name}"`, '⚠️');
      return;
    }

    if (formData.middleComments.length < 2) {
      console.log('验证失败：中评评论数量不足');
      showAlert('输入错误', '中评评论数量不足', '⚠️');
      return;
    }

    if (!formData.middleComments[0].comment || formData.middleComments[0].comment.trim() === '') {
      console.log('验证失败：第一条中评评论为空');
      showAlert('输入错误', '第一条中评评论不能为空', '⚠️');
      return;
    }

    if (!formData.middleComments[1].comment || formData.middleComments[1].comment.trim() === '') {
      console.log('验证失败：第二条中评评论为空');
      showAlert('输入错误', '第二条中评评论不能为空', '⚠️');
      return;
    }

    // 验证第二条中评评论必须包含@抖音ID
    if (config.douyin_id && !formData.middleComments[1].comment.includes(`@${config.douyin_id}`)) {
      console.log('验证失败：第二条中评评论必须包含@抖音ID');
      showAlert('输入错误', `第二条中评评论必须包含 "@${config.douyin_id}"`, '⚠️');
      return;
    }

    console.log('验证通过，开始构建请求数据');
    
    // 显示加载状态
    setIsPublishing(true);

    try {
      // 计算总价格
      const stage2Count = formData.middleQuantity;
      const singlePrice = (stage1Price * stage1Count) + (stage2Price * stage2Count);
      const totalPrice = singlePrice * releasesNumber;
      console.log('价格计算：', { singlePrice, totalPrice, releasesNumber });

      // 计算截止时间（时间戳）
      const deadlineMinutes = parseInt(formData.deadline);
      const currentTimestamp = Math.floor(Date.now() / 1000); // 使用实时的当前时间
      const deadlineTimestamp = currentTimestamp + (deadlineMinutes * 60);
      console.log('截止时间计算：', { deadlineMinutes, currentTimestamp, deadlineTimestamp });

      // 视频链接数组
      const videoUrls = formData.videoUrls;
      console.log('视频链接数量：', videoUrls.length);

      // 构建recommend_marks数组
      const recommendMarks: RecommendMark[] = [];

      // 添加上评评论（第0条）
      recommendMarks.push({
        comment: formData.topComment.comment || '',
        image_url: formData.topComment.imageUrl || ''
      });
      console.log('添加上评评论');

      // 添加中评评论
      for (let i = 0; i < formData.middleComments.length; i++) {
        const commentItem = formData.middleComments[i];
        const recommendMark: RecommendMark = {
          comment: commentItem.comment || '',
          image_url: commentItem.imageUrl || ''
        };

        // 只在第二条中评评论添加@用户标记（抖音ID）
        if (i === 1 && config.douyin_id) {
          recommendMark.at_user = config.douyin_id;
          console.log('在第二条中评评论添加@用户标记:', config.douyin_id);
        }

        recommendMarks.push(recommendMark);
      }
      console.log('添加中评评论完成，共', recommendMarks.length, '条评论');

      // 构建请求体
      const requestData: CreateQuickTaskRequest = {
        template_id: templateId,
        video_url: videoUrls,
        deadline: deadlineTimestamp,
        releases_number: releasesNumber,
        stage1_count: stage1Count,
        stage2_count: stage2Count,
        total_price: totalPrice,
        recommend_marks: recommendMarks
      };
      console.log('请求数据构建完成:', requestData);

      // 调用API
      console.log('开始调用API');
      const response = await fetch('/api/quickTask/Task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });

      // 解析响应
      const result: CreateQuickTaskResponse = await response.json();

      console.log('API响应结果：', result);
      // 处理响应结果
      if (result.success) {
        // 发布成功
        console.log('任务发布成功');
        showAlert(
          '发布成功',
          result.message || '任务发布成功！',
          '✅',
          '确定',
          () => {
            // 在用户点击确认按钮后跳转
            console.log('跳转到抖音任务创建页面');
            router.push('/publisher/create/douyin');
          }
        );
      } else {
        // 发布失败
        console.log('任务发布失败:', result.message);
        if (result.message?.includes('余额不足')) {
          // 特定处理余额不足的情况
          showAlert('账户余额不足', '您的账户余额不足以支付任务费用，请先充值后再尝试发布任务。', '⚠️', '前往充值', () => {
            console.log('跳转到充值页面');
            router.push('/publisher/finance');
          });
        } else {
          // 显示错误信息
          showAlert('发布失败', result.message || '任务发布失败', '❌');
        }
      }
    } catch (error) {
      console.error('发布任务时发生错误:', error);
      // 分析错误类型给出更具体的提示
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        showAlert('网络错误', '无法连接到服务器，请检查网络连接后重试', '⚠️');
      } else {
        showAlert('发布错误', '发布任务时发生错误，请稍后重试', '⚠️');
      }
    } finally {
      console.log('发布任务流程结束');
      setIsPublishing(false);
    }
  };

  // 价格计算
  const singlePrice = (stage1Price * stage1Count) + (stage2Price * formData.middleQuantity);
  const releasesNumber = parseInt(formData.releasesNumber) || 1;
  const totalPrice = singlePrice * releasesNumber;
  const totalCost = totalPrice.toFixed(2);



  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-3 space-y-2">
        <h1 className="text-2xl font-bold pl-5">
          发布中下评评论
        </h1>

        <div className="ml-5">
          <button
            onClick={() => setShowTaskAssistance(true)}
            className="transition-colors flex items-center text-blue-600"
          >
            派单禁止项
          </button>
        </div>
        <div className="text-lg pl-5 text-red-500">
          <span className="text-1xl text-red-500">⚠️</span>提示：<br />
          1.违反平台的：引导词，极限词，赌博以及其他限制词<br />
          2.违反国家禁止的言论<br />
          3.本评论已经有人在做“广告@”<br />
          4.发布上评的点开头像发现没有作品，没什么关注或者粉丝的假人号和新号
        </div>
        {/* 固定昵称显示 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            固定名称
          </label>
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            {isLoadingConfig ? (
              <span className="text-gray-500">加载中...</span>
            ) : (
              <span>{config.name || '未设置'}</span>
            )}
          </div>
        </div>

        {/* 视频链接列表输入 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <label className="text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
            <span>视频链接 <span className="text-red-500">*</span></span>
            <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => setShowTaskAssistance(true)}>！派单指引</span>
          </label>
          <div className="space-y-2">
            {/* 单个视频链接输入 */}
            <div className="space-y-2">
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-[100px] resize-none"
                placeholder="请输入抖音视频链接（至少35个字符），多个链接请用分号(;)分隔"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // 阻止默认换行行为
                    handleAddVideoUrl();
                  }
                }}
              />
              <Button
                onClick={handleAddVideoUrl}
                disabled={!videoUrlInput.trim() || formData.videoUrls.length >= 10}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                添加
              </Button>
            </div>
            
            {videoUrlInput.length > 0 && videoUrlInput.length <= 35 && (
              <p className="text-sm text-red-500 mt-1">视频链接长度必须大于35个字符</p>
            )}
            {formData.videoUrls.length >= 10 && (
              <p className="text-sm text-red-500 mt-1">视频链接数量不能超过10个</p>
            )}
            
            {/* 已添加的视频链接列表 */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                已添加的视频链接（{formData.videoUrls.length}/10）
              </label>
              <div className="h-[100px] overflow-y-auto">
                {formData.videoUrls.length === 0 ? (
                  <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500 h-full flex items-center justify-center">
                    暂无视频链接，请添加
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.videoUrls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="text-sm truncate flex-1">{url}</span>
                        <Button
                          onClick={() => handleRemoveVideoUrl(index)}
                          variant="secondary"
                          className="px-2 py-1 text-xs"
                        >
                          删除
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 任务发布次数 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务发布次数（最多10次）
          </label>
          <Input
            type="text"
            value={formData.releasesNumber}
            onChange={(e) => {
              const value = e.target.value;
              // 允许输入数字或为空
              if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 10)) {
                setFormData({ ...formData, releasesNumber: value });
              }
            }}
            className="w-full"
          />
        </div>

        {/* 截止时间 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务截止时间
          </label>
          <select
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          >
            <option value="10">10分钟内</option>
            <option value="30">30分钟内</option>
            <option value="720">12小时内</option>
            <option value="1440">24小时内</option>
          </select>
        </div>

        {/* 上评评论模块 - 固定为1条 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
             {/* 统一的AI生成评论按钮 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <Button
            onClick={() => {
              setShowCommentGenerator(true);
              setCommentCooldown(10); // 设置30秒冷却时间
            }}
            disabled={isPublishing || commentCooldown > 0}
            className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? '生成中...' : commentCooldown > 0 ? `冷却中(${commentCooldown}s)` : 'AI生成评论'}
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
                  const newValue = e.target.value;
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
                    setFormData((prev: QuickTaskFormData) => ({
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

        {/* 中评评论模块 - 固定为2条 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            中评评论（固定2条）
          </label>
          


          <div className="mt-2 text-sm text-gray-500">
            上评任务固定1条，中评任务固定2条，中评任务单价为¥{(stage2Price || 0).toFixed(1)}
          </div>

          {/* 中评评论输入框 - 固定2条 */}
          {formData.middleComments.map((comment: CommentData, index: number) => {
            return (
              <div key={index} className="mb-1 py-2 border-b border-gray-900">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  中评评论{index + 1} {index === 1 && <span className="text-red-500">(自动添加抖音ID:{config.douyin_id})</span>}
                </label>
                <div className="flex space-x-3">
                  <textarea
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder={index === 0 ? "请输入第一条中评评论内容" : "第二条中评评论会自动添加@抖音ID"}
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
          disabled={formData.videoUrls.length === 0}
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

      {/* 统一的评论生成器模态框 */}
      <Modal
        isOpen={showCommentGenerator}
        onClose={() => setShowCommentGenerator(false)}
        title="AI生成评论"
        className="w-full max-w-md"
      >
        {/* 行业筛选下拉菜单 */}
        <div className="bg-white rounded-md  shadow-sm mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            行业选择
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
        
        <AIcoment
          onCommentsGenerated={handleCommentGenerated}
          onProgressUpdate={(current, total) => {
            // 可选：显示进度
            console.log(`评论生成进度: ${current}/${total}`);
          }}
          isLoading={isPublishing}
          onLoadingChange={setIsPublishing}
          commentCount={3} // 生成3条评论：1条上评 + 2条中评
          atUser={config.douyin_id}
          name={config.name}
          userComments={[formData.topComment.comment, ...formData.middleComments.map(c => c.comment)]}
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