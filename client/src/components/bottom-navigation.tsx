import { Home, Package, PlusCircle, Handshake } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

const navigationItems = [
  { path: "/", icon: Home, label: "Início", testId: "nav-dashboard" },
  { path: "/inventory", icon: Package, label: "Estoque", testId: "nav-inventory" },
  { path: "/entry", icon: PlusCircle, label: "Entrada", testId: "nav-entry" },
  { path: "/loans", icon: Handshake, label: "Empréstimos", testId: "nav-loans" },
];

export default function BottomNavigation() {
  const [location] = useLocation();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
      <div className="grid grid-cols-4 px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <button 
                className={`touch-target flex flex-col items-center justify-center p-2 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                data-testid={item.testId}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-1" />
                  {item.path === "/loans" && stats?.overdueReturns && stats.overdueReturns > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center"
                      data-testid="badge-loans-overdue"
                    >
                      {stats.overdueReturns}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
