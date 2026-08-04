export type Role = 'ADMIN_MANAGER' | 'SALES_EXECUTIVE';

export type DealStage =
  | 'LEAD_ACQUIRED'
  | 'CONTACTED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export type InteractionType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  createdAt?: string;
}

export interface InteractionLog {
  id: string;
  dealId: string;
  type: InteractionType;
  notes?: string;
  date: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  stage: DealStage;
  assignedUserId?: string;
  assignedUser?: User;
  createdById: string;
  createdBy?: User;
  interactions?: InteractionLog[];
  _count?: {
    interactions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StageMetric {
  totalValue: number;
  count: number;
}

export interface MetricsData {
  totalPipelineValue: number;
  totalDeals: number;
  stages: Record<DealStage, StageMetric>;
}
