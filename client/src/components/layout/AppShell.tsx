import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Settings2, 
  LogOut, 
  ShieldCheck, 
  Activity,
  Ticket,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sidebarCounts } from "../dashboard/mockData";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/", count: sidebarCounts.dashboard },
    { label: "Tickets & Ops", icon: Ticket, href: "/tickets", count: sidebarCounts.tickets },
    { label: "Integrations", icon: ShieldCheck, href: "/integrations", count: sidebarCounts.integrations },
    { label: "System Health", icon: Activity, href: "/health", count: sidebarCounts.health },
  ];

  // Determine global status based on dashboard count (mock logic)
  const criticalCount = sidebarCounts.dashboard;
  const statusColor = criticalCount > 0 ? "text-orange-600" : "text-green-600";
  const statusText = criticalCount > 0 ? "Action Required" : "All Clear";
  const StatusIcon = criticalCount > 0 ? AlertCircle : CheckCircle2;
  
  // New context/reason line
  const statusReason = criticalCount > 0 
    ? `${criticalCount} items blocking completion` 
    : "System nominal";

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
              <p className="text-sm text-slate-500">Admin: j.doe</p>
            </div>
          </div>
          
          {/* Global Status Confidence Indicator */}
          <div className="mb-8 p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
             <div className={cn("w-2 h-2 rounded-full animate-pulse flex-none", criticalCount > 0 ? "bg-orange-500" : "bg-green-500")}></div>
             <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Status</p>
                <p className={cn("text-xs font-bold flex items-center gap-1", statusColor)}>
                    <StatusIcon className="w-3 h-3" /> {statusText}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate" title={statusReason}>
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
           <Link href="/login">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
              Sign Out
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
