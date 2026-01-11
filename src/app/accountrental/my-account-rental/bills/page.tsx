'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import FilterOutlined from '@ant-design/icons/FilterOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import CreditCardOutlined from '@ant-design/icons/CreditCardOutlined';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ExclamationCircleOutlined from '@ant-design/icons/ExclamationCircleOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import ShareAltOutlined from '@ant-design/icons/ShareAltOutlined';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/Dropdown-menu';

// 账单类型定义
interface Bill {
  id: string;
  orderId: string;
  type: 'rental_payment' | 'rental_income' | 'recharge' | 'withdrawal' | 'platform_fee' | 'refund';
  amount: number;
  date: string;
  status: 'paid' | 'unpaid' | 'refunded' | 'processing' | 'failed';
  description: string;
  dueDate?: string;
  paymentMethod?: string;
  transactionId?: string;
}

const BillsPage = () => {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [activeTab, setActiveTab] = useState('all');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState('');

  // 模拟获取数据
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // 模拟账单数据
        const mockBills: Bill[] = [
          {
            id: 'bill-001',
            orderId: 'ORD-20230701-001',
            type: 'rental_payment',
            amount: 480.00,
            date: '2023-07-01',
            status: 'paid',
            description: '租赁账号：美食探店达人',
            dueDate: '2023-07-01',
            paymentMethod: '支付宝',
            transactionId: 'txn-001'
          },
          {
            id: 'bill-002',
            orderId: 'ORD-20230628-002',
            type: 'rental_income',
            amount: 1200.00,
            date: '2023-06-28',
            status: 'paid',
            description: '账号租赁收入：科技产品评测',
            paymentMethod: '平台余额',
            transactionId: 'txn-003'
          },
          {
            id: 'bill-003',
            orderId: 'RECH-20230630-001',
            type: 'recharge',
            amount: 2000.00,
            date: '2023-06-30',
            status: 'paid',
            description: '账户充值',
            paymentMethod: '支付宝',
            transactionId: 'txn-002'
          },
          {
            id: 'bill-004',
            orderId: 'WITH-20230625-001',
            type: 'withdrawal',
            amount: 5000.00,
            date: '2023-06-25',
            status: 'paid',
            description: '账户提现至工商银行储蓄卡',
            paymentMethod: '工商银行',
            transactionId: 'txn-004'
          },
          {
            id: 'bill-005',
            orderId: 'FEE-20230620-001',
            type: 'platform_fee',
            amount: 150.00,
            date: '2023-06-20',
            status: 'paid',
            description: '平台服务费',
            paymentMethod: '平台余额',
            transactionId: 'txn-005'
          },
          {
            id: 'bill-006',
            orderId: 'ORD-20230618-001',
            type: 'rental_payment',
            amount: 540.00,
            date: '2023-06-18',
            status: 'paid',
            description: '租赁账号：时尚搭配指南',
            dueDate: '2023-06-18',
            paymentMethod: '微信支付',
            transactionId: 'txn-006'
          },
          {
            id: 'bill-007',
            orderId: 'REFUND-20230615-001',
            type: 'refund',
            amount: 800.00,
            date: '2023-06-15',
            status: 'refunded',
            description: '订单退款：生活方式分享',
            paymentMethod: '平台余额',
            transactionId: 'txn-007'
          },
          {
            id: 'bill-008',
            orderId: 'ORD-20230702-003',
            type: 'rental_payment',
            amount: 600.00,
            date: '2023-07-02',
            status: 'unpaid',
            description: '租赁账号：生活方式分享',
            dueDate: '2023-07-03'
          },
          {
            id: 'bill-009',
            orderId: 'WITH-20230702-001',
            type: 'withdrawal',
            amount: 2000.00,
            date: '2023-07-02',
            status: 'processing',
            description: '账户提现至工商银行储蓄卡',
            paymentMethod: '工商银行'
          }
        ];
        
        setBills(mockBills);
      } catch (error) {
        console.error('获取账单列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  // 筛选账单
  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.amount.toString().includes(searchTerm);
    
    const matchesStatus = selectedStatus === 'all' || bill.status === selectedStatus;
    const matchesType = selectedType === 'all' || bill.type === selectedType;
    
    let matchesTab = true;
    if (activeTab === 'paid') {
      matchesTab = bill.status === 'paid' || bill.status === 'refunded';
    } else if (activeTab === 'unpaid') {
      matchesTab = bill.status === 'unpaid' || bill.status === 'processing';
    }
    
    const matchesPeriod = selectedPeriod === 'all' || 
      (selectedPeriod === 'today' && isToday(bill.date)) ||
      (selectedPeriod === 'week' && isThisWeek(bill.date)) ||
      (selectedPeriod === 'month' && isThisMonth(bill.date));
    
    return matchesSearch && matchesStatus && matchesType && matchesTab && matchesPeriod;
  });

  // 排序账单
  const sortedBills = [...filteredBills].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'amount_desc') {
      return b.amount - a.amount;
    } else if (sortBy === 'amount_asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  // 工具函数：判断是否为今天
  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  }

  // 工具函数：判断是否为本周
  const isThisWeek = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
  }

  // 工具函数：判断是否为本月
  const isThisMonth = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  // 获取完整日期格式
  const getFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 获取账单类型对应的图标和颜色
  const getBillIcon = (type: string, isIncome: boolean) => {
    const iconMap: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
      rental_payment: {
        icon: <CreditCardOutlined className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      },
      rental_income: {
        icon: <WalletOutlined className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      recharge: {
        icon: <WalletOutlined className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      withdrawal: {
        icon: <CreditCardOutlined className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      },
      platform_fee: {
        icon: <InfoCircleOutlined className="h-4 w-4" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      },
      refund: {
        icon: <InfoCircleOutlined className="h-4 w-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      }
    };
    return iconMap[type] || {
      icon: <InfoCircleOutlined className="h-4 w-4" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    };
  };

  // 获取账单类型对应的中文名称
  const getBillType = (type: string) => {
    const typeMap: Record<string, string> = {
      rental_payment: '租赁支付',
      rental_income: '租赁收入',
      recharge: '账户充值',
      withdrawal: '账户提现',
      platform_fee: '平台服务费',
      refund: '订单退款'
    };
    return typeMap[type] || type;
  };

  // 获取状态对应的中文名称和颜色
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; badgeColor: string }> = {
      paid: { text: '已支付', color: 'text-green-600', badgeColor: 'bg-green-100' },
      unpaid: { text: '待支付', color: 'text-orange-600', badgeColor: 'bg-orange-100' },
      refunded: { text: '已退款', color: 'text-blue-600', badgeColor: 'bg-blue-100' },
      processing: { text: '处理中', color: 'text-purple-600', badgeColor: 'bg-purple-100' },
      failed: { text: '支付失败', color: 'text-red-600', badgeColor: 'bg-red-100' }
    };
    return statusMap[status] || { text: status, color: 'text-gray-600', badgeColor: 'bg-gray-100' };
  };

  // 处理查看账单详情
  const handleViewBill = (billId: string) => {
    console.log('查看账单详情:', billId);
    // 在实际项目中，应该跳转到账单详情页面
    // router.push(`/accountrental/bills/${billId}`);
  };

  // 处理支付账单
  const handlePayBill = (billId: string) => {
    console.log('支付账单:', billId);
    // 在实际项目中，应该跳转到支付页面
    // router.push(`/accountrental/payment/${billId}`);
  };

  // 处理下载账单
  const handleDownloadBill = (billId: string) => {
    console.log('下载账单:', billId);
    // 在实际项目中，应该调用下载API
  };

  // 处理分享账单
  const handleShareBill = (billId: string) => {
    console.log('分享账单:', billId);
    // 在实际项目中，应该调用分享功能
  };

  // 计算待支付金额总数
  const totalUnpaidAmount = bills
    .filter(bill => bill.status === 'unpaid')
    .reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 待支付提示 */}
      {totalUnpaidAmount > 0 && (
        <div className="px-4 py-3 mt-2 bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <ExclamationCircleOutlined className="h-4 w-4 text-orange-600 mr-2 mt-0.5" />
              <p className="text-xs text-orange-700">您有 {totalUnpaidAmount.toFixed(2)} 元待支付账单</p>
            </div>
            <Button 
              onClick={() => setActiveTab('unpaid')}
              className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1"
            >
              去支付
            </Button>
          </div>
        </div>
      )}

      {/* 搜索和筛选区域 */}
      <div className="px-4 py-3 bg-white mt-1">
        <div className="relative mb-3">
          <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜索订单号、账单描述"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 筛选条件面板 */}
      {isFilterVisible && (
        <div className="px-4 py-3 bg-white mt-1">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">账单状态</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedStatus === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                全部
              </button>
              <button
                onClick={() => setSelectedStatus('paid')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                已支付
              </button>
              <button
                onClick={() => setSelectedStatus('unpaid')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedStatus === 'unpaid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                待支付
              </button>
              <button
                onClick={() => setSelectedStatus('refunded')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedStatus === 'refunded' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                已退款
              </button>
              <button
                onClick={() => setSelectedStatus('processing')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedStatus === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                处理中
              </button>
            </div>
          </div>
          
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">账单类型</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedType === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                全部
              </button>
              <button
                onClick={() => setSelectedType('rental_payment')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedType === 'rental_payment' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                租赁支付
              </button>
              <button
                onClick={() => setSelectedType('rental_income')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedType === 'rental_income' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                租赁收入
              </button>
              <button
                onClick={() => setSelectedType('recharge')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedType === 'recharge' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                账户充值
              </button>
              <button
                onClick={() => setSelectedType('withdrawal')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedType === 'withdrawal' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                账户提现
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">时间范围</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPeriod('all')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedPeriod === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                全部
              </button>
              <button
                onClick={() => setSelectedPeriod('today')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedPeriod === 'today' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                今天
              </button>
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedPeriod === 'week' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                本周
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-3 py-1.5 text-xs rounded-full ${selectedPeriod === 'month' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                本月
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 账单类型标签页 */}
      <div className="mt-1 bg-white">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all" className="text-sm">全部账单</TabsTrigger>
            <TabsTrigger value="paid" className="text-sm">已支付</TabsTrigger>
            <TabsTrigger value="unpaid" className="text-sm">待支付</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 账单列表 */}
      <div className="px-4 py-3">
        {loading ? (
          // 加载状态
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-1" />
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-1/5" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedBills.length === 0 ? (
          // 空状态
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-5xl mb-3">📄</div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">暂无账单记录</h3>
            {activeTab === 'unpaid' && (
              <p className=" text-sm mb-4">您没有待支付的账单</p>
            )}
            {activeTab === 'paid' && (
              <p className=" text-sm mb-4">您没有已支付的账单</p>
            )}
            {activeTab === 'all' && (
              <p className=" text-sm mb-4">您还没有任何账单记录</p>
            )}
          </div>
        ) : (
          // 账单列表
          <div className="space-y-3">
            {sortedBills.map((bill) => {
              const statusInfo = getStatusInfo(bill.status);
              const isIncome = bill.type === 'rental_income' || bill.type === 'recharge' || bill.type === 'refund';
              const iconInfo = getBillIcon(bill.type, isIncome);
              const isUnpaid = bill.status === 'unpaid';
              const isProcessing = bill.status === 'processing';
              
              return (
                <Card key={bill.id} className="overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => handleViewBill(bill.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full ${iconInfo.bgColor} flex items-center justify-center`}>
                          <div className={iconInfo.color}>{iconInfo.icon}</div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{bill.description}</h3>
                          <div className="flex items-center mt-0.5">
                            <Badge className={`text-xs mr-2 ${statusInfo.badgeColor} ${statusInfo.color}`}>
                              {statusInfo.text}
                            </Badge>
                            {bill.type === 'rental_payment' && (
                              <Badge className="text-xs bg-blue-50 text-blue-600 border-blue-100">
                                租赁支付
                              </Badge>
                            )}
                            {bill.type === 'rental_income' && (
                              <Badge className="text-xs bg-green-50 text-green-600 border-green-100">
                                租赁收入
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                          {isIncome ? '+' : '-'}{bill.amount.toFixed(2)}
                        </div>
                        <div className="text-xs  mt-0.5">
                          {formatDate(bill.date)}
                        </div>
                      </div>
                    </div>

                    
                    <div className="flex items-center mb-2">
                        <span className="text-gray-500">订单号：</span>
                        <span className="font-medium text-gray-800 truncate mr-2">{bill.orderId}</span>
                        <button 
                          className="p-1.5 rounded-full hover:bg-gray-100 flex items-center text-sm text-gray-600" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(bill.orderId).then(() => {
                              setCopiedOrderId(bill.orderId);
                              setShowCopyModal(true);
                            });
                          }}
                          title="复制订单号"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          复制
                        </button>
                      </div>
                    

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3 text-xs">

                      {bill.dueDate && (
                        <div className="flex items-center text-xs  col-span-2">
                          <CalendarOutlined className="h-3.5 w-3.5 mr-1" />
                          到账日期: <span className={`font-medium ${isUnpaid ? 'text-orange-600' : 'text-gray-800'} ml-1`}>
                            {getFullDate(bill.dueDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs ">
                        <CalendarOutlined className="h-3.5 w-3.5 mr-1" />
                        账单日期: {getFullDate(bill.date)}
                      </div>  
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                        {/* 已删除下载和分享按钮 */}
                        {isUnpaid && (
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePayBill(bill.id);
                            }}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5"
                          >
                            立即支付
                          </Button>
                        )}
                        {!isUnpaid && !isProcessing && (
                          <Button 
                            variant="ghost"
                            className="text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewBill(bill.id);
                            }}
                          >
                            查看详情
                            <RightOutlined className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-4 text-center text-xs text-gray-500">
        <p>账单记录保存期限为12个月</p>
      </div>
      
      {/* 复制成功模态框 */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-center mb-4">复制成功</h3>
            <p className="text-center text-gray-600 mb-6">
              订单编号 {copiedOrderId} 已成功复制到剪贴板
            </p>
            <div className="flex justify-center">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={() => setShowCopyModal(false)}
              >
                确定
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillsPage;