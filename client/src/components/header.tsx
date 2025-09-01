import { Bell, User, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Warehouse className="text-primary-foreground w-4 h-4" data-testid="logo-warehouse" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground" data-testid="header-title">Almoxarifado</h1>
              <p className="text-xs text-muted-foreground" data-testid="header-subtitle">Obra Central - SP</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="secondary" 
              size="icon" 
              className="touch-target w-10 h-10 rounded-full relative"
              data-testid="button-notifications"
            >
              <Bell className="w-4 h-4" />
              {stats?.overdueReturns && stats.overdueReturns > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center"
                  data-testid="badge-overdue-count"
                >
                  {stats.overdueReturns}
                </span>
              )}
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="touch-target w-10 h-10 rounded-full"
              data-testid="button-user-menu"
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
