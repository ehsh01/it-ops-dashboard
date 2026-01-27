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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center font-bold">
              <img src="/um-logo.png" alt="UM" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight text-sm">IT Ops Console</h1>
              <p className="text-xs text-muted-foreground">Admin: j.doe</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                    isActive 
                      ? "bg-primary/10 text-primary hover:bg-primary/15" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border/40">
           <Link href="/login">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
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
