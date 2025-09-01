import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  change?: number;
  iconBgColor: string;
  changeColor?: string;
  testId: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  iconBgColor, 
  changeColor,
  testId 
}: StatsCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-2" data-testid={testId}>
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 ${iconBgColor} rounded-md flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium ${changeColor}`} data-testid={`${testId}-change`}>
            {change > 0 ? '+' : ''}{change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground" data-testid={`${testId}-value`}>{value}</p>
      <p className="text-xs text-muted-foreground" data-testid={`${testId}-title`}>{title}</p>
    </div>
  );
}
