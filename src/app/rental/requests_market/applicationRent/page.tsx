'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Textarea, Label, Button } from '@/components/ui';
import ImageUpload from '@/components/imagesUpload/ImageUpload';

// 定义简化的表单类型
interface SimplifiedForm {
  description: string; // 账号信息
  accountImages: string[];
  allowRenew: 0 | 1; // 是否允许续租
}

// 主内容组件，包含useSearchParams的使用
const MainContent = () => {
  // 获取URL查询参数
  const searchParams = useSearchParams();
  const [demandId, setDemandId] = useState<number | undefined>(undefined);
  
  // 从URL查询参数中获取demand_id
  useEffect(() => {
    // 方法1：使用useSearchParams获取demand_id查询参数
    const demandIdParam = searchParams.get('demand_id');
    if (demandIdParam) {
      const parsedId = parseInt(demandIdParam);
      if (!isNaN(parsedId) && parsedId > 0) {
        setDemandId(parsedId);
        console.log('从URL查询参数获取到demand_id:', parsedId);
        return;
      }
    }
    
    console.log('无法获取有效的id参数');
  }, [searchParams]);
  
  const [formData, setFormData] = useState<SimplifiedForm>({
    description: '', // 账号信息
    accountImages: [],
    allowRenew: 1, // 默认允许续租
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 处理图片变化
  const handleImagesChange = (files: File[], urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      accountImages: urls
    }));
    
    // 清除图片上传错误
    if (errors.accountImages) {
      setErrors(prev => ({
        ...prev,
        accountImages: ''
      }));
    }
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 验证demandId
    if (demandId === undefined || isNaN(demandId) || demandId <= 0) {
      newErrors.demandId = '无效的求租信息ID';
    }
    console.log('应征申请的id；demandId:', demandId);
    if (!formData.description.trim()) {
      newErrors.description = '请输入账号信息';
    } else if (formData.description.length < 0 || formData.description.length > 300) {
      newErrors.description = '账号信息长度需在0-300个字符之间';
    }
    
    if (formData.accountImages.length === 0) {
      newErrors.accountImages = '请至少上传一张账号截图';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理应征申请提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 构建符合API要求的请求数据
      const requestData = {
        demand_id: demandId,
        allow_renew: formData.allowRenew,
        application_json: {
          screenshots: formData.accountImages,
          description: formData.description
        }
      };
      console.log('请求API提交的信息:', requestData);
      // 调用API
      const response = await fetch('/api/rental/requestRental/applyRequestRentalInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 处理成功响应
        alert('应征申请提交成功！');
      } else {
        // 处理失败响应
        alert(`提交失败：${result.message}`);
      }
    } catch (error) {
      // 处理网络错误
      console.error('应征申请提交错误:', error);
      alert('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-2">
        <div className="bg-blue-50 border border-blue-200 p-2">
             求租信息账号应征申请，请详细描述你的账号信息和上传账号截图
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden py-5 px-3">
          {/* 基础信息 */}
          <div className="space-y-1 mb-2">  
            <div className="space-y-1">
              {/* 显示demandId错误信息 */}
              {errors.demandId && (
                <p className="text-red-500 text-sm mb-2">{errors.demandId}</p>
              )}
              
              {/* 账号信息 */}
              <div className="space-y-1">
                <Label htmlFor="description" required>账号信息</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="填写你的账号信息，账号需真实有效，无异常"
                  className={`${errors.description ? 'border-red-500' : ''} resize-none`}
                  style={{ height: 150,width: '100%' }}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>
              
              {/* 账号截图 - 使用ImageUpload组件 */}
              <div className="space-y-1">
                <Label required>上传账号截图</Label>
                <ImageUpload
                  maxCount={6}
                  onImagesChange={handleImagesChange}
                  title=""
                  columns={3}
                  gridWidth="100%"
                  itemSize="100x100"
                />
                {errors.accountImages && (
                  <p className="text-red-500 text-sm">{errors.accountImages}</p>
                )}
              </div>

              {/* 是否允许续租 */}
              <div className="space-y-1">
                <Label required>是否允许续租</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="allowRenew"
                      value={1}
                      checked={formData.allowRenew === 1}
                      onChange={() => handleInputChange('allowRenew', 1)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm">是</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="allowRenew"
                      value={0}
                      checked={formData.allowRenew === 0}
                      onChange={() => handleInputChange('allowRenew', 0)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm">否</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
{/* 应征申请按钮 */}
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={handleSubmit}
              variant="primary"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  提交中...
                </>
              ) : (
                '应征申请'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 主组件，使用Suspense包裹MainContent
export default function DouyinAccountRentalPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">加载中...</div>}>
      <MainContent />
    </Suspense>
  );
}