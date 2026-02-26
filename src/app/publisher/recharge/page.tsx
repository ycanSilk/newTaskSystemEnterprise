'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AlertModal from '../../../components/ui/AlertModal';
import { LoadingOutlined } from '@ant-design/icons';
import ImageUpload from '../../../components/imagesUpload/ImageUpload';
import { RechargeWalletRequest } from '../../types/paymentWallet/rechargeWalletTypes';
import { GetWalletBalanceResponseData, GetWalletBalanceResponse, WalletInfo, Transaction } from '@/app/types/paymentWallet/getWalletBalanceTypes';



export default function PublisherFinancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recharge');
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('alipay');
  
  // 截图上传相关状态
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  

  
  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });
  // 提示框确认后的回调函数
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);
  
  // 充值记录相关状态
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // 充值档位
  const rechargeOptions = [100, 200, 300, 500, 1000, 2000];

  // 从created_at中提取日期和时间
  const extractDateTime = (createTime: string) => {
    const date = new Date(createTime);
    return {
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0].substring(0, 5)
    };
  };

  // 格式化日期显示
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

  // 获取交易图标
  const getTransactionIcon = () => {
    return {
      icon: '￥',
      color: 'text-white',
      bgColor: 'bg-yellow-500'
    };
  };

  // 处理查看交易详情
  const handleViewTransaction = (transaction: Transaction) => {
    // 将交易记录转换为URL编码的JSON字符串，作为查询参数传递
    const transactionParams = encodeURIComponent(JSON.stringify(transaction));
    router.push(`/publisher/balance/transactionDetails/${transaction.id}?data=${transactionParams}` as any);
  };

  // 获取充值记录数据
  const fetchRechargeRecords = async () => {
    try {
      setRecordsLoading(true);
      setRecordsError(null);
      
      // 调用后端API获取交易记录，只传递page参数
      const response = await fetch(`/api/paymentWallet/getWalletBalance?page=${currentPage}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GetWalletBalanceResponse = await response.json();
      if (!data.success || !data.data) {
        throw new Error(data.message || '获取交易记录失败');
      }
      
      // 计算7天前的日期
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // 按创建时间倒序排序，只保留7天以内且related_type为recharge的记录
      const sortedTransactions = data.data.transactions
        // 只保留最近7天的记录
        .filter(transaction => {
          const transactionDate = new Date(transaction.created_at);
          return transactionDate >= sevenDaysAgo && transaction.related_type === 'recharge';
        })
        // 按创建时间倒序排序
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setTransactions(sortedTransactions);
      
      // 更新分页信息
      if (data.data.pagination) {
        setTotalRecords(data.data.pagination.total || 0);
        setTotalPages(data.data.pagination.total_pages || 1);
      }
    } catch (err) {
      setRecordsError(err instanceof Error ? err.message : '获取交易记录失败');
      console.error('获取交易记录失败:', err);
    } finally {
      setRecordsLoading(false);
    }
  };

  // 当页码或标签页变化时，重新获取数据
  useEffect(() => {
    if (activeTab === 'records') {
      fetchRechargeRecords();
    }
  }, [currentPage, activeTab]);

  // 当activeTab变化时，重置当前页码到第一页
  useEffect(() => {
    if (activeTab === 'records') {
      setCurrentPage(1);
    }
  }, [activeTab]);

  // 显示通用提示框
  const showAlert = (title: string, message: string, icon: string, onConfirmCallback?: () => void) => {
    setAlertConfig({ title, message, icon });
    setAlertCallback(onConfirmCallback || null);
    setShowAlertModal(true);
  };

  // 处理提示框按钮点击
  const handleAlertButtonClick = () => {
    setShowAlertModal(false);
    // 如果有回调函数，则执行它
    if (alertCallback) {
      setTimeout(() => {
        alertCallback();
        setAlertCallback(null);
      }, 300); // 等待动画完成
    }
  };

  // 验证金额 - 仅在提交时调用
  const validateAmount = (value: string) => {
    if (!value) return { isValid: false, message: '请输入充值金额' };
    
    const amount = Number(value);
    if (isNaN(amount)) return { isValid: false, message: '请输入有效的数字' };
    if (amount <= 0) return { isValid: false, message: '充值金额必须大于0' };
    if (amount < 10) return { isValid: false, message: '充值金额不能小于10元' };
    if (amount % 1 !== 0) return { isValid: false, message: '充值金额必须是整数' };
    if (amount > 2000) return { isValid: false, message: '单次充值金额不能超过2000元' };
    
    return { isValid: true, message: '' };
  };

  // 处理图片上传变化
  const handleImagesChange = (images: File[], urls: string[]) => {
    setScreenshotFiles(images);
    setScreenshotUrls(urls);
  };

  // 处理充值提交
  const handleRechargeSubmit = async () => {
    console.log('=== 开始处理充值提交 ===');
    try {
      console.log('1. 设置loading为true');
      setLoading(true);
      
      // 验证金额
      console.log('2. 验证金额');
      const amountValidation = validateAmount(rechargeAmount);
      if (!amountValidation.isValid) {
        console.log('2.1 金额验证失败:', amountValidation.message);
        showAlert('提示', amountValidation.message, '⚠️');
        return;
      }

      console.log('3. 验证支付方式');
      if (!selectedPaymentMethod) {
        console.log('3.1 支付方式验证失败');
        showAlert('提示', '请选择支付方式', '⚠️');
        return;
      }

      console.log('4. 验证截图');
      if (screenshotFiles.length === 0) {
        console.log('4.1 截图验证失败');
        showAlert('提示', '请上传支付截图', '⚠️');
        return;
      }
      
      const amount = parseFloat(rechargeAmount);
      console.log('5. 构建请求数据:', { amount, selectedPaymentMethod, hasScreenshot: screenshotFiles.length > 0 });
      
      // 构建充值请求数据
      const rechargeData: RechargeWalletRequest = {
        amount: amount,
        payment_method: selectedPaymentMethod,
        payment_voucher: screenshotUrls[0] || '',
      };
      
      console.log('6. 调用充值API');
      // 调用充值API中间件
      const response = await fetch('/api/paymentWallet/rechargeWallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rechargeData),
      });
      
      console.log('7. 解析响应数据');
      // 解析响应数据，无论状态码如何
      const result = await response.json();
      
      console.log('8. 充值响应:', result);
      
      // 添加小延迟确保操作完成
      console.log('9. 设置100ms延迟，确保操作完成后再显示提示');
      setTimeout(() => {
        if (result.code === 0) {
          console.log('10. 充值成功处理流程');
          console.log('10.1 显示成功提示');
          showAlert('提交成功', '充值申请已提交，请等待管理员审核', '✅', () => {
            console.log('11. 成功提示确认后，重置表单状态');
            // 重置表单状态
            setRechargeAmount('');
            setSelectedPaymentMethod('alipay');
            setScreenshotFiles([]);
            setScreenshotUrls([]);
            // 刷新页面 - 使用setTimeout确保在所有组件渲染完成后执行
            console.log('12. 刷新页面');
            setTimeout(() => {
              // 切换到充值记录页面
              setActiveTab('records');
              router.refresh();
            }, 100);
          });
        } else {
          console.log('13. 错误处理流程');
          const errorTitle = result.code === 500 ? '支付密码错误' : '充值失败';
          const errorMessage = result.code === 500 ? '请输入正确的支付密码' : (result.message || '充值失败，请稍后重试');
          console.log('13.1 显示错误提示:', errorTitle, errorMessage);
          showAlert(errorTitle, errorMessage, '❌');
        }
      }, 100);
    } catch (error) {
      console.error('16. 捕获到异常:', error);
      // 网络错误或其他异常
      const errorMessage = error instanceof Error ? error.message : '充值失败，请检查网络连接';
      console.log('16.1 显示异常提示');
      showAlert('错误', `${errorMessage}，请稍后重试`, '❌');
    } finally {
      console.log('17. 最终设置loading为false');
      setLoading(false);
      console.log('=== 充值提交处理结束 ===');
    }
  };

  // 点击提交充值按钮，直接提交充值
  const handleSubmitRecharge = () => {
    // 先验证基本信息
    const amountValidation = validateAmount(rechargeAmount);
    if (!amountValidation.isValid) {
      showAlert('提示', amountValidation.message, '⚠️');
      return;
    }

    if (!selectedPaymentMethod) {
      showAlert('提示', '请选择支付方式', '⚠️');
      return;
    }

    if (screenshotFiles.length === 0) {
      showAlert('提示', '请上传支付截图', '⚠️');
      return;
    }
    
    // 直接调用充值提交函数
    handleRechargeSubmit();
  };

  return (
    <div className="pb-20">
      {/* 功能选择 */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab('recharge')}
          className={`py-3 px-4 rounded font-medium transition-colors ${activeTab === 'recharge' ? 'bg-green-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'}`}
        >
          充值
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`py-3 px-4 rounded font-medium transition-colors ${activeTab === 'records' ? 'bg-green-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'}`}
        >
          充值记录
        </button>
      </div>

      {activeTab === 'recharge' && (
        <>
          {/* 充值金额输入 */}
          <div className="mx-4 mt-2">
            <div className="bg-white rounded-lg py-2 px-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2">充值金额</h3>
              <div className="mb-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                  <input
                    type="number"
                    placeholder="请输入充值金额"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  最低充值：¥10 | 必须为整数 | 单次最高：¥2000
                </div>
              </div>

              {/* 快捷充值 */}
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">快捷选择</h4>
                <div className="grid grid-cols-3 gap-2">
                  {rechargeOptions.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRechargeAmount(amount.toString())}
                      className={`py-2 px-3 border rounded text-sm transition-all duration-300 ${rechargeAmount === amount.toString() ? 'bg-blue-500 text-white border-blue-600' : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'}`}
                    >
                      ¥{amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* 支付方式 */}
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">支付方式</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="payMethod" 
                      className="mr-2" 
                      checked={selectedPaymentMethod === 'alipay'} 
                      onChange={() => setSelectedPaymentMethod('alipay')}
                    />
                    <span className="text-sm">💙 支付宝</span>
                  </label>
                 {/**  
                  * <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="payMethod" 
                      className="mr-2" 
                      checked={selectedPaymentMethod === 'usdt'} 
                      onChange={() => setSelectedPaymentMethod('usdt')}
                    />
                    <span className="text-sm">🟢 USDT (TRC20)</span>
                  </label>
                  */}
                </div>
              </div>

              {/* 截图上传组件 */}
              <div className="mb-2">
                <ImageUpload
                  title="上传支付截图"
                  maxCount={1}
                  columns={1}
                  onImagesChange={handleImagesChange}
                  savePath="recharge"
                />
              </div>
              
              
              {/* 支付信息展示 */}
              <div className="mb-2 flex flex-col items-center">
                {selectedPaymentMethod === 'alipay' ? (
                  <>
                    <div className="bg-white p-2 border border-gray-200 rounded-lg mb-2">
                      <div className="w-40 h-40 bg-gray-50 flex items-center justify-center">
                        <img 
                          src="/images/Alipay.png" 
                          alt="支付宝二维码" 
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">请使用支付宝扫描二维码完成支付;  渊（备注）</p>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-4 border border-gray-200 rounded-lg mb-2">
                      <div className="w-48 h-48 bg-gray-50 flex items-center justify-center">
                        {/* USDT二维码 */}
                        <img 
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192'%3E%3Crect width='192' height='192' fill='%23ffffff'/%3E%3Crect x='16' y='16' width='48' height='48' fill='%2326A17B'/%3E%3Crect x='16' y='128' width='48' height='48' fill='%2326A17B'/%3E%3Crect x='128' y='16' width='48' height='48' fill='%2326A17B'/%3E%3Crect x='96' y='96' width='32' height='32' fill='%2326A17B'/%3E%3Cpath d='M128 80v64H80V80h48m8-8H72v80h64V72z' fill='%2326A17B'/%3E%3C/svg%3E" 
                          alt="USDT二维码" 
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="w-full max-w-sm">
                      <div className="bg-gray-50 p-3 rounded-lg mb-2">
                        <p className="text-xs text-gray-500 mb-1">USDT (TRC20) 地址</p>
                        <p className="text-sm font-medium text-gray-800 break-all">
                          TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX<br/>
                          <span className="text-xs text-green-500">请复制地址进行转账</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">充值金额 (¥):</span>
                        <span className="text-sm font-medium">{rechargeAmount || '0.00'}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">需支付 USDT:</span>
                        <span className="text-sm font-medium text-green-600">{(parseFloat(rechargeAmount || '0') / 7.2).toFixed(4)}</span>
                      </div>
                      <p className="text-xs text-orange-500">请确保在15分钟内完成转账，超时订单将自动取消</p>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleSubmitRecharge}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingOutlined className="animate-spin mr-2" />
                    提交中...
                  </div>
                ) : (
                  '充值'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'records' && (
        <>
          {/* 交易记录 - 支付宝账单风格 */}
          <div className="mx-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-800">充值记录</h3>
              </div>
              
              {/* 记录内容 */}
              <div>
                {recordsLoading ? (
                  // 加载状态
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs  animate-pulse">加载中...</div>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center py-3 animate-pulse">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 mr-3" />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <div className="h-4 bg-gray-200 rounded w-1/3" />
                              <div className="h-4 bg-gray-200 rounded w-1/6" />
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="h-3 bg-gray-200 rounded w-1/4" />
                              <div className="h-3 bg-gray-200 rounded w-1/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : recordsError ? (
                  // 错误状态
                  <div className="py-12 px-4 text-center">
                    <div className="text-5xl mb-2">⚠️</div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">获取失败</h3>
                    <p className=" text-sm mb-2">{recordsError}</p>
                    <button
                      onClick={fetchRechargeRecords}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      重试
                    </button>
                  </div>
                ) : transactions.length === 0 ? (
                  // 空状态
                  <div className="py-12 px-4 text-center">
                    <div className="text-5xl mb-2">📝</div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">暂无充值记录</h3>
                    <p className=" text-sm mb-2">您还没有任何充值记录</p>
                  </div>
                ) : (
                  // 交易记录处理
                  <div>
                    {/* 显示交易记录总数信息 */}
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                      <div className="text-xs ">
                        共显示 {transactions.length} 条记录
                      </div>
                    </div>

                    {/* 交易记录列表 */}
                    {transactions.map((transaction) => {
                      const iconInfo = getTransactionIcon();
                      // 根据type字段判断交易类型
                      const isIncome = transaction.type === 1;
                      const { date, time } = extractDateTime(transaction.created_at);

                      return (
                        <div
                          key={transaction.id}
                          className="px-4 py-3 border-b border-gray-50 hover:bg-blue-50 flex items-center transition-colors duration-200 w-full cursor-pointer"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${iconInfo.bgColor} mr-3 text-lg font-bold flex-shrink-0`}>
                            <span className={iconInfo.color}>{iconInfo.icon}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1 w-full">
                              <h3 className="font-medium text-gray-900 truncate flex-1 mr-3">
                                {(transaction.remark || transaction.type_text).slice(0, 8)}{(transaction.remark || transaction.type_text).length > 8 ? '...' : ''}
                              </h3>
                              <span className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'} flex-shrink-0 whitespace-nowrap`}>
                                {isIncome ? '+' : '-'}{parseFloat(transaction.amount).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center w-full">
                              <div className="text-xs flex-shrink-0 whitespace-nowrap">
                                {formatDate(date)} {time}
                              </div>
                              <div className="text-xs flex-shrink-0 whitespace-nowrap">
                                余额: {parseFloat(transaction.after_balance).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* 分页控件 - 始终显示 */}
                <div className="px-4 py-3 border-t border-gray-100 flex flex-col items-center space-y-3">
                  {/* 分页控制 */}
                  <div className="flex items-center space-x-1">
                    {/* 上一页按钮 */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      上一页
                    </button>
                    
                    {/* 页码导航 */}
                    <div className="flex items-center space-x-1">
                      {/* 第一页 */}
                      {currentPage > 3 && (
                        <button
                          onClick={() => setCurrentPage(1)}
                          className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                          1
                        </button>
                      )}
                      
                      {/* 省略号 */}
                      {currentPage > 4 && (
                        <span className="px-3 py-1 text-gray-400">...</span>
                      )}
                      
                      {/* 前一页 */}
                      {currentPage > 1 && (
                        <button
                          onClick={() => setCurrentPage(prev => prev - 1)}
                          className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                          {currentPage - 1}
                        </button>
                      )}
                      
                      {/* 当前页 */}
                      <button
                        className="px-3 py-1 bg-blue-100 border border-blue-300 rounded text-sm font-medium text-blue-600"
                        disabled
                      >
                        {currentPage}
                      </button>
                      
                      {/* 后一页 */}
                      {currentPage < totalPages && (
                        <button
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                          {currentPage + 1}
                        </button>
                      )}
                      
                      {/* 省略号 */}
                      {currentPage < totalPages - 3 && (
                        <span className="px-3 py-1 text-gray-400">...</span>
                      )}
                      
                      {/* 最后一页 */}
                      {currentPage < totalPages - 2 && (
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                          {totalPages}
                        </button>
                      )}
                    </div>
                    
                    {/* 下一页按钮 */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 底部提示 */}
          <div className="px-4 py-4 text-center text-xs text-gray-500">
            <p>只显示近7天的充值记录</p>
          </div>
        </>
      )}
      
      {/* 通用提示模态框 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        onClose={() => setShowAlertModal(false)}
        onButtonClick={handleAlertButtonClick}
      />
      

    </div>
  );
}