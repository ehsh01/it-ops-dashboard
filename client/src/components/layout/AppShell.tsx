import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Settings2, 
  LogOut, 
  ShieldCheck, 
  Activity,
  Ticket
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Tickets & Ops", icon: Ticket, href: "/tickets" },
    { label: "Integrations", icon: ShieldCheck, href: "/integrations" },
    { label: "System Health", icon: Activity, href: "/health" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col fixed h-full z-10 shadow-sm border-r border-slate-100">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center font-bold">
              <img src="/um-logo.png" alt="UM" className="w-full h-full object-contain" />
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer group",
                      isActive 
                        ? "bg-[#F47321] text-white shadow-md shadow-orange-500/20" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                    {item.label}
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
