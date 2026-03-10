'use client';

import React from 'react';
import AgreementModal from './AgreementModal';

interface PlatformServiceNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlatformServiceNoticeModal({ isOpen, onClose }: PlatformServiceNoticeModalProps) {
  const content = (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">平台服务须知</h2>
        <p className="text-gray-600 mb-4">更新日期：2026年3月10日</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">1. 服务概述</h3>
        <p className="text-gray-700 leading-relaxed">
          欢迎使用我们的平台服务。本平台服务须知（以下简称"须知"）旨在向您说明平台的服务内容、使用规则、收费标准等重要信息，帮助您更好地了解和使用平台服务。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">2. 服务内容</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">2.1 任务发布与管理</strong>：您可以发布各种类型的任务，包括但不限于抖音评论任务、点赞任务等。您可以管理任务状态，包括待审核、进行中、已完成等，并查看任务详情和统计数据。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">2.2 账号租赁服务</strong>：您可以发布账号出租信息，浏览和申请账号租赁，管理租赁订单和交易。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">2.3 支付与钱包管理</strong>：平台提供充值和提现功能，您可以查看交易记录和余额，设置支付密码和安全验证。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">2.4 通知系统</strong>：您可以接收任务状态变更通知、系统公告和活动信息，并管理通知偏好设置。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">2.5 工单系统</strong>：您可以提交问题和建议，跟踪工单处理进度，与客服人员沟通。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">2.6 AI 评论生成</strong>：您可以使用 AI 生成评论内容，自定义评论模板和参数，管理评论库。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">3. 使用规则</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">3.1 账户规则</strong>：每个用户只能注册一个账户，账户不得转让、出租或出售，账户密码应定期更换。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">3.2 任务规则</strong>：任务内容应符合法律法规和平台规定，任务发布者应确保任务描述清晰准确，任务参与者应按照要求完成任务。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">3.3 交易规则</strong>：交易应通过平台指定的支付方式进行，交易金额应与任务或租赁服务的实际价值相符，交易完成后，资金将按照平台规则进行分配。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">3.4 内容规则</strong>：平台上发布的内容应符合法律法规和公序良俗，不得发布违法违规、淫秽色情、暴力恐怖等内容，不得发布侵犯他人知识产权、隐私权等合法权益的内容。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-bold">如您违反上述规则，平台可采取包括但不限于封禁账号在内的相关措施</strong>。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">4. 收费标准</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">4.1 任务服务收费</strong>：平台可能对任务发布收取一定的服务费用，具体收费标准将在任务发布页面显示，费用将在任务发布时扣除。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">4.2 账号租赁收费</strong>：平台对账号租赁交易收取一定比例的服务费用，具体收费比例将在租赁交易页面显示，费用将在交易完成时自动扣除。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">4.3 其他服务收费</strong>：平台可能对其他增值服务收取费用，具体收费标准将在相关服务页面显示。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">5. 服务流程</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">5.1 任务发布流程</strong>：1. 登录平台账户；2. 进入任务发布页面；3. 填写任务信息和要求；4. 确认任务详情和费用；5. 提交任务。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">5.2 任务参与流程</strong>：1. 浏览任务列表；2. 选择适合的任务；3. 按照任务要求完成任务；4. 提交任务结果；5. 等待任务审核和结算。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">5.3 账号租赁流程</strong>：1. 浏览账号租赁市场；2. 选择适合的账号；3. 提交租赁申请；4. 支付租赁费用；5. 开始使用账号；6. 租赁期满后归还账号。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">5.4 提现流程</strong>：1. 登录平台账户；2. 进入钱包页面；3. 点击提现按钮；4. 填写提现金额和银行卡信息；5. 提交提现申请；6. 等待资金到账。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">6. 安全提示</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">6.1 账户安全</strong>：请不要向他人透露账户密码和验证码，不要使用公共电脑或不安全的网络登录账户，定期检查账户活动记录。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">6.2 交易安全</strong>：请只通过平台指定的支付方式进行交易，不要与其他用户私下交易，仔细核实交易对方的身份和信息。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">6.3 信息安全</strong>：请不要在平台上发布个人敏感信息，不要点击来源不明的链接，定期更新密码和安全设置。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">7. 常见问题</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">7.1 账户问题</strong>：忘记密码（可以通过手机或邮箱找回）；账户被冻结（联系客服了解原因并解决）；信息修改（在个人中心页面修改账户信息）。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">7.2 任务问题</strong>：任务审核时间（一般为1-2个工作日）；任务失败原因（查看任务详情和失败原因）；任务结算时间（任务审核通过后立即结算）。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">7.3 交易问题</strong>：支付失败（检查支付方式和账户余额）；提现到账时间（一般为1-3个工作日）；交易纠纷（通过工单系统提交纠纷）。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">8. 联系我们</h3>
        <p className="text-gray-700 leading-relaxed">
          如果您对平台服务有任何疑问或建议，您可以通过以下方式联系我们：
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>客服QQ：<a href="tel:400-123-4567" className="text-blue-600 hover:text-blue-800 underline">1306904145</a></li>
          <li>平台工单系统</li>
          <li>客服在线时间：9:00-18:00（周一至周五）</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">9. 服务更新</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-bold">平台有权随时修改本服务须知的相关条例</strong>，平台将根据业务发展需要不断更新和优化服务内容，具体以平台实际提供的服务为准。
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-gray-600 text-sm">
          <strong className="font-bold">本平台服务须知自发布之日起生效。</strong>
        </p>
      </div>
    </div>
  );

  return (
    <AgreementModal
      isOpen={isOpen}
      onClose={onClose}
      title="平台服务须知"
      content={content}
    />
  );
}
