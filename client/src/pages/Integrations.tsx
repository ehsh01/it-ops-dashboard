import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertTriangle, Shield, Mail, Users, XCircle, Ticket, Loader2, ExternalLink, Unplug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

type MicrosoftStatus = {
  configured: boolean;
  connected: boolean;
  expiresAt: string | null;
};

export default function Integrations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  const { data: microsoftStatus, isLoading: statusLoading } = useQuery<MicrosoftStatus>({
    queryKey: ["/api/microsoft/status"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/microsoft/authorize");
      return res.json();
    },
    onSuccess: (data) => {
      window.location.href = data.authUrl;
    },
    onError: (err: any) => {
      toast({ title: "Connection Failed", description: err.message, variant: "destructive" });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/microsoft/disconnect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/microsoft/status"] });
      toast({ title: "Disconnected", description: "Microsoft account disconnected successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Disconnect Failed", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success === "microsoft_connected") {
      toast({ title: "Connected!", description: "Microsoft account connected successfully" });
      window.history.replaceState({}, "", "/integrations");
      queryClient.invalidateQueries({ queryKey: ["/api/microsoft/status"] });
    } else if (error) {
      toast({ title: "Connection Failed", description: error, variant: "destructive" });
      window.history.replaceState({}, "", "/integrations");
    }
  }, [location, toast, queryClient]);

  const isConnected = microsoftStatus?.connected;
  const isConfigured = microsoftStatus?.configured;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Integration Settings</h2>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Connect your Microsoft Office 365 account to sync emails and calendar events into your action feed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Microsoft Office 365
          </CardTitle>
          <CardDescription>
            Connect your Outlook email to automatically import action items from important messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking connection status...
            </div>
          ) : !isConfigured ? (
            <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Configuration Required</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Microsoft integration requires Azure AD app credentials. Please set the following environment variables:
                  </p>
                  <ul className="text-sm text-amber-700 mt-2 list-disc list-inside">
                    <li>MICROSOFT_CLIENT_ID</li>
                    <li>MICROSOFT_CLIENT_SECRET</li>
                    <li>MICROSOFT_TENANT_ID (optional, defaults to "common")</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border rounded shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Connected to Microsoft</p>
                    <p className="text-sm text-green-600">
                      Your Outlook emails are being synced
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-2 animate-pulse"></span>
                  Active
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                data-testid="button-disconnect-microsoft"
              >
                {disconnectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Unplug className="h-4 w-4 mr-2" />
                )}
                Disconnect Microsoft Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Click the button below to connect your Microsoft account. You'll be redirected to Microsoft to grant permission.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  Read your emails (Mail.Read)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  Access your profile information (User.Read)
                </li>
              </ul>
              <Button
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
                className="bg-[#0078D4] hover:bg-[#106EBE]"
                data-testid="button-connect-microsoft"
              >
                {connectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Connect Microsoft Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            ServiceNow
          </CardTitle>
          <CardDescription>
            Connect to your ServiceNow instance to sync tickets and work orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-slate-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium text-slate-600">Coming Soon</p>
                <p className="text-sm text-slate-500 mt-1">
                  ServiceNow integration will be available in a future update. Contact your administrator for API access.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Microsoft Teams
          </CardTitle>
          <CardDescription>
            Get notified about mentions and important channel messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-slate-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium text-slate-600">Requires Admin Consent</p>
                <p className="text-sm text-slate-500 mt-1">
                  Teams integration requires your IT administrator to approve the ChannelMessage.Read.All permission. 
                  Consider forwarding important Teams notifications to your email instead.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
