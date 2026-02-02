import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Settings2, 
  LogOut, 
  ShieldCheck, 
  Activity,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/context";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { criticalCount, eodComplete } = useAppState();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const isAdmin = currentUser?.role === "admin";

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/", count: criticalCount },
    { label: "Tickets & Ops", icon: Ticket, href: "/tickets", count: 0 },
    { label: "Integrations", icon: ShieldCheck, href: "/integrations", count: 0 },
    { label: "System Health", icon: Activity, href: "/health", count: 0 },
    ...(isAdmin ? [{ label: "Admin", icon: Users, href: "/admin", count: 0 }] : []),
  ];

  // Global Status Logic
  // Status is "All Clear" if EOD is complete AND no critical items remain.
  // Or if the user just wants EOD complete to signal "Clear" for the day (assuming critical items were handled or deferred).
  // Let's go with: If EOD is complete, we show "All Clear" (green).
  // If EOD is NOT complete but critical items are 0, we might show "Pending EOD".
  // If critical items > 0, we show "Action Required".
  
  let statusColor = "text-green-600";
  let statusText = "All Clear";
  let StatusIcon = CheckCircle2;
  let statusReason = "Ready for sign-off";
  let statusBg = "bg-green-500";

  if (criticalCount > 0) {
    statusColor = "text-orange-600";
    statusText = "Action Required";
    StatusIcon = AlertCircle;
    statusReason = `${criticalCount} items blocking completion`;
    statusBg = "bg-orange-500";
  } else if (!eodComplete) {
     // Critical count is 0, but EOD not done
    statusColor = "text-slate-600";
    statusText = "Wrap-up Pending";
    StatusIcon = Activity;
    statusReason = "Complete daily checklist";
    statusBg = "bg-slate-400";
  } else {
    // All clear
    statusColor = "text-green-600";
    statusText = "All Clear";
    StatusIcon = CheckCircle2;
    statusReason = "System nominal • Good evening";
    statusBg = "bg-green-500";
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col fixed h-full z-10 shadow-sm border-r border-slate-100">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center font-bold">
              <img src="/um-logo.png" alt="UM" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight">IT Ops Console</h1>
              <p className="text-sm text-slate-500">{currentUser?.displayName || "Loading..."}</p>
            </div>
          </div>
          
          {/* Global Status Confidence Indicator */}
          <div className="mb-8 p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3 transition-all duration-500">
             <div className={cn("w-2 h-2 rounded-full animate-pulse flex-none", statusBg)}></div>
             <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Status</p>
                <p className={cn("text-xs font-bold flex items-center gap-1 transition-colors duration-300", statusColor)}>
                    <StatusIcon className="w-3 h-3" /> {statusText}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate transition-all duration-300" title={statusReason}>
                   {statusReason}
                </p>
             </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer group",
                      isActive 
                        ? "bg-[#F47321] text-white shadow-md shadow-orange-500/20" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                        <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                        {item.label}
                    </div>
                    {item.count > 0 && (
                        <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                            isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        )}>
                            {item.count}
                        </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
