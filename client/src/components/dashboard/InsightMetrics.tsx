import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, UserCircle, Crown, ShieldCheck } from "lucide-react";
import { metrics } from "./mockData";

export function InsightMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Metric 1: SLA Breach Risk - Orange Gradient */}
      <Card className="bg-gradient-to-br from-orange-400 to-orange-500 border-none shadow-lg shadow-orange-500/20 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group text-white">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-orange-100 uppercase tracking-wider mb-1">
              Need Attention
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{metrics.breachRisk}</span>
              <span className="text-xs font-medium text-orange-100/90 group-hover:text-white">Near SLA Breach</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
        </CardContent>
      </Card>

      {/* Metric 2: Waiting on User - Warning/Yellow-Orange Gradient */}
      <Card className="bg-gradient-to-br from-amber-400 to-orange-400 border-none shadow-lg shadow-amber-500/20 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group text-white">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-amber-100 uppercase tracking-wider mb-1">
              Your Count
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{metrics.waitingOnYou}</span>
              <span className="text-xs font-medium text-amber-100/90 group-hover:text-white">Waiting on You</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
            <UserCircle className="w-5 h-5 text-white fill-white" />
          </div>
        </CardContent>
      </Card>

      {/* Metric 3: VIP Requests - Dark Blue/Green Gradient */}
      <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-none shadow-lg shadow-slate-900/20 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group text-white">
        <CardContent className="p-4 flex items-center justify-between relative overflow-hidden">
          {/* Subtle accent blob */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Priority Context
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{metrics.vipRequests}</span>
              <span className="text-xs font-medium text-slate-300 group-hover:text-white">VIP / High Impact</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-emerald-500/20 transition-colors relative z-10">
            <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
        </CardContent>
      </Card>

      {/* Metric 4: Health - Dark Green Gradient */}
      <Card className="bg-gradient-to-br from-[#004d40] to-[#002820] border-none shadow-lg shadow-emerald-900/20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 to-transparent"></div>
        <CardContent className="p-4 flex items-center justify-between relative z-10">
          <div>
             <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">
              SLA Health
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{metrics.slaCompliance}</span>
              <span className="text-xs font-medium text-emerald-400">Normal</span>
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
