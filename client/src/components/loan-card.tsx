import { Button } from "@/components/ui/button";
import { Check, Clock, Phone, Calendar, AlertTriangle } from "lucide-react";
import type { LoanWithToolInfo } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LoanCardProps {
  loan: LoanWithToolInfo;
  onReturn: (loanId: string) => void;
  onExtend?: (loanId: string) => void;
  onContact?: (loanId: string) => void;
}

export default function LoanCard({ loan, onReturn, onExtend, onContact }: LoanCardProps) {
  const isOverdue = loan.isOverdue;
  
  return (
    <div 
      className={`bg-card border rounded-lg p-4 space-y-3 ${
        isOverdue ? 'border-destructive/20' : 'border-border'
      }`}
      data-testid={`loan-card-${loan.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-foreground" data-testid={`loan-tool-name-${loan.id}`}>
            {loan.toolName}
          </h4>
          <p className="text-sm text-muted-foreground" data-testid={`loan-borrower-${loan.id}`}>
            Para: {loan.borrowerName} {loan.borrowerTeam && `- ${loan.borrowerTeam}`}
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground" data-testid={`loan-date-${loan.id}`}>
                Emprestado: {format(new Date(loan.loanDate), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            {isOverdue ? (
              <>
                <AlertTriangle className="w-3 h-3 text-destructive" />
                <span className="text-sm text-destructive font-medium" data-testid={`loan-return-date-${loan.id}`}>
                  Atrasado: {format(new Date(loan.expectedReturnDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-warning" />
                <span className="text-sm text-warning font-medium" data-testid={`loan-return-date-${loan.id}`}>
                  Devolução: {format(new Date(loan.expectedReturnDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </>
            )}
          </div>
        </div>
        <span 
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            isOverdue 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-warning/10 text-warning'
          }`}
          data-testid={`loan-status-${loan.id}`}
        >
          {isOverdue ? 'Atrasado' : 'Emprestado'}
        </span>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          className="flex-1 h-10 bg-success text-white hover:bg-success/90 touch-target"
          onClick={() => onReturn(loan.id)}
          data-testid={`button-return-${loan.id}`}
        >
          <Check className="w-4 h-4 mr-2" />
          Devolver
        </Button>
        
        {isOverdue ? (
          <Button 
            variant="destructive" 
            className="flex-1 h-10 touch-target"
            onClick={() => onContact?.(loan.id)}
            data-testid={`button-contact-${loan.id}`}
          >
            <Phone className="w-4 h-4 mr-2" />
            Cobrar
          </Button>
        ) : (
          <>
            <Button 
              variant="secondary" 
              className="flex-1 h-10 touch-target"
              onClick={() => onExtend?.(loan.id)}
              data-testid={`button-extend-${loan.id}`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Prorrogar
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="touch-target w-10 h-10"
              onClick={() => onContact?.(loan.id)}
              data-testid={`button-phone-${loan.id}`}
            >
              <Phone className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
