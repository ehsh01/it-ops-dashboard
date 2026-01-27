import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar as CalendarIcon, CheckSquare, Clock, Mail, MessageSquare, Plus, RefreshCw, Search, Filter, Shield } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operational Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, Admin. System status is nominal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 bg-white">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Now
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Tickets</p>
              <p className="text-2xl font-bold text-slate-900">12</p>
            </div>
            <div className="h-10 w-10 bg-orange-50 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Email</p>
              <p className="text-2xl font-bold text-slate-900">5</p>
            </div>
            <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Teams Mentions</p>
              <p className="text-2xl font-bold text-slate-900">3</p>
            </div>
            <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today's Events</p>
              <p className="text-2xl font-bold text-slate-900">4</p>
            </div>
            <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Feed: Unified Inbox */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  Unified Action Feed
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Search className="w-4 h-4 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Filter className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                
                {/* Item 1: High Priority Ticket */}
                <div className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer border-l-4 border-l-orange-500">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200 text-[10px] px-1.5 py-0">Urgent</Badge>
                      <span className="text-xs font-mono text-slate-400">INC-2024-001</span>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 10m ago
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">VPN Gateway Latency - Health Science Campus</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    Multiple users reporting slow connection speeds on the primary VPN gateway. Network logs showing high packet loss...
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs bg-white">Acknowledge</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs">View Ticket</Button>
                  </div>
                </div>

                {/* Item 2: Email */}
                <div className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 text-[10px] px-1.5 py-0">Email</Badge>
                      <span className="text-xs font-medium text-slate-600">Dr. Sarah Chen</span>
                    </div>
                    <span className="text-xs text-slate-400">24m ago</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Re: Access Request for Research Data</h3>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    Thanks for the update. Can we expedite the approval for the cardiology dataset?
                  </p>
                   <div className="mt-3 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="h-7 text-xs bg-white">Reply</Button>
                  </div>
                </div>

                {/* Item 3: Teams */}
                <div className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer border-l-4 border-l-purple-500">
                   <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200 text-[10px] px-1.5 py-0">Teams</Badge>
                      <span className="text-xs font-medium text-slate-600">SysAdmin Channel</span>
                    </div>
                    <span className="text-xs text-slate-400">1h ago</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Mentioned by Mike Ross</h3>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    @J.Doe Could you check the backup logs for Server-02? seeing some anomalies.
                  </p>
                </div>

                 {/* Item 4: Normal Ticket */}
                <div className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer border-l-4 border-l-slate-200">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-slate-600 bg-slate-100 border-slate-200 text-[10px] px-1.5 py-0">Task</Badge>
                      <span className="text-xs font-mono text-slate-400">REQ-2024-892</span>
                    </div>
                    <span className="text-xs text-slate-400">2h ago</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">New Hire Provisioning - Radiology</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    Standard laptop setup and PACS access required for new resident starting Monday.
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Context & Schedule */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-900">09:00</span>
                    <div className="w-0.5 h-full bg-slate-200 mt-1"></div>
                  </div>
                  <div className="pb-4">
                     <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
                      <p className="text-xs font-semibold text-primary">Daily Standup</p>
                      <p className="text-[10px] text-muted-foreground">Teams Meeting</p>
                    </div>
                  </div>
                </div>
                 <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-900">11:30</span>
                    <div className="w-0.5 h-full bg-slate-200 mt-1"></div>
                  </div>
                  <div className="pb-4">
                     <div className="bg-white p-3 rounded-md border border-slate-200">
                      <p className="text-xs font-semibold text-slate-700">Vendor Review: Cisco</p>
                      <p className="text-[10px] text-muted-foreground">Room 304</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">MFA Status</span>
                 <span className="text-green-400 font-mono text-xs">Enforced</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-300">Last Audit</span>
                 <span className="text-slate-400 font-mono text-xs">2h ago</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your session is valid until 17:00. <br/>
                  Compliance: <span className="text-green-400">HIPAA Compliant</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
