'use client';

import React from 'react';
import AgreementModal from './AgreementModal';

interface UserAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserAgreementModal({ isOpen, onClose }: UserAgreementModalProps) {
  const content = (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">用户协议</h2>
        <p className="text-gray-600 mb-4">更新日期：2026年3月10日</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">1. 协议的接受</h3>
        <p className="text-gray-700 leading-relaxed">
          欢迎使用我们的平台服务。本用户协议（以下简称"协议"）是您与平台之间关于使用平台服务的法律协议。通过注册、登录或使用平台服务，您表示您已阅读、理解并同意受本协议的约束。如果您不同意本协议的任何条款，您应立即停止注册或使用平台服务。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">2. 账户注册与管理</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">2.1 注册资格</strong>：您必须是具有完全民事行为能力的自然人或合法成立的企业、组织。如果您是代表企业或组织注册账户，您声明并保证您有权代表该企业或组织接受本协议。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">2.2 账户信息</strong>：您在注册时应提供真实、准确、完整的个人信息，并在信息发生变化时及时更新。您应妥善保管账户密码，对使用您账户进行的所有操作负全部责任。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">2.3 账户安全</strong>：您应采取合理措施保护您的账户安全，包括但不限于：选择强度足够的密码、定期更改密码、不向他人透露账户信息、及时通知平台任何未经授权的账户使用。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">3. 平台服务</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">3.1 服务内容</strong>：平台提供以下服务：任务发布与管理、账号租赁服务、支付与钱包管理、通知系统、工单系统、AI 评论生成。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">3.2 服务使用规则</strong>：您在使用平台服务时应遵守以下规则：遵守中华人民共和国法律法规及相关国际公约、不得利用平台从事任何违法违规活动、不得侵犯他人的知识产权、隐私权等合法权益、不得干扰平台的正常运行、不得利用平台服务进行欺诈、赌博、洗钱等非法行为。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">4. 用户行为规范</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">4.1 禁止行为</strong>：您不得从事以下行为：发布、传播违法违规信息、侵犯他人知识产权、商业秘密等合法权益、干扰平台正常运行、利用平台进行欺诈活动、其他违反法律法规或损害平台及其他用户合法权益的行为。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-bold">4.2 责任承担</strong>：如您违反本协议或相关法律法规，平台可采取包括但不限于封禁账号在内的相关措施，并追究您的法律责任。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">5. 知识产权</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">5.1 平台知识产权</strong>：平台及其相关服务中包含的所有内容（包括但不限于文字、图片、音频、视频、软件等）的知识产权归平台所有。未经平台授权，您不得复制、修改、传播或用于其他商业目的。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">5.2 用户知识产权</strong>：您在平台上发布的内容的知识产权归您所有，但您授予平台在全球范围内、免费、不可撤销的使用权，包括但不限于复制、修改、传播、展示等权利。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">6. 隐私保护</h3>
        <p className="text-gray-700 leading-relaxed">
          平台重视您的隐私保护，具体内容详见
          <a href="#" className="text-blue-600 hover:text-blue-800 underline ml-1">《隐私政策》</a>。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">7. 服务变更、中断或终止</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">7.1 服务变更</strong>：平台有权根据业务发展需要变更服务内容，变更后将通过平台公告等方式通知您。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">7.2 服务中断或终止</strong>：如发生以下情况，平台有权中断或终止向您提供服务：您违反本协议或相关法律法规、您的账户存在安全风险、法律法规要求、其他平台认为需要中断或终止服务的情况。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">8. 免责声明</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">8.1 平台免责</strong>：平台不对以下情况承担责任：因网络故障、系统故障等不可抗力因素导致的服务中断或数据丢失、因您自身原因导致的账户安全问题、因第三方行为导致的损失、其他非平台故意或重大过失导致的损失。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">8.2 用户责任</strong>：您应自行承担使用平台服务的风险，平台不保证服务的完美性、安全性或无错误。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">9. 协议修改</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-bold">平台有权随时修改本协议的相关条例</strong>，修改后的协议将通过平台公告等方式通知您。您继续使用平台服务即视为接受修改后的协议。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">10. 法律适用与争议解决</h3>
        <p className="text-gray-700 leading-relaxed">
          本协议的订立、履行、解释及争议解决均适用中华人民共和国法律。如发生争议，双方应协商解决；协商不成的，任何一方均有权向平台所在地有管辖权的人民法院提起诉讼。
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">11. 其他条款</h3>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">11.1 协议生效</strong>：本协议自您注册或使用平台服务之日起生效。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">11.2 协议整体性</strong>：本协议构成您与平台之间关于使用平台服务的完整协议，取代之前的任何口头或书面协议。
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong className="font-medium">11.3 条款独立性</strong>：如本协议的任何条款被认定为无效或不可执行，不影响其他条款的效力。
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-gray-600 text-sm">
          <strong className="font-bold">平台保留对本协议的最终解释权。</strong>
        </p>
      </div>
    </div>
  );

  return (
    <AgreementModal
      isOpen={isOpen}
      onClose={onClose}
      title="用户协议"
      content={content}
    />
  );
}
