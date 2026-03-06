import { useQuery } from "@tanstack/react-query";
import { TimeAwareHeader } from "@/components/dashboard/TimeAwareHeader";
import { InsightMetrics } from "@/components/dashboard/InsightMetrics";
import { ActionFeed } from "@/components/dashboard/ActionFeed";
import { EODChecklist } from "@/components/dashboard/EODChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Calendar, Loader2, Settings } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { Link } from "wouter";

type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  location: string | null;
  hangoutLink: string | null;
  status: string;
  isAllDay: boolean;
};

type GoogleStatus = {
  configured: boolean;
  connected: boolean;
  expiresAt: string | null;
};

function formatEventTime(isoString: string): string {
  if (!isoString || !isoString.includes("T")) return "All day";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function getEventDuration(start: string, end: string): string {
  if (!start.includes("T") || !end.includes("T")) return "All day";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

function isEventPast(endTime: string): boolean {
  if (!endTime.includes("T")) return false;
  return new Date(endTime).getTime() < Date.now();
}

function TodaySchedule() {
  const { data: googleStatus } = useQuery<GoogleStatus>({
    queryKey: ["/api/google/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: events, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/google/calendar/events"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!googleStatus?.connected,
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!googleStatus?.connected ? (
          <div className="text-center py-4">
            <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 mb-2">Connect Google to see your calendar</p>
            <Link href="/integrations" className="text-xs text-primary hover:underline flex items-center justify-center gap-1">
              <Settings className="h-3 w-3" />
              Integration Settings
            </Link>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-slate-500">No events scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const past = isEventPast(event.end);
              return (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-bold ${past ? "text-slate-400 line-through" : "text-slate-900"}`}>
                      {formatEventTime(event.start)}
                    </span>
                    <div className={`w-0.5 h-full mt-1 ${past ? "bg-slate-100" : "bg-slate-200"}`}></div>
                  </div>
                  <div className={`pb-3 flex-1 ${past ? "opacity-50" : ""}`}>
                    <div className={`p-2 rounded-md border ${past ? "bg-slate-50 border-slate-100" : "bg-white border-l-4 border-l-primary shadow-sm"}`}>
                      <p className={`text-xs font-medium ${past ? "text-slate-600" : "text-slate-900 font-semibold"}`}>
                        {event.summary}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {getEventDuration(event.start, event.end)}
                        {event.location ? ` • ${event.location}` : ""}
                        {event.hangoutLink ? " • Google Meet" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      <TimeAwareHeader />

      <InsightMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        
        <div className="lg:col-span-2 h-full">
          <ActionFeed />
        </div>

        <div className="space-y-6">
          
          <TodaySchedule />

          <EODChecklist />

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
