import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Entry from "@/pages/entry";
import Loans from "@/pages/loans";
import Transfers from "@/pages/transfers";
import Users from "@/pages/users";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Forbidden from "@/pages/forbidden";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/sidebar";

function AuthenticatedLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="lg:hidden h-16"></div> {/* Space for mobile menu */}
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/inventory" component={Inventory} />
          <Route 
            path="/entry" 
            component={() => (
              <ProtectedRoute permission="write">
                <Entry />
              </ProtectedRoute>
            )} 
          />
          <Route path="/loans" component={Loans} />
          <Route 
            path="/transfers" 
            component={() => (
              <ProtectedRoute permission="manage_transfers">
                <Transfers />
              </ProtectedRoute>
            )} 
          />
          <Route 
            path="/users" 
            component={() => (
              <ProtectedRoute permission="manage_users">
                <Users />
              </ProtectedRoute>
            )} 
          />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/403" component={Forbidden} />
      <Route path="/*">
        {user ? <AuthenticatedLayout /> : <Login />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
