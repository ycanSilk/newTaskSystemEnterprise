'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// 定义银行列表数据
const BANKS = [
  { code: 'icbc', name: '工商银行', icon: '🏦' },
  { code: 'abc', name: '农业银行', icon: '🌾' },
  { code: 'boc', name: '中国银行', icon: '🇨🇳' },
  { code: 'ccb', name: '建设银行', icon: '🏗️' },
  { code: 'psbc', name: '邮储银行', icon: '📮' },
  { code: 'cmb', name: '招商银行', icon: '💼' },
  { code: 'cmbc', name: '民生银行', icon: '🏥' },
  { code: 'spdb', name: '浦发银行', icon: '🚣' },
  { code: 'cib', name: '兴业银行', icon: '💹' },
  { code: 'ceb', name: '光大银行', icon: '☀️' },
  { code: 'hxb', name: '华夏银行', icon: '🌏' }
];

export default function BindBankCardPage() {
  const router = useRouter();
  const [bankName, setBankName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showBankList, setShowBankList] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState(1); // 1: 填写银行卡信息, 2: 填写个人信息, 3: 绑定成功

  // 验证银行卡号的有效性（简单验证）
  const validateCardNumber = (number: string) => {
    return number.length >= 16 && number.length <= 19 && /^\d+$/.test(number);
  };

  // 验证身份证号的有效性（简单验证）
  const validateIdNumber = (number: string) => {
    return number.length === 18 && /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(number);
  };

  // 验证手机号的有效性
  const validatePhoneNumber = (number: string) => {
    return /^1[3-9]\d{9}$/.test(number);
  };

  // 发送验证码
  const sendVerificationCode = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      alert('请输入正确的手机号码');
      return;
    }

    // 模拟发送验证码
    console.log('发送验证码到：', phoneNumber);
    setCountdown(60);

    // 倒计时
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 处理银行选择
  const handleBankSelect = (bank: { code: string; name: string; icon: string }) => {
    setBankName(bank.name);
    setShowBankList(false);
  };

  // 进入下一步
  const handleNextStep = () => {
    if (step === 1) {
      // 验证第一步信息
      if (!bankName) {
        alert('请选择银行');
        return;
      }
      if (!validateCardNumber(cardNumber)) {
        alert('请输入正确的银行卡号');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // 验证第二步信息
      if (!cardHolderName.trim()) {
        alert('请输入持卡人姓名');
        return;
      }
      if (!validateIdNumber(idNumber)) {
        alert('请输入正确的身份证号码');
        return;
      }
      if (!validatePhoneNumber(phoneNumber)) {
        alert('请输入正确的手机号码');
        return;
      }
      if (!verificationCode.trim() || verificationCode.length !== 6) {
        alert('请输入正确的验证码');
        return;
      }
      // 模拟绑定银行卡
      setStep(3);
    }
  };

  // 完成绑定并返回
  const handleComplete = () => {
    // 模拟绑定成功后的操作
    router.push('/publisher/profile');
  };

  // 格式化银行卡号，每4位加空格
  const formatCardNumber = (value: string) => {
    return value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-center h-16 relative">
          <button
            onClick={() => router.back()}
            className="absolute left-4 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-medium text-gray-800">绑定银行卡</h1>
          <div className="w-6 h-6 absolute right-4"></div> {/* 占位元素保持标题居中 */}
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="px-5 py-6">
        {/* 进度指示器 - 支付宝风格 */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${step >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}>
              1
            </div>
            <span className={`text-xs mt-1 ${step >= 1 ? 'text-blue-500' : 'text-gray-500'}`}>选择银行</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}>
              2
            </div>
            <span className={`text-xs mt-1 ${step >= 2 ? 'text-blue-500' : 'text-gray-500'}`}>填写信息</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${step >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}>
              3
            </div>
            <span className={`text-xs mt-1 ${step >= 3 ? 'text-blue-500' : 'text-gray-500'}`}>完成绑定</span>
          </div>
        </div>

        {step === 1 && (
          <>
            {/* 银行选择 */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
              <h2 className="text-base font-medium text-gray-800 mb-4">选择银行</h2>
              <button
                onClick={() => setShowBankList(!showBankList)}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">{BANKS.find(b => b.name === bankName)?.icon || '💳'}</span>
                  <span className="text-gray-600">{bankName || '请选择银行'}</span>
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform ${showBankList ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 银行列表 */}
              {showBankList && (
                <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2 p-2">
                    {BANKS.map((bank) => (
                      <button
                        key={bank.code}
                        onClick={() => handleBankSelect(bank)}
                        className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${bankName === bank.name ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <span className="text-2xl mb-1">{bank.icon}</span>
                        <span className="text-xs text-gray-700">{bank.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 银行卡号 */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-medium text-gray-800 mb-4">银行卡号</h2>
              <div className="relative">
                <input
                  type="text"
                  value={formatCardNumber(cardNumber)}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s+/g, '').replace(/[^\d]/g, ''))}
                  placeholder="请输入银行卡号"
                  maxLength={19}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                请输入本人名下储蓄卡卡号，目前仅支持储蓄卡绑定
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* 持卡人信息 */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
              <h2 className="text-base font-medium text-gray-800 mb-4">持卡人信息</h2>
              
              {/* 持卡人姓名 */}
              <div className="mb-4">
                <input
                  type="text"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  placeholder="请输入持卡人姓名"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>

              {/* 身份证号 */}
              <div>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="请输入身份证号码"
                  maxLength={18}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
            </div>

            {/* 预留手机号 */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
              <h2 className="text-base font-medium text-gray-800 mb-4">银行预留手机号</h2>
              <div className="flex space-x-3">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="请输入银行预留手机号"
                  maxLength={11}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
                <button
                  onClick={sendVerificationCode}
                  disabled={countdown > 0 || !validatePhoneNumber(phoneNumber)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${countdown > 0 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
                </button>
              </div>
            </div>

            {/* 验证码 */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-medium text-gray-800 mb-4">验证码</h2>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="请输入验证码"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">绑定成功</h2>
            <p className="text-gray-600 mb-8">
              您的银行卡已成功绑定，可用于账户提现
            </p>
            <button
              onClick={handleComplete}
              className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              完成
            </button>
          </div>
        )}

        {/* 下一步按钮 */}
        {step < 3 && (
          <div className="mt-8">
            <button
              onClick={handleNextStep}
              className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              下一步
            </button>
          </div>
        )}

        {/* 安全提示 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            为保障您的资金安全，我们采用银行级加密技术<br />
            您的银行卡信息仅用于身份验证和提现
          </p>
        </div>
      </div>
    </div>
  );
}