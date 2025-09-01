export type ViewType = 'dashboard' | 'inventory' | 'entry' | 'loans';

export interface DashboardStats {
  totalTools: number;
  lentTools: number;
  lowStockCount: number;
  overdueReturns: number;
}

export interface QuickAction {
  title: string;
  description: string;
  icon: string;
  action: () => void;
  variant: 'primary' | 'secondary';
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface RecentActivity {
  id: string;
  action: string;
  description: string;
  user: string;
  timestamp: string;
  type: 'entry' | 'exit' | 'loan' | 'return';
}
