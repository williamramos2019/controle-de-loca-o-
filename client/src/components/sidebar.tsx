import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Package, 
  ArrowRightLeft, 
  Users, 
  LogOut, 
  Menu,
  X,
  Warehouse,
  PlusCircle
} from 'lucide-react';
import { Link } from 'wouter';
import { RequirePermission } from './protected-route';

const navigationItems = [
  { 
    path: '/', 
    icon: Home, 
    label: 'Dashboard', 
    testId: 'nav-dashboard',
    permission: 'read'
  },
  { 
    path: '/inventory', 
    icon: Package, 
    label: 'Almoxarifado', 
    testId: 'nav-inventory',
    permission: 'read'
  },
  { 
    path: '/entry', 
    icon: PlusCircle, 
    label: 'Entrada', 
    testId: 'nav-entry',
    permission: 'write'
  },
  { 
    path: '/transfers', 
    icon: ArrowRightLeft, 
    label: 'Transferências', 
    testId: 'nav-transfers',
    permission: 'manage_transfers'
  },
  { 
    path: '/users', 
    icon: Users, 
    label: 'Usuários', 
    testId: 'nav-users',
    permission: 'manage_users'
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        data-testid="button-mobile-menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen bg-card border-r border-border transition-all duration-300
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <Warehouse className="text-primary-foreground w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-lg font-semibold text-foreground" data-testid="sidebar-title">
                      ObraStock
                    </h1>
                    <p className="text-xs text-muted-foreground" data-testid="sidebar-subtitle">
                      {user?.worksite || 'Obra Central'}
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex w-8 h-8"
                onClick={() => setIsCollapsed(!isCollapsed)}
                data-testid="button-collapse-sidebar"
              >
                {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              if (!hasPermission(item.permission)) return null;
              
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <button 
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    data-testid={item.testId}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-border">
            {!isCollapsed && user && (
              <div className="mb-3 p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm font-medium text-foreground" data-testid="user-name">
                  {user.username}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="user-role">
                  {user.role === 'admin' ? 'Administrador' : 
                   user.role === 'manager' ? 'Gerente' : 'Operador'}
                </p>
              </div>
            )}
            
            <Button
              variant="ghost"
              className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">Sair</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}