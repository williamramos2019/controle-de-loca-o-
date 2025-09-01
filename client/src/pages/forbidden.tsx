import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Link } from 'wouter';

export default function Forbidden() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
          <Shield className="w-10 h-10 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground" data-testid="error-title">
            403
          </h1>
          <h2 className="text-xl font-semibold text-foreground" data-testid="error-subtitle">
            Acesso Negado
          </h2>
          <p className="text-muted-foreground" data-testid="error-description">
            Você não tem permissão para acessar esta página.
          </p>
          {user && (
            <p className="text-sm text-muted-foreground" data-testid="user-role-info">
              Seu nível de acesso: <span className="font-medium">{user.role}</span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full" data-testid="button-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
          
          <p className="text-xs text-muted-foreground">
            Se você acredita que deveria ter acesso, entre em contato com o administrador.
          </p>
        </div>
      </div>
    </div>
  );
}