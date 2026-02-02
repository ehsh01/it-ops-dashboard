import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { ShieldCheck, Loader2, AlertCircle, Mail } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

export default function Login() {
  const [_, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const inviteToken = params.get("token");
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(!!inviteToken);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { data: inviteValidation, isLoading: validatingInvite } = useQuery({
    queryKey: ["/api/auth/validate-invite", inviteToken],
    queryFn: async () => {
      if (!inviteToken) return null;
      const res = await fetch(`/api/auth/validate-invite?token=${inviteToken}`);
      return res.json();
    },
    enabled: !!inviteToken,
  });

  useEffect(() => {
    if (inviteToken) {
      setIsRegister(true);
    }
  }, [inviteToken]);

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/");
    },
    onError: (err: any) => {
      setError(err.message || "Invalid username or password");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; displayName: string; inviteToken: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/");
    },
    onError: (err: any) => {
      setError(err.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isRegister) {
      if (!inviteToken) {
        setError("An invitation is required to register");
        return;
      }
      if (!displayName.trim()) {
        setError("Display name is required");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      registerMutation.mutate({ username, password, displayName, inviteToken });
    } else {
      loginMutation.mutate({ username, password });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const showInviteError = inviteToken && inviteValidation && !inviteValidation.valid;
  const canRegister = inviteToken && inviteValidation?.valid;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto flex items-center justify-center mb-4">
             <img src="/um-logo.png" alt="University of Michigan" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            UM IT Operations
          </h1>
          <p className="text-sm text-slate-500">
            Secure System Administrator Console
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader>
            <CardTitle>{isRegister ? "Create Account" : "Sign in"}</CardTitle>
            <CardDescription>
              {isRegister 
                ? canRegister 
                  ? `Creating account for ${inviteValidation?.email}` 
                  : "You need an invitation to register"
                : "Enter your credentials to continue"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {validatingInvite ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-slate-500">Validating invitation...</span>
              </div>
            ) : showInviteError ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-900">Invalid Invitation</p>
                  <p className="text-sm text-slate-500 mt-1">{inviteValidation?.error}</p>
                </div>
                <Button variant="outline" onClick={() => setLocation("/login")}>
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    data-testid="input-username"
                    placeholder="Enter username" 
                    type="text" 
                    className="bg-slate-50"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    data-testid="input-password"
                    placeholder="Enter password" 
                    type="password" 
                    className="bg-slate-50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={isRegister ? 6 : 1}
                  />
                </div>

                {isRegister && canRegister && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword"
                        data-testid="input-confirm-password"
                        placeholder="Re-enter password" 
                        type="password" 
                        className="bg-slate-50"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input 
                        id="displayName"
                        data-testid="input-display-name"
                        placeholder="Your full name" 
                        type="text" 
                        className="bg-slate-50"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  data-testid="button-submit"
                  className="w-full bg-primary hover:bg-primary/90 h-10 transition-all" 
                  disabled={isLoading || (isRegister && !canRegister)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isRegister ? "Creating account..." : "Signing in..."}
                    </>
                  ) : (
                    isRegister ? "Create Account" : "Sign In"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 p-6">
            {!inviteToken && (
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-3 w-full">
                <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>This app is invitation-only. Contact an admin to request access.</span>
              </div>
            )}
            {inviteToken && canRegister && (
              <Button 
                variant="link" 
                data-testid="button-toggle-mode"
                className="text-sm"
                onClick={() => {
                  setLocation("/login");
                  setIsRegister(false);
                  setError("");
                }}
              >
                Already have an account? Sign in
              </Button>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
              <ShieldCheck className="w-3 h-3" />
              <span>Secure Authentication</span>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Authorized personnel only. All access is logged and audited.
        </p>
      </div>
    </div>
  );
}
