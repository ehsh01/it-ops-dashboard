import { Card, CardContent } from "@/components/ui/card";
import { Flame, UserCircle, Crown, ShieldCheck, TrendingUp, Link2 } from "lucide-react";
import { useActionItems } from "@/lib/api/queries";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Link } from "wouter";

type MicrosoftStatus = {
  configured: boolean;
  connected: boolean;
};

export function InsightMetrics() {
  const { data: items = [] } = useActionItems();
  const { data: microsoftStatus } = useQuery<MicrosoftStatus>({
    queryKey: ["/api/microsoft/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const actionRequired = items.filter(i => i.state === "action_required").length;
  const waiting = items.filter(i => i.state === "waiting").length;
  const highPriority = items.filter(i => i.priority === "high" || i.priority === "critical").length;
  const isConnected = microsoftStatus?.connected;

  if (!isConnected && items.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-4 bg-gradient-to-br from-slate-50 to-slate-100 border-dashed border-2 border-slate-200">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <Link2 className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Connect Your Accounts</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-md">
              Link your Microsoft Outlook account to start syncing emails and action items automatically.
            </p>
            <Link href="/integrations">
              <a className="px-4 py-2 bg-[#0078D4] text-white rounded-lg font-medium hover:bg-[#106EBE] transition-colors">
                Go to Integrations
              </a>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-orange-400 to-orange-500 border-none shadow-lg shadow-orange-500/20 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group text-white">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-orange-100 uppercase tracking-wider mb-1">
              Need Attention
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{actionRequired}</span>
              <span className="text-xs font-medium text-orange-100/90 group-hover:text-white">Action Required</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-400 to-orange-400 border-none shadow-lg shadow-amber-500/20 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group text-white">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-amber-100 uppercase tracking-wider mb-1">
              Pending
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{waiting}</span>
              <span className="text-xs font-medium text-amber-100/90 group-hover:text-white">Waiting</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
            <UserCircle className="w-5 h-5 text-white fill-white" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-none shadow-lg shadow-slate-900/20 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group text-white">
        <CardContent className="p-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Priority
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{highPriority}</span>
              <span className="text-xs font-medium text-slate-300 group-hover:text-white">High Priority</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-emerald-500/20 transition-colors relative z-10">
            <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#004d40] to-[#002820] border-none shadow-lg shadow-emerald-900/20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 to-transparent"></div>
        <CardContent className="p-4 flex items-center justify-between relative z-10">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                  Total Items
                </p>
             </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{items.length}</span>
              <span className="text-xs font-medium text-emerald-400">Synced</span>
            </div>
          </div>
          <div className="h-12 w-12 border-2 border-emerald-500/30 rounded-full flex items-center justify-center bg-emerald-900/50">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
