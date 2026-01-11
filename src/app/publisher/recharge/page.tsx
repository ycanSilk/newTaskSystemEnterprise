'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AlertModal from '../../../components/ui/AlertModal';
import { WalletOutlined, CreditCardOutlined, DollarOutlined, ShoppingOutlined, CoffeeOutlined, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';

// 定义类型接口
export interface BalanceData {
  balance: number;
}

export default function PublisherFinancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recharge');
  const [rechargeAmount, setRechargeAmount] = useState('');
  // 初始化余额数据，确保符合BalanceData类型
  const [balance, setBalance] = useState<BalanceData>({
    balance: 0
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('alipay');
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [monthlyTransactions, setMonthlyTransactions] = useState<Record<string, any[]>>({});
  // 截图上传相关状态
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [screenshotPath, setScreenshotPath] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });
  // 提示框确认后的回调函数
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);
  
  // 处理文件上传预览
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 文件类型验证
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      showAlert('错误', '仅支持 JPG、PNG 格式的图片', '❌');
      return;
    }
    
    // 文件大小验证（5MB限制）
    if (file.size > 5 * 1024 * 1024) {
      showAlert('错误', '文件大小不能超过 5MB', '❌');
      return;
    }
    
    // 创建预览URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setScreenshotFile(file);
    showAlert('成功', '截图上传成功', '✅');
  };
  
  // 验证金额 - 仅在提交时调用
  const validateAmount = (value: string) => {
    if (!value) return { isValid: false, message: '请输入充值金额' };
    
    const amount = Number(value);
    if (isNaN(amount)) return { isValid: false, message: '请输入有效的数字' };
    if (amount <= 0) return { isValid: false, message: '充值金额必须大于0' };
    if (amount < 100) return { isValid: false, message: '最低充值金额为100元' };
    if (amount % 100 !== 0) return { isValid: false, message: '充值金额必须是100的倍数' };
    if (amount > 100000) return { isValid: false, message: '单次充值金额不能超过100000元' };
    
    return { isValid: true, message: '' };
  };
  
  // 上传文件到服务器
  const uploadFile = async (file: File): Promise<string> => {
    setUploadLoading(true);
    try {
      // 再次验证文件，确保安全
      if (!file || file.size === 0) {
        throw new Error('文件为空');
      }
      
      // 生成带日期时间的文件名
      const now = new Date();
      const timestamp = now.getFullYear() + 
                       String(now.getMonth() + 1).padStart(2, '0') +
                       String(now.getDate()).padStart(2, '0') +
                       String(now.getHours()).padStart(2, '0') +
                       String(now.getMinutes()).padStart(2, '0') +
                       String(now.getSeconds()).padStart(2, '0');
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `recharge_${timestamp}.${extension}`;
      
      // 由于是模拟环境，我们直接返回文件名作为路径
      // 实际项目中应该调用文件上传API
      const filePath = `/uploads/rechargeImages/${fileName}`;
      await new Promise(resolve => setTimeout(resolve, 500));
      return filePath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '文件上传失败';

      showAlert('上传失败', errorMessage, '❌');
      throw error;
    } finally {
      setUploadLoading(false);
    }
  };
  
  // 添加拖拽上传支持
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // 直接处理文件，不创建模拟事件
      setScreenshotFile(file);
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
        showAlert('成功', '截图上传成功', '✅');
      };
      reader.readAsDataURL(file);
      
      // 文件类型验证
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        showAlert('错误', '仅支持 JPG、PNG 格式的图片', '❌');
        setScreenshotFile(null);
        return;
      }
      
      // 文件大小验证（5MB限制）
      if (file.size > 5 * 1024 * 1024) {
        showAlert('错误', '文件大小不能超过 5MB', '❌');
        setScreenshotFile(null);
        return;
      }
    }
  };

  // 充值档位
  const rechargeOptions = [100, 200, 300, 500, 1000, 2000, ];

  // 显示通用提示框
  const showAlert = (title: string, message: string, icon: string, onConfirmCallback?: () => void) => {
    setAlertConfig({ title, message, icon });
    setAlertCallback(onConfirmCallback || null);
    setShowAlertModal(true);
  };

  // 处理提示框关闭
  const handleAlertClose = () => {
    setShowAlertModal(false);
    // 如果有回调函数，则执行它
    if (alertCallback) {
      setTimeout(() => {
        alertCallback();
        setAlertCallback(null);
      }, 300); // 等待动画完成
    }
  };



  // 获取财务数据 - 调用API
  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/walletmanagement/transactionrecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          pageSize: 10
        }),
      });
      
      const result = await response.json();

      if (result.success) {
         // 兼容不同API响应结构，从data.list、data或list中获取交易记录数组，并确保是数组类型
         const rawTransactions = result.data?.list || result.data || result.list || [];
         const allTransactions = Array.isArray(rawTransactions) ? rawTransactions : [];
         // 筛选出transactionType或type为RECHARGE的记录
         const rechargeTransactions = allTransactions.filter((record: any) => record.transactionType === 'RECHARGE' || record.type === 'RECHARGE');
          


          
         // 转换API字段为UI使用的字段
         const convertedTransactions = rechargeTransactions.map((record: any) => ({
           id: record.orderNo || `txn${Date.now()}`,
           userId: record.userId || '',
           type: record.transactionType || record.type || 'RECHARGE',
           amount: parseFloat(record.amount) || 0,
           time: record.createTime || record.time || new Date().toISOString(),
           method: record.channel || record.method || 'ALIPAY',
           balanceAfter: parseFloat(record.balanceAfter) || 0,
           status: record.status || 'RECHARGE'
         }));
          
         // 按月份分组交易记录
         const monthlyData: Record<string, any[]> = {};
         convertedTransactions.forEach((transaction: any) => {
           if (transaction.time) {
             const date = new Date(transaction.time);
             const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
             if (!monthlyData[monthKey]) {
               monthlyData[monthKey] = [];
             }
             monthlyData[monthKey].push(transaction);
           }
         });
          
         // 按月份降序排列
         const sortedMonthlyData: Record<string, any[]> = {};
         Object.keys(monthlyData).sort((a, b) => {
           const [yearA, monthA] = a.match(/(\d+)年(\d+)月/)!.slice(1).map(Number);
           const [yearB, monthB] = b.match(/(\d+)年(\d+)月/)!.slice(1).map(Number);
           return (yearB * 12 + monthB) - (yearA * 12 + monthA);
         }).forEach(key => {
           sortedMonthlyData[key] = monthlyData[key];
         });
          
         setTransactions(convertedTransactions);
         setMonthlyTransactions(sortedMonthlyData);
        
        // 假设API也返回余额数据
        if (result.balance) {
          setBalance({ balance: result.balance });
        }
        } else {
          showAlert('错误', '加载交易记录失败', '❌');
        } 
        } catch (error) {
    
          showAlert('错误', '加载数据失败', '❌');
        } finally {
          setLoading(false);
        }
      };
  // 处理充值 - 调用API
  const handleRecharge = async () => {
    try {
      // 表单验证
      const amountValidation = validateAmount(rechargeAmount);
      if (!amountValidation.isValid) {
        showAlert('提示', amountValidation.message, '⚠️');
        return;
      }

      if (!selectedPaymentMethod) {
        showAlert('提示', '请选择支付方式', '⚠️');
        return;
      }

      if (!screenshotFile) {
        showAlert('提示', '请上传支付截图', '⚠️');
        return;
      }
      
     
      
      const amount = parseFloat(rechargeAmount);
      setLoading(true);
      
      // 上传截图文件
      const screenshotPath = await uploadFile(screenshotFile);
      setScreenshotPath(screenshotPath);
      
      // 调用充值API
      const response = await fetch('/api/walletmanagement/usersrecharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          channel: selectedPaymentMethod === 'alipay' ? 'ALIPAY' : 'USDT',
          remark: screenshotPath
        }),
      });    

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();    
      if (result.success || result.code === 0) {
        showAlert('提交成功','等待审核', '✅');
        // 重置表单状态
        setRechargeAmount('');
        setSelectedPaymentMethod('alipay');
        setScreenshotFile(null);
        setScreenshotPreview('');
        setScreenshotPath('');
        // 重新加载交易记录
        fetchFinanceData();
        
        setRechargeSuccess(true);
        // 3秒后隐藏成功提示
        setTimeout(() => {
          setRechargeSuccess(false);
        }, 3000);
     
      } else {
        showAlert('充值失败', result.message || '充值失败，请稍后重试', '❌');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '充值失败';

      showAlert('错误', `${errorMessage}，请稍后重试`, '❌');
    } finally {
      setLoading(false);
      // 无论充值成功还是失败，都刷新页面
      router.refresh();
    }
  };



  // 初始加载数据
  useEffect(() => {
    const loadData = async () => {
      await fetchFinanceData();
    };
    loadData();
  }, []);

  // 获取交易图标 - 只显示"￥"符号
  const getTransactionIcon = (type: string, expenseType?: string) => {
    return '￥';
  };
  
  // 跳转到交易详情页
  const handleTransactionClick = (transaction: any) => {
    try {
      // 直接跳转到详情页，详情页将通过API获取数据
      router.push(`/publisher/recharge/rechargeDetail/${transaction.id}`);
    } catch (error) {
      // 静默处理错误，不输出日志
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'recharge': return 'text-green-600';
      default: return 'text-green-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '成功';
      case 'pending': return '处理中';
      case 'failed': return '失败';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="pb-20">
      {/* 功能选择 */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab('recharge')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            activeTab === 'recharge' ? 'bg-green-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
          }`}
        >
          充值
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            activeTab === 'records' ? 'bg-green-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
          }`}
        >
          充值记录
        </button>
      </div>

      {activeTab === 'recharge' && (
        <>
          {/* 充值金额输入 */}
          <div className="mx-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">充值金额</h3>
              <div className="mb-4">
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
                  最低充值：¥100 | 必须为100的倍数 | 单次最高：¥2000
                </div>
              </div>

              {/* 快捷充值 */}
              <div className="mb-4">
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
              <div className="mb-4">
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
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="payMethod" 
                      className="mr-2" 
                      checked={selectedPaymentMethod === 'usdt'} 
                      onChange={() => setSelectedPaymentMethod('usdt')}
                    />
                    <span className="text-sm">🟢 USDT (TRC20)</span>
                  </label>
                </div>
              </div>

              {/* 截图上传组件 */}
              <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">上传支付截图</h4>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${uploadLoading ? 'border-yellow-500 bg-yellow-50' : screenshotPreview ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500'}`}
                    onClick={() => document.getElementById('screenshot-upload')?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {uploadLoading ? (
                      <div className="py-8">
                        <LoadingOutlined className="text-yellow-500 text-3xl mb-2 animate-spin" />
                        <p className="text-sm text-gray-600">上传中，请稍候...</p>
                      </div>
                    ) : screenshotPreview ? (
                      <div className="relative">
                        <img 
                          src={screenshotPreview} 
                          alt="支付截图" 
                          className="max-w-full h-40 object-contain rounded-md"
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setScreenshotFile(null);
                            setScreenshotPreview('');
                            setScreenshotPath('');
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition-colors"
                          aria-label="删除截图"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <InfoCircleOutlined className="text-gray-400 text-3xl mb-2" />
                        <p className="text-sm text-gray-500">点击或拖拽文件到此处上传</p>
                        <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式，大小不超过 5MB</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      id="screenshot-upload" 
                      accept="image/jpeg, image/png"
                      className="hidden"
                      onChange={(e) => handleFileChange(e)}
                    />
                  </div>
                </div>
              
              {/* 支付信息展示 */}
              <div className="mb-4 flex flex-col items-center">
                {selectedPaymentMethod === 'alipay' ? (
                  <>
                    <div className="bg-white p-2 border border-gray-200 rounded-lg mb-3">
                      <div className="w-48 h-48 bg-gray-50 flex items-center justify-center">
                        <img 
                          src="/images/Alipay.png" 
                          alt="支付宝二维码" 
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">请使用支付宝扫描二维码完成支付</p>
                    <p className="text-sm text-gray-500">渊（备注）</p>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-4 border border-gray-200 rounded-lg mb-3">
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
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">需支付 USDT:</span>
                        <span className="text-sm font-medium text-green-600">{(parseFloat(rechargeAmount || '0') / 7.2).toFixed(4)}</span>
                      </div>
                      <p className="text-xs text-orange-500">请确保在15分钟内完成转账，超时订单将自动取消</p>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleRecharge}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
              >
                {loading ? '处理中...' : '提交充值'}
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
              <div className="overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">加载中...</div>
                ) : transactions.length > 0 ? (
                  <>
                    {/* 按月份分组显示交易记录，默认显示10条 */}
                    {Object.entries(monthlyTransactions).map(([month, records], monthIndex) => {
                      // 默认只显示前10条记录
                      let displayRecords = records;
                      if (monthIndex === 0) {
                        // 只在第一个月份限制显示数量
                        displayRecords = records.slice(0, 10);
                      }
                      return (
                        <div key={month}>            
                          {/* 交易记录列表 */}
                          {displayRecords.map((record) => (
                            <div 
                              key={record.id} 
                              className="border-b last:border-0"
                            >
                              <button
                                onClick={() => handleTransactionClick(record)}
                                className="w-full p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
                              >
                                {/* 左侧：图标、标题、描述 */}
                                <div className="flex items-center space-x-3">
                                  <div className="rounded-full items-center  w-10 h-10 bg-orange-400 flex items-center justify-center">
                                    <div className="flex items-center justify-center text-white text-2xl">
                                      {getTransactionIcon(record.type, record.expenseType)}
                                    </div>
                                  </div>
                                  <div className="text-left">
                                    <div className="">
                                      {record.type === 'RECHARGE' ? '充值' : ''}
                                    </div>
                                    <div className="">
                                      {new Date(record.time).toLocaleDateString('zh-CN', { 
                                        year: 'numeric',
                                        month: '2-digit', 
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }).replace(/\//g, '-')}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* 右侧：金额和余额 */}
                                <div className="text-right ">
                                  <div className={` ${getTransactionColor(record.type)} text-green-600`}>
                                    {record.amount > 0 ? '+' : ''}{Math.abs(record.amount).toFixed(2)}
                                  </div>
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-500">暂无充值记录</div>
                )}
              </div>
              
              {/* 查看更多按钮 - 支付宝风格 */}
              <div className="border-t">
                <button
                  onClick={() => router.push('/publisher/recharge/rechargeList')}
                  className="w-full p-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <span className="text-sm text-blue-500">查看全部充值记录</span>
                  <svg className="w-4 h-4 ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* 通用提示模态框 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        onClose={handleAlertClose}
      />
    </div>
  );
}