import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoanCard from "@/components/loan-card";
import type { LoanWithToolInfo } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const tabs = [
  { id: "active", label: "Ativos" },
  { id: "overdue", label: "Atrasados" },
  { id: "history", label: "Histórico" },
];

export default function Loans() {
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allLoans = [], isLoading } = useQuery({
    queryKey: ["/api/loans"],
  });

  const returnLoanMutation = useMutation({
    mutationFn: async (loanId: string) => {
      const response = await apiRequest("PATCH", `/api/loans/${loanId}/return`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Ferramenta devolvida com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar devolução",
        variant: "destructive",
      });
    },
  });

  const getFilteredLoans = () => {
    const loans = allLoans as LoanWithToolInfo[];
    switch (activeTab) {
      case "active":
        return loans.filter(loan => loan.status === "active" && !loan.isOverdue);
      case "overdue":
        return loans.filter(loan => loan.isOverdue);
      case "history":
        return loans.filter(loan => loan.status === "returned");
      default:
        return loans;
    }
  };

  const handleReturn = (loanId: string) => {
    returnLoanMutation.mutate(loanId);
  };

  const handleExtend = (loanId: string) => {
    toast({
      title: "Prorrogar",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const handleContact = (loanId: string) => {
    toast({
      title: "Contato",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const handleNewLoan = () => {
    toast({
      title: "Novo Empréstimo",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-10 bg-muted rounded flex-1"></div>
                  <div className="h-10 bg-muted rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredLoans = getFilteredLoans();

  return (
    <section className="p-4 space-y-6 fade-in" data-testid="loans-view">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground" data-testid="heading-loans">Empréstimos</h2>
        <Button
          size="icon"
          className="touch-target w-10 h-10 rounded-full"
          onClick={handleNewLoan}
          data-testid="button-new-loan"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "secondary"}
              size="sm"
              className="touch-target"
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="space-y-3" data-testid={`loans-list-${activeTab}`}>
          {filteredLoans.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground" data-testid="text-no-loans">
                {activeTab === "active" && "Nenhum empréstimo ativo"}
                {activeTab === "overdue" && "Nenhum empréstimo atrasado"}
                {activeTab === "history" && "Nenhum histórico de empréstimos"}
              </p>
            </div>
          ) : (
            filteredLoans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onReturn={handleReturn}
                onExtend={handleExtend}
                onContact={handleContact}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
