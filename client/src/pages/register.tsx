import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Warehouse, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { insertUserSchema } from '@shared/schema';
import type { z } from 'zod';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

type RegisterForm = z.infer<typeof insertUserSchema>;

const worksites = [
  { value: "obra-norte", label: "Obra Norte - Shopping Center" },
  { value: "obra-sul", label: "Obra Sul - Residencial Alto Padrão" },
  { value: "obra-leste", label: "Obra Leste - Complexo Industrial" },
  { value: "obra-oeste", label: "Obra Oeste - Centro Comercial" },
  { value: "deposito-central", label: "Depósito Central" },
  { value: "obra-nova", label: "Nova Obra (Especificar)" },
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [customWorksite, setCustomWorksite] = useState('');

  const form = useForm<RegisterForm>({
    resolver: zodResolver(insertUserSchema.omit({ 
      role: true, 
      isActive: true, 
      lastLogin: true,
      createdAt: true,
      updatedAt: true 
    })),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      worksite: '',
    },
  });

  const selectedWorksite = form.watch('worksite');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const worksite = data.worksite === 'obra-nova' ? customWorksite : 
                     worksites.find(w => w.value === data.worksite)?.label || data.worksite;

      const registrationData = {
        ...data,
        worksite,
        role: 'operator' as const,
        isActive: true,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar conta');
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Agora você pode fazer login com suas credenciais.',
      });

      setLocation('/login');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Warehouse className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="register-title">
            Criar Conta
          </h1>
          <p className="text-muted-foreground mt-2" data-testid="register-subtitle">
            Gerencie o almoxarifado da sua obra
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="register-form">
              {error && (
                <Alert variant="destructive" data-testid="register-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Seu usuário"
                          className="h-12"
                          data-testid="input-username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="h-12"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha"
                          className="h-12 pr-12"
                          data-testid="input-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="worksite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Obra/Local de Trabalho</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12" data-testid="select-worksite">
                          <SelectValue placeholder="Selecione sua obra" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {worksites.map((worksite) => (
                          <SelectItem key={worksite.value} value={worksite.value}>
                            {worksite.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedWorksite === 'obra-nova' && (
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Nome da Nova Obra
                  </label>
                  <Input
                    placeholder="Digite o nome da obra"
                    className="h-12 mt-2"
                    value={customWorksite}
                    onChange={(e) => setCustomWorksite(e.target.value)}
                    data-testid="input-custom-worksite"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12"
                disabled={isLoading}
                data-testid="button-register"
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Link href="/login">
              <Button variant="ghost" className="text-sm" data-testid="link-login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Já tem conta? Fazer login
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>ObraStock - Sistema de Gestão de Almoxarifado</p>
        </div>
      </div>
    </div>
  );
}