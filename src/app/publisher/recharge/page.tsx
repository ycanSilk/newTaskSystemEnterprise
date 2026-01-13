'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AlertModal from '../../../components/ui/AlertModal';
import { LoadingOutlined } from '@ant-design/icons';
import ImageUpload from '../../../components/imagesUpload/ImageUpload';
import { RechargeWalletRequest } from '../../types/paymentWallet/rechargeWalletTypes';

// 支付密码模态框组件
const PaymentPasswordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  loading: boolean;
}> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = () => {
    if (!password) {
      setPasswordError('请输入支付密码');
      return;
    }
    if (password.length !== 6) {
      setPasswordError('支付密码必须为6位数字');
      return;
    }
    if (!/^\d+$/.test(password)) {
      setPasswordError('支付密码必须为数字');
      return;
    }
    setPasswordError('');
    onSubmit(password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 z-50">
        <h3 className="text-lg font-bold text-gray-800 mb-4">输入支付密码</h3>
        <p className="text-sm text-gray-600 mb-4">请输入您的6位数字支付密码以确认充值</p>
        
        <div className="mb-4">
          <input
            type="password"
            placeholder="请输入6位支付密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
            maxLength={6}
            autoFocus
          />
          {passwordError && (
            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingOutlined className="animate-spin mr-2" />
                提交中...
              </div>
            ) : (
              '确认'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PublisherFinancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recharge');
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('alipay');
  
  // 截图上传相关状态
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  
  // 支付密码模态框状态
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });
  // 提示框确认后的回调函数
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);

  // 充值档位
  const rechargeOptions = [100, 200, 300, 500, 1000, 2000];

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
    if (amount < 100) return { isValid: false, message: '最低充值金额为100元' };
    if (amount % 100 !== 0) return { isValid: false, message: '充值金额必须是100的倍数' };
    if (amount > 100000) return { isValid: false, message: '单次充值金额不能超过100000元' };
    
    return { isValid: true, message: '' };
  };

  // 处理图片上传变化
  const handleImagesChange = (images: File[], urls: string[]) => {
    setScreenshotFiles(images);
    setScreenshotUrls(urls);
  };

  // 处理充值提交
  const handleRechargeSubmit = async (password: string) => {
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
        console.log('2.2 关闭密码模态框');
        setShowPasswordModal(false);
        return;
      }

      console.log('3. 验证支付方式');
      if (!selectedPaymentMethod) {
        console.log('3.1 支付方式验证失败');
        showAlert('提示', '请选择支付方式', '⚠️');
        console.log('3.2 关闭密码模态框');
        setShowPasswordModal(false);
        return;
      }

      console.log('4. 验证截图');
      if (screenshotFiles.length === 0) {
        console.log('4.1 截图验证失败');
        showAlert('提示', '请上传支付截图', '⚠️');
        console.log('4.2 关闭密码模态框');
        setShowPasswordModal(false);
        return;
      }
      
      const amount = parseFloat(rechargeAmount);
      console.log('5. 构建请求数据:', { amount, selectedPaymentMethod, hasScreenshot: screenshotFiles.length > 0 });
      
      // 构建充值请求数据
      const rechargeData: RechargeWalletRequest = {
        amount: amount,
        payment_method: selectedPaymentMethod,
        payment_voucher: screenshotUrls[0] || '',
        pswd: password
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
      // 无论成功还是失败，都先关闭密码模态框
      console.log('9. 关闭密码模态框');
      setShowPasswordModal(false);
      console.log('9.1 模态框状态设置为false');
      
      // 添加小延迟确保模态框完全关闭
      console.log('9.2 设置100ms延迟，确保模态框关闭后再显示提示');
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
      console.log('16.2 关闭密码模态框');
      setShowPasswordModal(false);
    } finally {
      console.log('17. 最终设置loading为false');
      setLoading(false);
      console.log('=== 充值提交处理结束 ===');
    }
  };

  // 点击提交充值按钮，显示密码模态框
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
    
    // 显示支付密码模态框
    setShowPasswordModal(true);
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
                <ImageUpload
                  title="上传支付截图"
                  maxCount={1}
                  columns={1}
                  onImagesChange={handleImagesChange}
                  savePath="recharge"
                />
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
                  '提交充值'
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
              <div className="overflow-y-auto">
                <div className="p-8 text-center text-gray-500">充值记录功能正在开发中...</div>
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
        onClose={() => setShowAlertModal(false)}
        onButtonClick={handleAlertButtonClick}
      />
      
      {/* 支付密码模态框 */}
      <PaymentPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleRechargeSubmit}
        loading={loading}
      />
    </div>
  );
}