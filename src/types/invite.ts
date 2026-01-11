import type { User } from './index';

// 邀请记录类型
export interface InviteRecord {
  id: string;
  inviteeId: string;
  inviteeName: string;
  inviteeAvatar?: string;
  inviteDate: string;
  joinDate?: string;
  status: 'pending' | 'joined' | 'active';
  rewardAmount: number;
  completedTasks: number;
  totalEarnings: number;
  myCommission: number;
  level?: string;
}

// 佣金记录类型
export interface CommissionRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  taskId?: string;
  taskName: string;
  commission: number;
  commissionRate: number;
  taskEarning?: number;
  type: 'task' | 'register' | 'team';
  date: string;
  status: 'pending' | 'completed';
  description?: string;
}

// 团队成员类型
export interface TeamMember {
  id: string;
  nickname: string;
  avatar?: string;
  joinDate: string;
  status: string;
  statusColor: string;
  completedTasks: number;
  totalEarnings: number;
  myCommission: number;
  level: string;
}

// 佣金统计类型
export interface CommissionStats {
  total: number;
  today: number;
  yesterday: number;
  month: number;
  breakdown: {
    task: number;
    register: number;
    team: number;
  };
}

// 邀请统计类型
export interface InviteStats {
  totalInvited: number;
  activeMembers: number;
  pendingInvites: number;
  totalCommission: number;
}

// 邀请链接和码
export interface InviteDetails {
  inviteCode: string;
  inviteLink: string;
  userId: string;
  expiration?: string;
}

// 邀请规则
export interface InviteRule {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  commissionRate: number;
  isActive: boolean;
}

// 佣金详情参数
export interface CommissionDetailParams {
  commissionId: string;
}

// 邀请好友详情参数
export interface InviteDetailParams {
  inviteId: string;
}