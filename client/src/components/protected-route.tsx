import { useAuth } from '@/contexts/auth-context';
import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  role?: string;
}

export function ProtectedRoute({ children, permission, role }: ProtectedRouteProps) {
  const { user, hasPermission, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation('/login');
        return;
      }

      if (role && user.role !== role) {
        setLocation('/403');
        return;
      }

      if (permission && !hasPermission(permission)) {
        setLocation('/403');
        return;
      }
    }
  }, [user, role, permission, hasPermission, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (role && user.role !== role) {
    return null;
  }

  if (permission && !hasPermission(permission)) {
    return null;
  }

  return <>{children}</>;
}

interface RequirePermissionProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePermission({ permission, children, fallback }: RequirePermissionProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}