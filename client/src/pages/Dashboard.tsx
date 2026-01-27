import { TimeAwareHeader } from "@/components/dashboard/TimeAwareHeader";
import { InsightMetrics } from "@/components/dashboard/InsightMetrics";
import { ActionFeed } from "@/components/dashboard/ActionFeed";
import { EODChecklist } from "@/components/dashboard/EODChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* 1. Time-Aware Header & Context */}
      <TimeAwareHeader />

      {/* 2. Insight Metrics (Priority indicators) */}
      <InsightMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        
        {/* 3. Main Action Feed (Takes up 2/3 width) */}
        <div className="lg:col-span-2 h-full">
          <ActionFeed />
        </div>

        {/* 4. Right Sidebar: Context, Schedule, EOD Status */}
        <div className="space-y-6">
          
          {/* Daily Schedule - Compact */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-400 line-through">09:00</span>
                    <div className="w-0.5 h-full bg-slate-100 mt-1"></div>
                  </div>
                  <div className="pb-4 opacity-50">
                     <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                      <p className="text-xs font-medium text-slate-600">Daily Standup</p>
                    </div>
                  </div>
                </div>
                 <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-900">14:00</span>
                    <div className="w-0.5 h-full bg-slate-200 mt-1"></div>
                  </div>
                  <div className="pb-4">
                     <div className="bg-white p-3 rounded-md border border-l-4 border-l-primary shadow-sm">
                      <p className="text-xs font-semibold text-slate-900">Security Audit Review</p>
                      <p className="text-[10px] text-muted-foreground">Teams Meeting • 30m</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EOD Checklist */}
          <EODChecklist />

          {/* Security Status Mini */}
          <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg text-white">
            <Shield className="w-5 h-5 text-green-400" />
            <div>
                <p className="text-xs font-medium">System Security</p>
                <p className="text-[10px] text-slate-400">Compliance: OK • MFA: Active</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
