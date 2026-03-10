'use client';

import React from 'react';
import { CloseOutlined } from '@ant-design/icons';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[80vh] overflow-y-auto mx-4">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
            租凭保障 · 免责声明
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <CloseOutlined className="text-xl" />
          </button>
        </div>
        <div className="p-3 space-y-3">
          {/* 核心免责声明卡片 (第一条)  */}
          <div className="bg-amber-50/70 border-l-4 border-amber-400 p-5 rounded-xl shadow-sm">
            <div className="flex items-start gap-4">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">1. 平台免责声明</h3>
                <p className="text-gray-700 text-sm leading-relaxed mt-1">
                  租赁双方需严格遵守中华人民共和国法律法规进行正常租赁活动，严禁将账号用于任何违法乱纪、欺诈、赌博、洗钱等非法行为。  
                  平台仅提供信息发布与担保交易技术支持，不参与实际账号使用，不对租赁期间产生的任何违规封禁、纠纷或损失承担直接责任。  
                  使用本平台即视为完全同意本条款。
                </p>
              </div>
            </div>
          </div>

          {/* 费用分配规则 (第二条) 可视化卡片 */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-3 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <h3 className="font-semibold text-lg">2. 费用分配原则 (公平交易)</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">租赁达成后，承租方一次性缴纳<strong className="text-blue-700"> 100% 租赁费用</strong>，资金按以下比例自动分配：</p>
            
            {/* 百分比条可视化 (近似比例) */}
            <div className="w-full bg-gray-100 rounded-full h-5 mb-3 flex overflow-hidden shadow-inner border border-gray-200">
              <div className="bg-green-500 h-full flex items-center justify-center text-xs font-medium text-white" style={{ width: '70%' }}>70%</div>
              <div className="bg-amber-400 h-full flex items-center justify-center text-xs font-medium text-white" style={{ width: '10%' }}>10%</div>
              <div className="bg-blue-500 h-full flex items-center justify-center text-xs font-medium text-white" style={{ width: '20%' }}>20%</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <span className="text-green-700 font-bold block text-lg">70%</span>
                <span className="font-medium">出租人应得</span>
                <p className="text-xs text-gray-500 mt-1">账号提供方收益</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <span className="text-amber-700 font-bold block text-lg">10%</span>
                <span className="font-medium">团长级导师费</span>
                <p className="text-xs text-gray-500 mt-1">推荐/管理奖励</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <span className="text-blue-700 font-bold block text-lg">20%</span>
                <span className="font-medium">平台服务费</span>
                <p className="text-xs text-gray-500 mt-1">担保交易/技术支持</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 italic">* 平台收取20%费用用于保障交易安全、服务器及风控成本。</p>
          </div>

          {/* 支付与冻结机制 (第三条) */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-700 mb-3">
              <h3 className="font-semibold text-lg">3. 租金支付与解冻</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed pl-1">
              <p className="flex gap-3 items-start">承租方在租赁生效前须支付100%全额租金款项由平台冻结保管。</p>
              <p className="flex gap-3 items-start">当订单租期完结后，租金解冻至出租方提现账户。</p>
            </div>
            {/* 简单示意图标 */}
            <div className="mt-4 flex flex-wrap gap-3 justify-around items-center bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> 承租方支付100%</span>
              <span className="text-indigo-300 text-lg">→</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-full"></span> 平台冻结</span>
              <span className="text-indigo-300 text-lg">→</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> 解冻给出租方</span>
            </div>
          </div>

          {/* 提前完成/终止租赁 (第四条) 两个场景 */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 mb-3">
              <h3 className="font-semibold text-lg">4. 提前终止租赁情形</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* 情形① 账号被封 */}
              <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/40">
                <div className="flex items-center gap-2 text-rose-700 font-medium mb-2">
                账号封禁
                </div>
                <p className="text-xs text-gray-600 mb-2">出租方须协助解封；若最终无法解封：</p>
                <ul className="text-xs space-y-1 text-gray-700 list-disc pl-5">
                  <li className="text-rose-700 font-medium">提前完成租赁</li>
                  <li>出租方获得<span className="font-bold"> 全部剩余应得费用</span>（平台仍扣除约定比例）</li>
                  <li>承租方不额外追偿</li>
                </ul>
              </div>

              {/* 情形② 密码/账号错误 */}
              <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/40">
                <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                  <span className="text-xl"></span> 密码/账号错误
                </div>
                <p className="text-xs text-gray-600 mb-2">出租方协助找回；若最终无法找回：</p>
                <ul className="text-xs space-y-1 text-gray-700 list-disc pl-5">
                  <li className="text-amber-700 font-medium">提前结束租赁</li>
                  <li>出租方获得截至当天的<span className="font-bold"> 已解冻费用</span></li>
                  <li>剩余冻结租金<span className="font-bold"> 全额退还承租方</span></li>
                </ul>
              </div>
            </div>

            {/* 额外说明小字 */}
            <p className="text-xs text-gray-400 mt-2 border-t border-gray-100 pt-3 italic">
              * 无论何种情况，平台已发生的担保服务费不退还（从已解冻/应付金额中按比例扣除）。详细以交易协议为准。
            </p>
          </div>

          {/* 法律底线重申 + 确认按钮 (静态) */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mt-4">
            <div className="flex items-center gap-3 text-sm mb-3">
              <span className="text-gray-600">继续使用即表示同意上述全部条款</span>
            </div>
            <button 
              className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-200 transition-all active:scale-95"
              onClick={onClose}
            >
              我已知晓并同意
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
