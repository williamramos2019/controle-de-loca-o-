import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Handshake, ArrowUp, ArrowRight } from "lucide-react";
import StatsCard from "@/components/stats-card";
import { Link } from "wouter";
import { Wrench, AlertTriangle, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-4 space-y-2 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-md"></div>
              <div className="w-16 h-8 bg-muted rounded"></div>
              <div className="w-20 h-4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="p-4 space-y-6 fade-in" data-testid="dashboard-view">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Ferramentas Total"
          value={stats?.totalTools || 0}
          icon={Wrench}
          change={12}
          iconBgColor="bg-success/10 text-success"
          changeColor="text-success"
          testId="stats-total-tools"
        />
        
        <StatsCard
          title="Emprestadas"
          value={stats?.lentTools || 0}
          icon={Handshake}
          change={-3}
          iconBgColor="bg-warning/10 text-warning"
          changeColor="text-warning"
          testId="stats-lent-tools"
        />
        
        <StatsCard
          title="Estoque Baixo"
          value={stats?.lowStockCount || 0}
          icon={AlertTriangle}
          iconBgColor="bg-destructive/10 text-destructive"
          testId="stats-low-stock"
        />
        
        <StatsCard
          title="Atraso Devolução"
          value={stats?.overdueReturns || 0}
          icon={Clock}
          iconBgColor="bg-primary/10 text-primary"
          testId="stats-overdue-returns"
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground" data-testid="heading-quick-actions">Ações Rápidas</h3>
        <div className="grid grid-cols-1 gap-3">
          <Link href="/entry">
            <Button 
              className="w-full bg-primary text-primary-foreground rounded-lg p-4 h-auto flex items-center space-x-3 touch-target"
              data-testid="button-quick-entry"
            >
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-md flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium">Entrada Rápida</p>
                <p className="text-sm opacity-90">Adicionar ferramenta ao estoque</p>
              </div>
            </Button>
          </Link>

          <Link href="/loans">
            <Button 
              variant="outline" 
              className="w-full bg-card border border-border text-foreground rounded-lg p-4 h-auto flex items-center space-x-3 touch-target"
              data-testid="button-quick-loan"
            >
              <div className="w-10 h-10 bg-warning/10 rounded-md flex items-center justify-center">
                <Handshake className="w-5 h-5 text-warning" />
              </div>
              <div className="text-left">
                <p className="font-medium">Empréstimo Rápido</p>
                <p className="text-sm text-muted-foreground">Emprestar ferramenta</p>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity - Empty state for now */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground" data-testid="heading-recent-activity">Atividade Recente</h3>
          <Button variant="ghost" size="sm" className="text-xs text-primary font-medium" data-testid="button-view-all">
            Ver Todas
          </Button>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground" data-testid="text-no-activity">
            Nenhuma atividade recente
          </p>
        </div>
      </div>
    </section>
  );
}
