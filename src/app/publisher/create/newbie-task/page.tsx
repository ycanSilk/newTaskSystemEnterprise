'use client';

import { Button, Input } from '@/components/ui';
import GlobalWarningModal from '@/components/button/globalWarning/GlobalWarningModal';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ImageUpload from '@/components/imagesUpload/ImageUpload';
import TaskAssistance from '@/components/taskAssistance/taskAssistance';
import AiCommentGenerator from '@/components/aiCommentBtn/AiCommentGenerator';

// 类型定义
interface RecommendMark {
  comment: string;
  image_url: string;
  at_user: string;
}

interface PublishTaskFormData {
  videoUrl: string;
  quantity: number;
  comments: Array<{
    content: string;
    image: File | null;
    imageUrl: string;
  }>;
  deadline: string;
}

interface NewBbieTaskRequest {
  template_id: number;
  video_url: string;
  deadline: number;
  task_count: number;
  total_price: number;
  is_newbie: number;
  recommend_marks: RecommendMark[];
}

interface WalletInfo {
  before_balance: string;
  after_balance: string;
  deducted: string;
}

interface NewBbieTaskResponseData {
  task_id: number;
  is_combo: boolean;
  template_id: number;
  template_title: string;
  video_url: string;
  deadline: number;
  task_count: number;
  task_done: number;
  task_doing: number;
  task_reviewing: number;
  unit_price: number;
  total_price: number;
  recommend_marks: RecommendMark[];
  status: number;
  wallet: WalletInfo;
}

interface NewBbieTaskResponse {
  code: number;
  message: string;
  data: NewBbieTaskResponseData;
  timestamp: number;
}

export default function NewbieTaskPage() {

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
  const taskPrice = parseFloat(getSearchParam('stage1Price') || getSearchParam('price').trim() || '4');
  const taskQuantity = parseInt(getSearchParam('stage1Count') || '1'); // 默认为1

  // 表单状态
  const [formData, setFormData] = useState<PublishTaskFormData>({
    videoUrl: '', // 默认视频链接
    quantity: taskQuantity, // 使用URL传递的任务数量
    comments: Array.from({ length: taskQuantity }, () => ({
      content: '',
      image: null,
      imageUrl: ''
    })),
    deadline: '30' // 默认截止时间设为30分钟
  });
  
  // 保存每个评论的图片上传状态
  const [commentImages, setCommentImages] = useState<File[][]>(Array.from({ length: taskQuantity }, () => []));
  const [commentImageUrls, setCommentImageUrls] = useState<string[][]>(Array.from({ length: taskQuantity }, () => []));

  // 发布状态
  const [isPublishing, setIsPublishing] = useState(false);
  // AI评论生成状态
  const [isAIGenerating, setIsAIGenerating] = useState(false);
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

  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    message: '',
    buttonText: '确认',
    redirectUrl: ''
  });

  // 验证视频链接
  const validateVideoUrl = (url: string) => {
    return url.length > 35 && (
      url.includes('复制打开抖音') || 
      url.includes('复制此链接，打开Dou音搜索') || 
      url.includes('douyin.com')
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

  // 任务数量变化处理 - 允许1-10个任务
  const [quantityInput, setQuantityInput] = useState(taskQuantity.toString());
  
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
      showAlert('请输入抖音视频链接');
      return;
    }

    // 2. 验证视频链接格式
    if (!validateVideoUrl(formData.videoUrl)) {
      showAlert('请输入有效的视频链接');
      return;
    }
    
    // 2. 验证截止时间
    if (!formData.deadline) {
      showAlert('请选择任务截止时间');
      return;
    }
    
    // 3. 验证评论内容
    const validComments = formData.comments.filter(comment => comment.content.trim() !== '');
    if (validComments.length === 0) {
      showAlert('请输入评论内容');
      return;
    }
    
    // 4. 验证任务数量
    if (!formData.quantity || formData.quantity < 1) {
      showAlert('请设置有效的任务数量');
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
        showAlert(`评论中包含敏感词: ${uniqueShieldWords.join('、')}，请重新输入评论`);
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
      const requestBody: NewBbieTaskRequest = {
        template_id: templateId,
        video_url: formData.videoUrl.trim(),
        deadline,
        task_count: formData.quantity,
        total_price: totalPrice,
        is_newbie:1,
        recommend_marks: formData.comments.map(comment => ({
          comment: comment.content.trim(),
          image_url: comment.imageUrl,
          at_user: ''
        }))
      };

      // 调用API
      const apiUrl = '/api/task/newbieTask';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const result: NewBbieTaskResponse = await response.json();
      
      // 处理响应
      if (result.code === 0) {
        // 成功处理
        showAlert(result.message || '任务发布成功！', '确定', '/publisher/create/douyin');
      } else if (result.code === 4016) {
        // 余额不足
        showAlert('账户余额不足，请先充值', '前往充值', '/publisher/recharge');
      } else if (result.code === 4001) {
        showAlert('请求体不能为空', '确定', '');
      } else if (result.code === 4002) {
        showAlert('任务模板 ID 不能为空', '确定', '');
      } else if (result.code === 4003) {
        showAlert('视频链接不能为空', '确定', '');
      } else if (result.code === 4004) {
        showAlert('到期时间不能为空', '确定', '');
      } else if (result.code === 4005) {
        showAlert('到期时间不能早于当前时间', '确定', '');
      } else if (result.code === 4006) {
        showAlert('任务模板不存在', '确定', '');
      } else if (result.code === 4007) {
        showAlert('任务模板已禁用', '确定', '');
      } else if (result.code === 4008) {
        showAlert('任务数量必须大于 0', '确定', '');
      } else if (result.code === 4009) {
        showAlert('推荐评论格式错误', '确定', '');
      } else if (result.code === 4010) {
        showAlert('推荐评论数量不匹配', '确定', '');
      } else if (result.code === 4011) {
        showAlert('总价计算错误', '确定', '');
      } else if (result.code === 4012) {
        showAlert('组合任务阶段 1 固定为 1 个任务', '确定', '');
      } else if (result.code === 4013) {
        showAlert('阶段 2 数量必须大于 0', '确定', '');
      } else if (result.code === 4014) {
        showAlert('用户信息异常', '确定', '');
      } else if (result.code === 4015) {
        showAlert('钱包不存在', '确定', '');
      } else if (result.code === 5001) {
        showAlert('数据库错误', '确定', '');
      } else if (result.code === 5002) {
        showAlert('任务发布失败', '确定', '');
      } else {
        // 显示错误信息
        showAlert(result.message || '任务发布失败', '确定', '');
      }
    } catch (error) {
      // 错误处理
      console.error('发布任务失败:', error);
      showAlert('网络错误，请稍后重试');
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
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      {/* AI生成评论时的加载覆盖层 */}
      {isAIGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-800">评论生成中...</p>
          </div>
        </div>
      )}
      <div className="px-4 py-3 space-y-2">
        <h1 className="text-2xl font-bold pl-5">
          发布上评评论<span className="text-blue-500 cursor-pointer hover:underline ml-5" onClick={() => setShowTaskAssistance(true)}>！派单演示</span>
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
          <span className="text-1xl text-red-500">⚠️</span>派单禁止提示：<br />
            1.作者有删除评论习惯的视频<br />
            2.违反平台的：引导词，极限词，赌博以及其他限制词<br />
            3.违反国家禁止的言论
        </div>

        {/* 视频链接 */}
        <div className="bg-white rounded-md px-4  py-2 shadow-sm">
          <label className="text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
            <span>视频链接 <span className="text-red-500">*</span></span>
            <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => setShowTaskAssistance(true)}>！派单指引</span>
          </label>
          <Input
            placeholder="请输入抖音视频链接"
            value={formData.videoUrl}
            onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
            className={`w-full ${formData.videoUrl.length > 0 && !validateVideoUrl(formData.videoUrl) ? 'border-red-500' : 'border-gray-200'}`}
          />
          {formData.videoUrl.length > 0 && !validateVideoUrl(formData.videoUrl) && (
            <p className="text-sm text-red-500 mt-1">
              {formData.videoUrl.length <= 35 ? '错误的口令，请提交你做单的评论口令' : '错误的口令，请提交你做单的评论口令'}
            </p>
          )}
        </div>

        {/* 截止时间 */}
        <div className="bg-white rounded-md px-4  py-2 shadow-sm">
          <label className="block text-sm font-medium text-gray-700">
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
          {/* 行业筛选下拉菜单 */}
          <div className="bg-white rounded-md shadow-sm ">
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
          
          {/* 固定昵称和AI生成评论 */}
          <AiCommentGenerator
            onCommentsGenerated={(comments) => {
              setFormData(prevData => ({
                ...prevData,
                comments: prevData.comments.map((comment, index) => ({
                  ...comment,
                  content: comments[index] || ''
                }))
              }));
              showAlert(`已为${comments.length}条评论生成内容！`);
            }}
            onProgressUpdate={(current, total) => {
              // 可选：显示进度
              console.log(`评论生成进度: ${current}/${total}`);
            }}
            isLoading={isAIGenerating}
            onLoadingChange={setIsAIGenerating}
            commentCount={formData.quantity}
            userComments={formData.comments.map(comment => comment.content)}
            industry={selectedIndustry}
            sessionId={sessionId}
          />
          {/* 任务数量 */}
        <div className="bg-white">
          <label className="block text-sm font-medium text-gray-700">
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
            <div key={index} className="py-2 border-b border-gray-200 last:border-b-0">
              <label className="block text-sm font-medium text-gray-700">
                推荐评论 {index + 1}
              </label>
              <div className="flex space-x-3">
                <textarea
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder={index === 0 ? "请手动输入你要的评论，多条评论可以进行AI润色" : "请输入推荐评论内容"}
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
          disabled={!formData.videoUrl.trim() || !validateVideoUrl(formData.videoUrl) || formData.quantity === undefined || formData.quantity < 1 || isPublishing || isAIGenerating}
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

      {/* 通用提示框组件 - 使用 GlobalWarningModal */}
      <GlobalWarningModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        redirectUrl={alertConfig.redirectUrl}
        iconType="success"
      />
    </div>
  );
}
