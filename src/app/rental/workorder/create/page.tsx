'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Form, Input, message, Space } from 'antd';
import ImageUpload from '@/components/imagesUpload/ImageUpload';
import { CreateWorkOrderRequest, CreateWorkOrderResponse } from '@/app/rental/types/workorder/createWorkOrderTypes';

// 工单表单数据类型
interface WorkOrderFormData {
  order_id: number;
  title: string;
  description: string;
}

const CreateWorkOrderPage = () => {
  const router = useRouter();
  // 表单数据状态
  const [form] = Form.useForm<WorkOrderFormData>();
  const [loading, setLoading] = useState<boolean>(false);
  // 图片上传相关状态 - 已注释
  // const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // 图片上传变化处理函数 - 已注释
  // const handleImagesChange = (images: File[], urls: string[]) => {
  //   setUploadedImages(urls);
  // };

  // 处理表单提交
  const handleSubmit = async (values: WorkOrderFormData) => {
    setLoading(true);
    try {
      // 构造工单数据 - 已注释图片上传
      const workOrderData: CreateWorkOrderRequest = {
        ...values
        // images: uploadedImages
      };

      console.log('工单提交数据:', workOrderData);

      // 调用API中间件
      const response = await fetch('/api/workOrder/creatWorkOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workOrderData)
      });
      
      const data: CreateWorkOrderResponse = await response.json();
      
      if (data.code === 0) {
        message.success(data.message || '工单创建成功');
        // 跳转到工单列表页面
        router.push('/rental/workorder');
      } else {
        message.error(data.message || '工单创建失败');
      }
    } catch (error) {
      console.error('工单创建失败:', error);
      message.error('工单创建失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-3 pt-8 pb-16">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-800">创建工单</h1>
      </div>

      {/* 工单表单卡片 */}
      <Card className="border-0 rounded-lg shadow-sm mb-4">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            order_id: null,
            title: '',
            description: ''
           
          }}
        >
          {/* 订单ID输入 */}
          <Form.Item
            name="order_id"
            label="订单ID"
            rules={[
              {  message: '订单ID必须是数字' }
            ]}
          >
            <Input
              placeholder="请输入订单ID"
              type="number"
              className="w-full"
            />
          </Form.Item>

          {/* 标题输入 */}
          <Form.Item
            name="title"
            label="工单标题"
            rules={[
              { required: true, message: '请输入工单标题' },
              { min: 2, max: 50, message: '标题长度必须在2-50个字符之间' }
            ]}
          >
            <Input
              placeholder="请输入工单标题（如：诈骗、账号问题等）"
              className="w-full"
            />
          </Form.Item>

          {/* 详细信息输入 */}
          <Form.Item
            name="description"
            label="详细信息"
            rules={[
              { required: true, message: '请输入详细信息' },
              { min: 5, max: 500, message: '详细信息长度必须在5-500个字符之间' }
            ]}
          >
            <Input.TextArea
              placeholder="请详细描述您遇到的问题"
              rows={6}
              className="w-full"
            />
          </Form.Item>

          {/* 图片上传 - 已注释
          <Form.Item
            name="images"
            label="上传图片（最多5张）"
          >
            <ImageUpload
              maxCount={5}
              onImagesChange={handleImagesChange}
              title=""
              columns={3}
              itemSize="100x100"
            />
          </Form.Item> */}

          {/* 提交按钮 */}
          <div className="flex justify-center mt-8">
            <Space size="large">
              <Button
                type="default"
                onClick={() => router.back()}
                className="px-8"
              >
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="px-8"
              >
                提交工单
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreateWorkOrderPage;