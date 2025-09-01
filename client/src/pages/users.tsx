import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequirePermission } from '@/components/protected-route';
import { useToast } from '@/hooks/use-toast';

const roles = [
  { value: 'admin', label: 'Administrador', color: 'bg-destructive' },
  { value: 'manager', label: 'Gerente', color: 'bg-warning' },
  { value: 'operator', label: 'Operador', color: 'bg-primary' },
];

const worksites = [
  'Obra Norte - Shopping Center',
  'Obra Sul - Residencial Alto Padrão', 
  'Obra Leste - Complexo Industrial',
  'Obra Oeste - Centro Comercial',
  'Depósito Central'
];

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { toast } = useToast();

  // Mock data for users
  const users = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@obrastock.com',
      role: 'admin',
      worksite: 'Depósito Central',
      isActive: true,
      lastLogin: '2024-01-20T10:30:00',
      createdAt: '2024-01-01T08:00:00',
    },
    {
      id: '2',
      username: 'joao.silva',
      email: 'joao.silva@obrastock.com',
      role: 'manager',
      worksite: 'Obra Norte - Shopping Center',
      isActive: true,
      lastLogin: '2024-01-19T16:45:00',
      createdAt: '2024-01-05T09:15:00',
    },
    {
      id: '3',
      username: 'maria.santos',
      email: 'maria.santos@obrastock.com',
      role: 'operator',
      worksite: 'Obra Sul - Residencial Alto Padrão',
      isActive: true,
      lastLogin: '2024-01-18T14:20:00',
      createdAt: '2024-01-10T11:30:00',
    },
    {
      id: '4',
      username: 'carlos.oliveira',
      email: 'carlos.oliveira@obrastock.com',
      role: 'operator',
      worksite: 'Obra Leste - Complexo Industrial',
      isActive: false,
      lastLogin: '2024-01-15T09:10:00',
      createdAt: '2024-01-12T14:45:00',
    },
  ];

  const getRoleBadge = (role: string) => {
    const roleObj = roles.find(r => r.value === role);
    return (
      <Badge className={roleObj?.color} data-testid={`role-badge-${role}`}>
        {roleObj?.label || role}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleNewUser = () => {
    toast({
      title: 'Novo Usuário',
      description: 'Funcionalidade em desenvolvimento',
    });
  };

  const handleEditUser = (userId: string) => {
    toast({
      title: 'Editar Usuário',
      description: `Editando usuário ${userId}`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    toast({
      title: 'Excluir Usuário',
      description: `Excluindo usuário ${userId}`,
      variant: 'destructive',
    });
  };

  const handleToggleStatus = (userId: string) => {
    toast({
      title: 'Status do Usuário',
      description: `Alterando status do usuário ${userId}`,
    });
  };

  return (
    <div className="p-6 space-y-6" data-testid="users-view">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">
            Usuários
          </h1>
          <p className="text-muted-foreground" data-testid="page-subtitle">
            Gerencie usuários e suas permissões no sistema
          </p>
        </div>
        <RequirePermission permission="manage_users">
          <Button
            onClick={handleNewUser}
            data-testid="button-new-user"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </RequirePermission>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por usuário ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48" data-testid="select-role-filter">
            <SelectValue placeholder="Filtrar por função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Funções</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">Usuário</th>
                <th className="text-left p-4 font-medium text-foreground">Função</th>
                <th className="text-left p-4 font-medium text-foreground">Obra</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">Último Login</th>
                <th className="text-left p-4 font-medium text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground" data-testid="text-no-users">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-border" data-testid={`user-row-${user.id}`}>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground" data-testid={`user-username-${user.id}`}>
                          {user.username}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`user-email-${user.id}`}>
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-foreground" data-testid={`user-worksite-${user.id}`}>
                        {user.worksite}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={user.isActive ? "default" : "secondary"}
                        data-testid={`user-status-${user.id}`}
                      >
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground" data-testid={`user-last-login-${user.id}`}>
                        {new Date(user.lastLogin).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="p-4">
                      <RequirePermission permission="manage_users">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user.id)}
                            data-testid={`button-edit-${user.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(user.id)}
                            data-testid={`button-toggle-${user.id}`}
                          >
                            {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            data-testid={`button-delete-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </RequirePermission>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}