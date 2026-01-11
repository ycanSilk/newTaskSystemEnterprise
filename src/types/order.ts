// 定义订单类型接口
export interface SubOrder {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
  submitTime?: string;
  reviewTime?: string;
  reward: number;
  content?: string;
  screenshots?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  budget: number;
  assignedTo?: string;
  completionTime?: string;
  type: 'comment' | 'like' | 'share' | 'other';
  subOrders: SubOrder[];
  videoUrl?: string;
}
