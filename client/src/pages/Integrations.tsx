import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertTriangle, Shield, Mail, Users, Calendar, ArrowRight, RefreshCw, XCircle, Ticket } from "lucide-react";

export default function Integrations() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Integration Strategy</h2>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Manage how the console connects to corporate data sources. Select the highest available tier approved by your organization's policies.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Tier 1: Gold */}
        <Card className="border-primary/50 shadow-md ring-1 ring-primary/20 relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
          <div className="absolute top-0 right-0 p-3">
            <Badge className="bg-primary text-white hover:bg-primary">Recommended</Badge>
          </div>
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Tier 1: Enterprise</CardTitle>
            <CardDescription>Admin-Consented Graph API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Full background synchronization using Application Permissions. Requires Global Admin consent.
            </p>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-600"/> Real-time Ticket Sync</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-600"/> Background Mail Processing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-600"/> Teams Activity Feed</li>
            </ul>
            <Separator />
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded text-xs font-medium border border-green-100">
              <CheckCircle2 className="w-4 h-4" />
              Active Integration
            </div>
          </CardContent>
        </Card>

        {/* Tier 2: Silver */}
        <Card>
          <CardHeader>
             <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
            <CardTitle>Tier 2: Delegated</CardTitle>
            <CardDescription>User-Consented Access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Operates only while you are active. Uses standard OAuth scopes (Mail.Read, Calendars.Read).
            </p>
             <ul className="text-xs space-y-2 text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-slate-400"/> Session-based Sync</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-slate-400"/> Read-only Mail</li>
              <li className="flex items-center gap-2"><XCircle className="w-3 h-3 text-slate-300"/> No Background Agents</li>
            </ul>
            <Separator />
            <Button variant="outline" className="w-full text-xs">Switch to Delegated</Button>
          </CardContent>
        </Card>

        {/* Tier 3: Bronze */}
        <Card className="opacity-90">
          <CardHeader>
             <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle>Tier 3: Fallback</CardTitle>
            <CardDescription>Email Ingestion Only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              For restricted environments. Forward alert emails to <code>inbox@ops.internal</code> for processing.
            </p>
             <ul className="text-xs space-y-2 text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-slate-400"/> Parse Ticket Emails</li>
              <li className="flex items-center gap-2"><XCircle className="w-3 h-3 text-slate-300"/> No Teams Integration</li>
              <li className="flex items-center gap-2"><XCircle className="w-3 h-3 text-slate-300"/> Manual Sync Only</li>
            </ul>
            <Separator />
            <Button variant="outline" className="w-full text-xs">Configure Ingestion</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white border rounded shadow-sm">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-sm">Microsoft Graph API</p>
                  <p className="text-xs text-muted-foreground">Scopes: Mail.Read, Teams.ReadBasic, Calendars.Read</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-2 animate-pulse"></span>
                  Connected
                </Badge>
                <Button variant="ghost" size="icon">
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white border rounded shadow-sm">
                  <Ticket className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">ServiceNow / ITSM</p>
                  <p className="text-xs text-muted-foreground">Connected via REST API Proxy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-2 animate-pulse"></span>
                  Connected
                </Badge>
                <Button variant="ghost" size="icon">
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
