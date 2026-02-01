import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Integrations from "@/pages/Integrations";
import { AppShell } from "@/components/layout/AppShell";
import { AppProvider } from "@/lib/context";
import { Loader2 } from "lucide-react";
import type { User } from "@shared/schema";

function useUser() {
  return useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}

function ProtectedRoutes() {
  const { data: user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/integrations" component={Integrations} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function AuthRoute() {
  const { data: user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user) {
    return <Redirect to="/" />;
  }
  
  return <Login />;
}

function Router() {
  const [location] = useLocation();

  if (location === "/login") {
    return <AuthRoute />;
  }

  return <ProtectedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
