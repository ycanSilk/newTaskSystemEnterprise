'use client';

import React from 'react';
import AgreementModal from './AgreementModal';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const content = (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">隐私政策</h2>
        <p className="text-gray-600 mb-4">更新日期：2026年3月10日</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">1. 引言</h3>
        <p className="text-gray-700 leading-relaxed">
          保护您的隐私是我们的首要任务。本隐私政策（以下简称"政策"）旨在向您说明我们如何收集、使用、存储和保护您的个人信息，以及您对您个人信息的权利。通过使用我们的平台服务，您表示您同意本政策的所有条款。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">2. 我们收集的信息</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">2.1 您提供的信息</strong>：包括注册信息（如您的姓名、手机号码、电子邮箱等）、账户信息（如您的账户设置、偏好等）、交易信息（如您的支付记录、订单信息等）、通信信息（如您与平台之间的通信记录）。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">2.2 我们自动收集的信息</strong>：包括设备信息（如设备型号、操作系统、IP地址等）、浏览信息（如您访问的页面、停留时间、点击记录等）、位置信息（如果您允许，我们可能收集您的位置信息）、日志信息（如系统日志、错误日志等）。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">3. 我们如何使用您的信息</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">3.1 提供服务</strong>：用于账户创建和管理、处理交易和支付、提供客户支持、发送通知和提醒。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">3.2 改进服务</strong>：用于分析用户行为和偏好、优化平台功能和性能、开发新服务和功能。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">3.3 安全保障</strong>：用于验证用户身份、检测和防止欺诈行为、保护平台和用户的安全。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">3.4 合规要求</strong>：用于遵守法律法规、响应法律要求、保护平台的合法权益。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">4. 信息共享</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">4.1 与第三方共享</strong>：我们不会向第三方出售您的个人信息，但可能在以下情况下与第三方共享：获得您的明确授权、为提供服务而必要的共享（如支付处理）、遵守法律法规要求、保护平台和用户的合法权益。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">4.2 服务提供商</strong>：我们可能与以下服务提供商共享信息：支付处理服务提供商、云存储服务提供商、数据分析服务提供商、客户支持服务提供商。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">5. 信息存储与保护</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">5.1 存储方式</strong>：我们使用安全的服务器存储您的个人信息，采用加密技术保护您的敏感信息，定期备份您的个人信息。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">5.2 保护措施</strong>：我们实施严格的访问控制措施，使用防火墙和其他安全技术，定期进行安全审计和评估，对员工进行安全培训。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">5.3 存储期限</strong>：我们将在法律要求的期限内存储您的个人信息，或在实现收集目的所需的时间内存储。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">6. 您的权利</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">6.1 访问权</strong>：您有权访问和查看您的个人信息。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">6.2 修改权</strong>：您有权修改和更新您的个人信息。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">6.3 删除权</strong>：您有权要求删除您的个人信息，除非法律另有要求。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">6.4 选择权</strong>：您有权选择是否接收我们的营销信息。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">6.5 数据导出权</strong>：您有权要求我们导出您的个人信息。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">7. 隐私政策的变更</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-bold">平台有权随时修改本隐私政策的相关条例</strong>，修改后的政策将通过平台公告等方式通知您。您继续使用平台服务即视为接受修改后的隐私政策。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">8. 未成年人保护</h3>
        <p className="text-gray-700 leading-relaxed">
          我们重视未成年人的隐私保护。如果您是未满18周岁的未成年人，您应在监护人的指导下使用平台服务，并获得监护人的同意。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">9. 联系我们</h3>
        <p className="text-gray-700 leading-relaxed">
          如果您对本隐私政策有任何疑问或建议，您可以通过以下方式联系我们：
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>客服QQ：<a href="tel:400-123-4567" className="text-blue-600 hover:text-blue-800 underline">1306904145</a></li>
          <li>平台工单系统</li>
          <li>客服在线时间：9:00-18:00（周一至周五）</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">10. 法律适用</h3>
        <p className="text-gray-700 leading-relaxed">
          本隐私政策的订立、履行、解释及争议解决均适用中华人民共和国法律。
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-gray-600 text-sm">
          <strong className="font-bold">本隐私政策自发布之日起生效。</strong>
        </p>
      </div>
    </div>
  );

  return (
    <AgreementModal
      isOpen={isOpen}
      onClose={onClose}
      title="隐私政策"
      content={content}
    />
  );
}
