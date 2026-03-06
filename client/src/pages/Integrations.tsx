import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertTriangle, Shield, Mail, Users, XCircle, Ticket, Loader2, ExternalLink, Unplug, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

type IntegrationStatus = {
  configured: boolean;
  connected: boolean;
  expiresAt: string | null;
};

export default function Integrations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Microsoft
  const { data: microsoftStatus, isLoading: statusLoading } = useQuery<IntegrationStatus>({
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

  // Google
  const { data: googleStatus, isLoading: googleStatusLoading } = useQuery<IntegrationStatus>({
    queryKey: ["/api/google/status"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const googleConnectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/google/authorize");
      return res.json();
    },
    onSuccess: (data) => {
      window.location.href = data.authUrl;
    },
    onError: (err: any) => {
      toast({ title: "Connection Failed", description: err.message, variant: "destructive" });
    },
  });

  const googleDisconnectMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/google/disconnect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/google/status"] });
      toast({ title: "Disconnected", description: "Google account disconnected successfully" });
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
    } else if (success === "google_connected") {
      toast({ title: "Connected!", description: "Google account connected successfully" });
      window.history.replaceState({}, "", "/integrations");
      queryClient.invalidateQueries({ queryKey: ["/api/google/status"] });
    } else if (error) {
      toast({ title: "Connection Failed", description: error, variant: "destructive" });
      window.history.replaceState({}, "", "/integrations");
    }
  }, [location, toast, queryClient]);

  const isConnected = microsoftStatus?.connected;
  const isConfigured = microsoftStatus?.configured;
  const isGoogleConnected = googleStatus?.connected;
  const isGoogleConfigured = googleStatus?.configured;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Integration Settings</h2>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Connect your accounts to sync emails, calendar events, and messages into your action feed.
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
            <Mail className="h-5 w-5" />
            Google (Gmail + Calendar)
          </CardTitle>
          <CardDescription>
            Connect your Google account to sync Gmail emails and Google Calendar events into your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleStatusLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking connection status...
            </div>
          ) : !isGoogleConfigured ? (
            <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Configuration Required</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Google integration requires OAuth2 credentials from Google Cloud Console. Please set the following environment variables:
                  </p>
                  <ul className="text-sm text-amber-700 mt-2 list-disc list-inside">
                    <li>GOOGLE_CLIENT_ID</li>
                    <li>GOOGLE_CLIENT_SECRET</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : isGoogleConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border rounded shadow-sm">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Connected to Google</p>
                    <p className="text-sm text-green-600">
                      Gmail emails and calendar events are being synced
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
                onClick={() => googleDisconnectMutation.mutate()}
                disabled={googleDisconnectMutation.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {googleDisconnectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Unplug className="h-4 w-4 mr-2" />
                )}
                Disconnect Google Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Click the button below to connect your Google account. You'll be redirected to Google to grant permission.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  Read your Gmail emails (gmail.readonly)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  Read your calendar events (calendar.readonly)
                </li>
              </ul>
              <Button
                onClick={() => googleConnectMutation.mutate()}
                disabled={googleConnectMutation.isPending}
                className="bg-[#4285F4] hover:bg-[#3367D6]"
              >
                {googleConnectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Connect Google Account
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
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border rounded shadow-sm">
                    <Users className="w-6 h-6 text-[#6264A7]" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Teams Connected</p>
                    <p className="text-sm text-green-600">
                      Your Teams chats and channels are being synced
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-2 animate-pulse"></span>
                  Active
                </Badge>
              </div>
              <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Channel Messages Require Admin Consent</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Reading channel messages requires your IT administrator to grant admin consent for the app. 
                      Personal chats and @mentions should work without admin consent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-slate-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-600">Connect Microsoft First</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Teams integration is included when you connect your Microsoft account above. 
                    Connect your Microsoft account to enable Teams sync.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
