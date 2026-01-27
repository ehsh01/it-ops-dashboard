import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, UserCircle, Crown, ShieldCheck } from "lucide-react";
import { metrics } from "./mockData";

export function InsightMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Metric 1: SLA Breach Risk */}
      <Card className="bg-white border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Need Attention
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics.breachRisk}</span>
              <span className="text-xs font-medium text-orange-600 group-hover:underline">Near SLA Breach</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      {/* Metric 2: Waiting on User */}
      <Card className="bg-white border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Your Court
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics.waitingOnYou}</span>
              <span className="text-xs font-medium text-primary group-hover:underline">Waiting on You</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <UserCircle className="w-5 h-5 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Metric 3: VIP Requests */}
      <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Priority Context
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics.vipRequests}</span>
              <span className="text-xs font-medium text-purple-600 group-hover:underline">VIP / High Impact</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <Crown className="w-5 h-5 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      {/* Metric 4: Health */}
      <Card className="bg-slate-900 border-none shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              SLA Health
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{metrics.slaCompliance}</span>
              <span className="text-xs font-medium text-green-400">Nominal</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-green-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
