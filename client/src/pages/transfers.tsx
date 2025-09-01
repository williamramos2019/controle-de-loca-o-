import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequirePermission } from '@/components/protected-route';
import { useToast } from '@/hooks/use-toast';

const transferStatus = [
  { value: 'pending', label: 'Pendente', color: 'text-warning' },
  { value: 'in-transit', label: 'Em Trânsito', color: 'text-primary' },
  { value: 'completed', label: 'Concluída', color: 'text-success' },
  { value: 'cancelled', label: 'Cancelada', color: 'text-destructive' },
];

const worksites = [
  'Obra Norte - Shopping Center',
  'Obra Sul - Residencial Alto Padrão', 
  'Obra Leste - Complexo Industrial',
  'Obra Oeste - Centro Comercial',
  'Depósito Central'
];

export default function Transfers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  // Mock data for transfers
  const transfers = [
    {
      id: '1',
      toolName: 'Furadeira Bosch GSB 450',
      toolCode: 'FUR-001',
      quantity: 2,
      fromWorksite: 'Depósito Central',
      toWorksite: 'Obra Norte - Shopping Center',
      status: 'completed',
      requestedBy: 'João Silva',
      requestDate: '2024-01-15',
      completedDate: '2024-01-16',
    },
    {
      id: '2',
      toolName: 'Martelo Pneumático',
      toolCode: 'MAR-003',
      quantity: 1,
      fromWorksite: 'Obra Sul - Residencial Alto Padrão',
      toWorksite: 'Obra Leste - Complexo Industrial',
      status: 'in-transit',
      requestedBy: 'Maria Santos',
      requestDate: '2024-01-18',
    },
    {
      id: '3',
      toolName: 'Nível a Laser',
      toolCode: 'NIV-005',
      quantity: 1,
      fromWorksite: 'Obra Norte - Shopping Center',
      toWorksite: 'Obra Oeste - Centro Comercial',
      status: 'pending',
      requestedBy: 'Carlos Oliveira',
      requestDate: '2024-01-20',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-transit':
        return <ArrowRight className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusObj = transferStatus.find(s => s.value === status);
    return statusObj?.label || status;
  };

  const getStatusColor = (status: string) => {
    const statusObj = transferStatus.find(s => s.value === status);
    return statusObj?.color || 'text-muted-foreground';
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toolCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNewTransfer = () => {
    toast({
      title: 'Nova Transferência',
      description: 'Funcionalidade em desenvolvimento',
    });
  };

  return (
    <div className="p-6 space-y-6" data-testid="transfers-view">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">
            Transferências
          </h1>
          <p className="text-muted-foreground" data-testid="page-subtitle">
            Gerencie transferências de materiais entre obras
          </p>
        </div>
        <RequirePermission permission="manage_transfers">
          <Button
            onClick={handleNewTransfer}
            data-testid="button-new-transfer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transferência
          </Button>
        </RequirePermission>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por ferramenta ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {transferStatus.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground" data-testid="text-no-transfers">
              Nenhuma transferência encontrada
            </p>
          </div>
        ) : (
          filteredTransfers.map((transfer) => (
            <div 
              key={transfer.id}
              className="bg-card border border-border rounded-lg p-6 space-y-4"
              data-testid={`transfer-card-${transfer.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground" data-testid={`transfer-tool-${transfer.id}`}>
                    {transfer.toolName}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid={`transfer-code-${transfer.id}`}>
                    Código: {transfer.toolCode} • Qtd: {transfer.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`transfer-requester-${transfer.id}`}>
                    Solicitado por: {transfer.requestedBy}
                  </p>
                </div>
                <div className={`flex items-center space-x-2 ${getStatusColor(transfer.status)}`}>
                  {getStatusIcon(transfer.status)}
                  <span className="text-sm font-medium" data-testid={`transfer-status-${transfer.id}`}>
                    {getStatusLabel(transfer.status)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">De:</span>
                  <span className="font-medium" data-testid={`transfer-from-${transfer.id}`}>
                    {transfer.fromWorksite}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Para:</span>
                  <span className="font-medium" data-testid={`transfer-to-${transfer.id}`}>
                    {transfer.toWorksite}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  <span>Solicitado em: {new Date(transfer.requestDate).toLocaleDateString('pt-BR')}</span>
                  {transfer.completedDate && (
                    <span className="ml-4">
                      Concluído em: {new Date(transfer.completedDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                
                <RequirePermission permission="manage_transfers">
                  <div className="space-x-2">
                    {transfer.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" data-testid={`button-approve-${transfer.id}`}>
                          Aprovar
                        </Button>
                        <Button size="sm" variant="destructive" data-testid={`button-cancel-${transfer.id}`}>
                          Cancelar
                        </Button>
                      </>
                    )}
                    {transfer.status === 'in-transit' && (
                      <Button size="sm" data-testid={`button-complete-${transfer.id}`}>
                        Confirmar Recebimento
                      </Button>
                    )}
                  </div>
                </RequirePermission>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}