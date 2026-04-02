'use client';

import { Button, Input, Modal } from '@/components/ui';
import GlobalWarningModal from '@/components/button/globalWarning/GlobalWarningModal';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ImageUpload from '@/components/imagesUpload/ImageUpload';
import TaskAssistance from '@/components/taskAssistance/quickTaskMiddleBottom';
import AIcoment from '@/components/aiCommentBtn/quickMiddleAndBottom';

// 替代 apiCall 函数
const apiCall = async (url: string, options: RequestInit, action: string) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API call failed (${action}):`, error);
    throw error;
  }
};

// 替代 log 函数
const log = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${level.toUpperCase()}] ${timestamp} ${message}`;
  
  if (data) {
    if (level === 'error') {
      console.error(logMessage, data);
    } else {
      console.log(logMessage, data);
    }
  } else {
    if (level === 'error') {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  }
};
// 类型定义
interface CommentData {
  comment: string;
  image: File | null;
  imageUrl: string;
  at_user?: string;
}

interface AlertConfig {
  message: string;
  buttonText: string;
  redirectUrl: string;
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

// 视频链接输入项类型
interface VideoUrlInput {
  url: string;
  isValid: boolean;
  isDuplicate: boolean;
}

// 自定义表单数据类型，避免与浏览器FormData冲突
interface QuickTaskFormData {
  videoUrls: string[];
  videoUrlInputs: VideoUrlInput[];
  topComment: CommentData;
  middleComment: CommentData;
  middleQuantity: number;
  bottomComments: CommentData[];
  deadline: string;
  releasesNumber: string;
  duplicateWarning: string | null;
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
  // 编辑配置状态
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [editConfig, setEditConfig] = useState<ConfigInfo>({
    name: '',
    douyin_id: ''
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // 实时更新当前时间
  useEffect(() => {
    setCurrentTime(Math.floor(Date.now() / 1000));
  }, []);

  // 表单数据结构
  const [formData, setFormData] = useState<QuickTaskFormData>({
    videoUrls: [] as string[], // 视频链接数组
    videoUrlInputs: Array(5).fill({ url: '', isValid: false, isDuplicate: false }), // 默认5个视频链接输入表单
    topComment: {
      comment: '',
      image: null,
      imageUrl: ''
    },
    middleComment: {
      comment: '',
      image: null,
      imageUrl: ''
    },

    // 下评评论模块 - 固定为1条
    middleQuantity: 1,
    bottomComments: [{
      comment: '',
      image: null,
      imageUrl: ''
    }],
    deadline: '30', // 存储分钟数，默认30分钟
    releasesNumber: '1', // 任务发布次数，默认1次，使用字符串类型
    duplicateWarning: null
  });

  // 状态管理
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  // 选项列表
  const [industryOptions, setIndustryOptions] = useState<string[]>(['无']);

  // 页面加载时获取配置信息
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoadingConfig(true);
      try {
        log('info', '开始获取配置信息');
        const result = await apiCall('/api/quickTask/getConfig', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }, 'get');
        
        if (result.success && result.data) {
          log('info', '获取配置成功', result.data);
          const douyinId = result.data.config_info?.douyin_id || '';
          setConfig({
            name: result.data.config_info?.name || '',
            douyin_id: douyinId
          });
          
          // 将抖音ID插入到下评评论里
          setFormData(prev => ({
            ...prev,
            bottomComments: prev.bottomComments.map((comment, index) => {
              // 只在下评评论中插入抖音ID
              if (index === 0 && douyinId) {
                return {
                  ...comment,
                  comment: `@${douyinId}`
                };
              }
              return comment;
            })
          }));
        } else {
          log('error', '获取配置失败', { message: result.message, code: result.code });
        }
      } catch (error) {
        log('error', '获取配置失败', error);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

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

  // 当开始编辑时，将当前配置复制到编辑状态
  useEffect(() => {
    if (isEditingConfig) {
      setEditConfig({
        ...config
      });
    }
  }, [isEditingConfig, config]);

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

  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    message: '',
    buttonText: '确认',
    redirectUrl: ''
  });

  // 任务帮助模态框状态
  const [showTaskAssistance, setShowTaskAssistance] = useState(false);
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

  // 保存配置
  const handleSaveConfig = async () => {
    log('info', '=== 开始保存配置 ===');
    log('info', '保存的配置数据', editConfig);
    setIsSavingConfig(true);
    try {
      // 构建正确格式的请求数据
      const requestData = {
        config_info: editConfig
      };
      log('info', '发送的请求数据', requestData);
      
      const result = await apiCall('/api/quickTask/updateConfig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      }, 'update');
      
      if (result.success) {
        log('info', '配置保存成功，更新本地状态');
        setConfig(editConfig);
        setIsEditingConfig(false);
        showAlert('配置已更新', '确认', '');
      } else {
        log('error', '配置保存失败', { message: result.message, code: result.code });
        showAlert(result.message || '更新配置失败', '确认', '');
      }
    } catch (error) {
      log('error', '保存配置失败', error);
      showAlert('网络错误，请稍后重试', '确认', '');
    } finally {
      log('info', '=== 保存配置流程结束 ===');
      setIsSavingConfig(false);
    }
  };


  // 状态管理 - AI评论生成
  const [showCommentGenerator, setShowCommentGenerator] = useState(false);
  const [isGeneratingComments, setIsGeneratingComments] = useState(false);
  
  // 存储生成的评论
  const [generatedComments, setGeneratedComments] = useState<string[]>([]);

  // 处理评论生成完成
  const handleCommentGenerated = (comments: string[], success: boolean) => {
    log('info', '评论生成完成', { comments, success });
    
    // 存储生成的评论
    setGeneratedComments(comments);
    
    setShowCommentGenerator(false);
    
    // 只有评论生成成功后，才继续发布任务
    if (success === true) {
      log('info', '评论生成成功，等待1秒后继续发布任务');
      // 增加1秒延时，确保表单数据更新完成
      setTimeout(() => {
        log('info', '1秒延时结束，继续发布任务');
        handlePublishAfterCommentGeneration(comments);
      }, 1000);
      
    } else {
      log('error', '评论生成失败，停止发布任务');
      showAlert('AI生成评论失败，请稍后重试', '确认', '');
      setIsPublishing(false);
    }
  };

  // 发布任务 - 先打开AI生成评论模态框
  const handlePublish = () => {
    log('info', '开始发布任务流程');
    
    // 表单验证 - 视频链接验证
    if (formData.videoUrls.length === 0) {
      log('warn', '验证失败：视频链接数量为0');
      showAlert('请输入有效的视频链接', '确认', '');
      return;
    }

    if (formData.videoUrls.length > 10) {
      log('warn', '验证失败：视频链接数量超过10个');
      showAlert('视频链接数量不能超过10个', '确认', '');
      return;
    }

    // 打开AI生成评论模态框
    log('info', '打开AI生成评论模态框');
    setShowCommentGenerator(true);
  };

  // 计算两个字符串的相似度（使用编辑距离算法）
  const calculateSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // 删除
          matrix[i][j - 1] + 1, // 插入
          matrix[i - 1][j - 1] + cost // 替换
        );
      }
    }

    const maxLength = Math.max(len1, len2);
    const similarity = 1 - matrix[len1][len2] / maxLength;
    return similarity;
  };

  // 检查评论是否有重复
  const checkDuplicateComments = (comments: string[]): { hasDuplicate: boolean; duplicateIndices: number[] } => {
    const similarityThreshold = 0.6; // 相似度阈值
    const duplicateIndices: number[] = [];
    
    for (let i = 0; i < comments.length; i++) {
      for (let j = i + 1; j < comments.length; j++) {
        const similarity = calculateSimilarity(comments[i], comments[j]);
        if (similarity > similarityThreshold) {
          console.log(`[发布校验] 发现重复评论: 评论${i + 1} 与 评论${j + 1} 相似度 ${(similarity * 100).toFixed(2)}%`);
          if (!duplicateIndices.includes(i)) duplicateIndices.push(i);
          if (!duplicateIndices.includes(j)) duplicateIndices.push(j);
        }
      }
    }
    
    return { hasDuplicate: duplicateIndices.length > 0, duplicateIndices };
  };

  // 评论生成完成后继续发布任务
  const handlePublishAfterCommentGeneration = async (comments: string[]) => {
    console.log('评论生成完成，继续发布任务');
    console.log('使用生成的评论进行验证:', comments);
    
    // 显示加载状态
    setIsPublishing(true);

    try {
      // 任务发布次数等于去重后的有效视频链接数量
      const videoUrls = formData.videoUrls;
      const releasesNumber = videoUrls.length;
      const commentsPerTask = 2; // 每个任务2条评论：1条中评 + 1条下评

      // 验证评论数量
      if (comments.length < releasesNumber * commentsPerTask) {
        console.log('验证失败：评论数量不足');
        showAlert(`评论数量不足，需要 ${releasesNumber * commentsPerTask} 条评论，实际生成 ${comments.length} 条`, '确认', '');
        setIsPublishing(false);
        return;
      }

      // 检查评论是否有重复
      const { hasDuplicate, duplicateIndices } = checkDuplicateComments(comments);
      if (hasDuplicate) {
        console.log('验证失败：生成的评论存在重复');
        showAlert(`生成的评论存在重复或高度相似，请重新生成。重复评论序号: ${duplicateIndices.map(i => i + 1).join(', ')}`, '确认', '');
        setIsPublishing(false);
        return;
      }

      // 验证每条评论
      for (let i = 0; i < comments.length; i++) {
        if (!comments[i] || comments[i].trim() === '') {
          console.log(`验证失败：第 ${i + 1} 条评论为空`);
          showAlert(`第 ${i + 1} 条评论为空`, '确认', '');
          setIsPublishing(false);
          return;
        }

        // 中评评论（奇数索引）必须包含固定名称
        if (i % 2 === 0 && config.name && !comments[i].includes(config.name)) {
          console.log(`验证失败：第 ${i + 1} 条评论（中评）必须包含固定名称`);
          showAlert(`第 ${i + 1} 条评论（中评）必须包含固定名称 "${config.name}"`, '确认', '');
          setIsPublishing(false);
          return;
        }

        // 下评评论（偶数索引）必须包含@抖音ID
        if (i % 2 === 1 && config.douyin_id) {
          if (!comments[i].includes(`@${config.douyin_id}`)) {
            console.log(`第 ${i + 1} 条评论（下评）未包含@抖音ID，已自动添加`);
            comments[i] = `@${config.douyin_id} ${comments[i]}`;
            console.log('修改后的下评评论:', comments[i]);
          }

          if (!comments[i].includes(`@${config.douyin_id}`)) {
            console.log(`验证失败：第 ${i + 1} 条评论（下评）必须包含@抖音ID`);
            showAlert(`第 ${i + 1} 条评论（下评）必须包含 "@${config.douyin_id}"`, '确认', '');
            setIsPublishing(false);
            return;
          }
        }
      }

      console.log('验证通过，开始构建请求数据');

      // 计算总价格
      const stage2Count = formData.middleQuantity;
      const singlePrice = (stage1Price * stage1Count) + (stage2Price * stage2Count);
      const totalPrice = singlePrice * releasesNumber;
      console.log('价格计算：', { singlePrice, totalPrice, releasesNumber });

      // 视频链接数组
      console.log('视频链接数量：', videoUrls.length);

      // 构建recommend_marks数组 - 按照顺序添加所有评论
      const recommendMarks: RecommendMark[] = [];

      // 直接按照AI生成的评论顺序添加到recommend_marks数组
      for (let i = 0; i < comments.length; i++) {
        const recommendMark: RecommendMark = {
          comment: comments[i] || '',
          image_url: '' // 不使用表单中的图片URL，保持与示例一致
        };

        // 检查是否是下评评论（偶数索引）
        if (i % 2 === 1 && config.douyin_id) {
          // 提取@用户ID并添加到at_user字段
          const comment = comments[i];
          if (comment.includes(`@${config.douyin_id}`)) {
            recommendMark.at_user = config.douyin_id;
            console.log(`为第 ${Math.floor(i / 2) + 1} 条任务的下评评论添加@用户标记:`, config.douyin_id);
          }
        }

        recommendMarks.push(recommendMark);
      }
      console.log('添加评论完成，共', recommendMarks.length, '条评论');
      console.log('评论详情:', recommendMarks);

      // 构建请求体
      const requestData: CreateQuickTaskRequest = {
        template_id: templateId,
        video_url: videoUrls,
        deadline: Math.floor(Date.now() / 1000) + 30 * 60,
        releases_number: releasesNumber,
        stage1_count: stage1Count, // 每个任务1个中评
        stage2_count: stage2Count, // 每个任务1个下评
        total_price: totalPrice,
        recommend_marks: recommendMarks
      };
      console.log('请求数据构建完成:', requestData);
      console.log('阶段配置: stage1_count=', stage1Count, 'stage2_count=', stage2Count);
      console.log('预期评论数量:', releasesNumber * (stage1Count + stage2Count));
      console.log('实际评论数量:', recommendMarks.length);

      // 验证评论数量是否正确
      const expectedCommentsCount = releasesNumber * (stage1Count + stage2Count);
      if (recommendMarks.length !== expectedCommentsCount) {
        console.error('评论数量验证失败:', {
          expected: expectedCommentsCount,
          actual: recommendMarks.length
        });
        showAlert(`评论数量验证失败，预期 ${expectedCommentsCount} 条，实际 ${recommendMarks.length} 条`, '确认', '');
        setIsPublishing(false);
        return;
      }

      // 调用API
      log('info', '开始调用API发布任务');

      const result = await apiCall('/api/quickTask/Task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      }, 'create');

      console.log('API响应结果:', result);
      console.log('发布任务的请求体:', requestData);
      log('info', 'API响应结果', result);
      // 处理响应结果
      if (result.success && result.message !== '推荐评论数量不匹配，应为 2 组（1个阶段 1 + 1个阶段 2）') {
        // 发布成功
        log('info', '任务发布成功');
        showAlert(result.message || '任务发布成功！','确定', '/publisher/create/douyin');
      } else {
        // 发布失败
        log('error', '任务发布失败', { message: result.message, code: result.code });
        if (result.message && result.message.includes('推荐评论数量不匹配')) {
          // 评论数量不匹配错误
          console.error('评论数量不匹配错误，详细信息:', {
            releasesNumber,
            stage1Count,
            stage2Count,
            expectedCommentsCount,
            actualCommentsCount: recommendMarks.length,
            recommendMarks
          });
          showAlert(`评论数量不匹配，请重新生成评论。错误信息: ${result.message}`, '确认', '');
        } else if (result.code === 4019) {
          showAlert('账户余额不足，请充值后再发布任务。','前往充值', '/publisher/recharge');
        } else if (result.code === 4001) {
          showAlert('发布任务失败', '确定', '');
        } else if (result.code === 4002) {
          showAlert('任务模板 ID 不能为空', '确定', '');
        } else if (result.code === 4003) {
          showAlert('视频链接不能为空', '确定', '');
        } else if (result.code === 4004) {
          showAlert('视频链接数量必须与发布次数一致', '确定', '');
        } else if (result.code === 4005) {
          showAlert('到期时间不能为空', '确定', '');
        } else if (result.code === 4006) {
          showAlert('到期时间不能早于当前时间', '确定', '');
        } else if (result.code === 4007) {
          showAlert('发布次数必须大于 0', '确定', '');
        } else if (result.code === 4008) {
          showAlert('发布次数不能超过 100', '确定', '');
        } else if (result.code === 4009) {
          showAlert('任务不存在', '确定', '');
        } else if (result.code === 4010) {
          showAlert('任务已禁用', '确定', '');
        } else if (result.code === 4011) {
          showAlert('发布任务失败', '确定', '');
        } else if (result.code === 4012) {
          showAlert('只能发布一个评论', '确定', '');
        } else if (result.code === 4013) {
          showAlert('任务数量必须大于 0', '确定', '');
        } else if (result.code === 4014) {
          showAlert('评论不能为空', '确定', '');
        } else if (result.code === 4015) {
          showAlert('评论数量必须与发布次数一致', '确定', '');
        } else if (result.code === 4016) {
          showAlert('总价计算错误', '确定', '');
        } else if (result.code === 4017) {
          showAlert('用户信息异常', '确定', '');
        } else if (result.code === 4018) {
          showAlert('余额不足', '前往充值', '/publisher/recharge');
        } else if (result.code === 5001) {
          showAlert('网络超时，请重试', '确定', '');
        } else if (result.code === 5002) {
          showAlert('任务发布失败', '确定', '');
        } else {
          showAlert(`任务发布失败: ${result.message || '未知错误'}`, '确认', '');
        }
      }
    } catch (error) {
      log('error', '发布任务时发生错误', error);
      // 分析错误类型给出更具体的提示
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        showAlert('网络超时，请重试', '确认', '');
      } else {
        showAlert('发布任务失败，请稍后重试', '确认', '');
      }
    } finally {
      log('info', '发布任务流程结束');
      setIsPublishing(false);
    }
  };

  // 价格计算
  const singlePrice = (stage1Price * stage1Count) + (stage2Price * formData.middleQuantity);
  const releasesNumber = formData.videoUrls.length;
  const totalPrice = singlePrice * releasesNumber;
  const totalCost = totalPrice.toFixed(2);



  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-3 space-y-2">
        <h1 className="text-2xl font-bold pl-5">
          中下评快捷派单<span className="text-blue-500 cursor-pointer hover:underline ml-5" onClick={() => setShowTaskAssistance(true)}>！派单演示</span>
        </h1>

        <div className="ml-5">
          <button
            onClick={() => setShowTaskAssistance(true)}
            className="transition-colors flex items-center text-blue-600"
          >
            派单禁止项
          </button>
        </div>
        <div className="text-sm pl-5 text-red-500">
          <span className="text-1xl text-red-500">⚠️</span>提示：<br />
          1.违反平台的：引导词，极限词，赌博以及其他限制词<br />
          2.违反国家禁止的言论<br />
          3.本评论已经有人在做“广告@”<br />
          4.发布上评的点开头像发现没有作品，没什么关注或者粉丝的假人号和新号
        </div>
        {/* 固定昵称显示 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            固定名称 & 抖音ID
          </label>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div>
              <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:space-x-4">
                <div className="w-full md:w-auto">
                  <div className="flex flex-col md:flex md:items-center">
                    <span className="text-sm text-gray-600 mb-1 md:mb-0 md:mr-2">名称:</span>
                    {isEditingConfig ? (
                      <input
                        type="text"
                        value={editConfig.name}
                        onChange={(e) => setEditConfig({...editConfig, name: e.target.value})}
                        className="w-full md:w-auto px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="ml-0 md:ml-2">{config.name || '未设置'}</span>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <div className="flex flex-col md:flex md:items-center">
                    <span className="text-sm text-gray-600 mb-1 md:mb-0 md:mr-2">抖音ID或名称:</span>
                    {isEditingConfig ? (
                      <input
                        type="text"
                        value={editConfig.douyin_id}
                        onChange={(e) => setEditConfig({...editConfig, douyin_id: e.target.value})}
                        className="w-full md:w-auto px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="抖音ID或名称"
                      />
                    ) : (
                      <span className="ml-0 md:ml-2">{config.douyin_id || '未设置'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              {isEditingConfig ? (
                <Button
                  onClick={handleSaveConfig}
                  disabled={isSavingConfig}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  {isSavingConfig ? '保存中...' : '保存'}
                </Button>
              ) : (
                <Button
                  onClick={() => setIsEditingConfig(true)}
                  className="bg-gray-500 text-white hover:bg-gray-600"
                >
                  设置
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 视频链接列表输入 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <label className="text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
            <span>视频链接 <span className="text-red-500">*</span></span>
            
          </label>
          <div className="space-y-4">
            {/* 5个视频链接输入表单 */}
            {formData.videoUrlInputs.map((input, index) => {
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
              
              const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const newUrl = e.target.value;
                const newInputs = [...formData.videoUrlInputs];
                newInputs[index] = {
                  url: newUrl,
                  isDuplicate: false,
                  isValid: validateVideoUrl(newUrl)
                };
                
                // 检测重复链接
                const validUrls = newInputs.filter(input => input.isValid).map(input => input.url);
                const urlCount: Record<string, number> = {};
                
                // 统计每个链接出现的次数
                validUrls.forEach(url => {
                  urlCount[url] = (urlCount[url] || 0) + 1;
                });
                
                // 标记重复链接
                newInputs.forEach((input, i) => {
                  if (input.isValid && urlCount[input.url] > 1) {
                    newInputs[i].isDuplicate = true;
                  } else {
                    newInputs[i].isDuplicate = false;
                  }
                });
                
                // 过滤掉重复的链接，只保留第一个出现的链接
                const deduplicatedUrls = validUrls.filter((url, idx) => validUrls.indexOf(url) === idx);
                const duplicateCount = validUrls.length - deduplicatedUrls.length;
                
                // 发布任务校验：检查是否有重复链接
                if (duplicateCount > 0) {
                  log('warn', '检测到重复链接', { duplicateCount, validUrls, deduplicatedUrls });
                }
                
                setFormData(prev => ({
                  ...prev,
                  videoUrlInputs: newInputs,
                  videoUrls: deduplicatedUrls,
                  duplicateWarning: duplicateCount > 0 ? `已检测到${duplicateCount}条重复链接，只保留第一条` : ''
                }));
                
                // 发布任务校验：检查是否有重复链接
                if (duplicateCount > 0) {
                  log('warn', '检测到重复链接', { duplicateCount, validUrls, deduplicatedUrls });
                }
              };
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">                
                    {input.url && (
                      <span className={`text-xs ${input.isDuplicate ? 'text-red-500' : 'text-green-500'}`}>
                        {input.isDuplicate ? '✗ 重复' : input.isValid ? '✓ 有效' : '✗ 无效'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${input.url && !input.isValid ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="请输入抖音视频链接"
                    value={input.url}
                    onChange={handleUrlChange}
                  />
                  {input.url && !input.isValid && (
                    <p className="text-sm text-red-500">
                      {input.url.length <= 35 ? '错误的口令，请提交你做单的评论口令' : '错误的口令，请提交你做单的评论口令'}
                    </p>
                  )}
                </div>
              );
            })}
            
            {/* 有效视频链接数量提示 */}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                有效视频链接数量：<span className="font-medium">{formData.videoUrls.length}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                提示：只有有效的视频链接会被计入任务发布次数
              </p>
            </div>
          </div>
        </div>

        {/* 任务发布次数 */}
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务发布次数
          </label>
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-lg font-medium">{formData.videoUrls.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              发布次数根据有效视频链接数量自动计算
            </p>
          </div>
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
      <GlobalWarningModal
        isOpen={showAlertModal}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        redirectUrl={alertConfig.redirectUrl}
        iconType="success"
        onClose={() => setShowAlertModal(false)}
      />

      {/* 任务帮助模态框 */}
      <TaskAssistance
        isOpen={showTaskAssistance}
        onClose={() => setShowTaskAssistance(false)}
      />
      
      {/* AI生成评论模态框 */}
      <Modal
        isOpen={showCommentGenerator}
        onClose={() => !isGeneratingComments && setShowCommentGenerator(false)}
        title="AI生成评论"
        className="w-full max-w-md"
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            {isGeneratingComments ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-700">正在生成评论，请稍候...</p>
                <p className="text-sm text-gray-500">AI正在为您生成优质评论，大约需要3-5秒</p>
              </div>
            ) : (
              <AIcoment
                onCommentsGenerated={handleCommentGenerated}
                onProgressUpdate={(current, total) => {
                  // 可选：显示进度
                  console.log(`评论生成进度: ${current}/${total}`);
                }}
                isLoading={isGeneratingComments}
                onLoadingChange={setIsGeneratingComments}
                commentCount={formData.videoUrls.length * 2} // 生成2条评论/任务：1条中评 + 1条下评
                atUser={config.douyin_id}
                name={config.name}
                userComments={[formData.middleComment.comment, ...formData.bottomComments.map(c => c.comment)]}
                sessionId="default"
              />
            )}
          </div>
        </div>
      </Modal>
      </div>
  );
}