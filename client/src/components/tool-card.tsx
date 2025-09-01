import { Button } from "@/components/ui/button";
import { MoreVertical, Handshake, Edit } from "lucide-react";
import type { ToolWithLoanInfo } from "@shared/schema";

interface ToolCardProps {
  tool: ToolWithLoanInfo;
  onLend: (toolId: string) => void;
  onEdit: (toolId: string) => void;
}

export default function ToolCard({ tool, onLend, onEdit }: ToolCardProps) {
  const getStatusColor = () => {
    if (tool.availableQuantity === 0) return "bg-destructive/10 text-destructive";
    if (tool.availableQuantity <= 2) return "bg-warning/10 text-warning";
    return "bg-success/10 text-success";
  };

  const getStatusText = () => {
    if (tool.availableQuantity === 0) return "Indisponível";
    if (tool.availableQuantity <= 2) return "Estoque Baixo";
    return "Disponível";
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3" data-testid={`tool-card-${tool.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-foreground" data-testid={`tool-name-${tool.id}`}>{tool.name}</h4>
          <p className="text-sm text-muted-foreground" data-testid={`tool-code-${tool.id}`}>Código: {tool.code}</p>
          {tool.entryType === "transfer" && tool.originWorksite && (
            <p className="text-xs text-primary" data-testid={`tool-origin-${tool.id}`}>
              Transferido de: {tool.originWorksite}
            </p>
          )}
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground">Disponível:</span>
              <span 
                className={`text-sm font-medium ${tool.availableQuantity <= 2 ? 'text-warning' : 'text-success'}`}
                data-testid={`tool-available-${tool.id}`}
              >
                {tool.availableQuantity}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="text-sm font-medium text-foreground" data-testid={`tool-total-${tool.id}`}>
                {tool.totalQuantity}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span 
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}
            data-testid={`tool-status-${tool.id}`}
          >
            {getStatusText()}
          </span>
          <Button 
            variant="secondary" 
            size="icon" 
            className="touch-target w-8 h-8 rounded-full"
            data-testid={`tool-menu-${tool.id}`}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          className="flex-1 h-10 touch-target" 
          onClick={() => onLend(tool.id)}
          disabled={tool.availableQuantity === 0}
          data-testid={`button-lend-${tool.id}`}
        >
          <Handshake className="w-4 h-4 mr-2" />
          Emprestar
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1 h-10 touch-target" 
          onClick={() => onEdit(tool.id)}
          data-testid={`button-edit-${tool.id}`}
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>
    </div>
  );
}
