'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Typography, Row, Col, Space } from 'antd';
import { UserOutlined, MessageOutlined } from '@ant-design/icons';
import { PublisherBottomNavigation } from '../components/PublisherBottomNavigation';

const { Title, Text } = Typography;



const OrderManagementPage: React.FC = () => {
  const router = useRouter();

  const handleAccountRentalOrderClick = () => {
    // 导航到账号租赁相关页面
    router.push('/accountrental');
  };

  const handleCommentOrderClick = () => {
    // 导航到评论订单页面
    router.push('/publisher/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题区域 */}
        <div className="mb-8">
          <Title level={3}>订单管理</Title>
          <Text type="secondary">请选择您需要查看的订单</Text>
        </div>

        {/* 订单类型选择卡片 */}
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} md={10} lg={8}>
            <Card 
              hoverable 
              className="h-full transition-all duration-300 hover:shadow-lg"
              bodyStyle={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <MessageOutlined style={{ fontSize: '3rem', color: '#52c41a', marginBottom: '1rem' }} />
              <Title level={4} className="text-center mb-2">评论订单</Title>
              <Text type="secondary" className="text-center mb-4">管理您的评论任务相关订单</Text>
              <Button 
                type="primary" 
                size="large"
                onClick={handleCommentOrderClick}
                className="w-full"
                icon={<MessageOutlined />}
              >
                评论订单管理
              </Button>
            </Card>
          </Col>
          <Col xs={24} md={10} lg={8}>
            <Card 
              hoverable 
              className="h-full transition-all duration-300 hover:shadow-lg"
              bodyStyle={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <UserOutlined style={{ fontSize: '3rem', color: '#1890ff', marginBottom: '1rem' }} />
              <Title level={4} className="text-center mb-2">账号租赁订单</Title>
              <Text type="secondary" className="text-center mb-4">管理您的账号租赁相关订单</Text>
              <Button 
                type="primary" 
                size="large"
                onClick={handleAccountRentalOrderClick}
                className="w-full"
                icon={<UserOutlined />}
              >
                账号租赁订单管理
              </Button>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 使用底部导航组件 */}
      <PublisherBottomNavigation />
    </div>
  );
};

export default OrderManagementPage;