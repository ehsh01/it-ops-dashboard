import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLocation } from "wouter";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [_, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

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
    mutationFn: async (data: { username: string; password: string; displayName: string }) => {
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
      registerMutation.mutate({ username, password, displayName });
    } else {
      loginMutation.mutate({ username, password });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

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
              {isRegister ? "Set up your administrator account" : "Enter your credentials to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
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

              {isRegister && (
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
                disabled={isLoading}
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 p-6">
            <Button 
              variant="link" 
              data-testid="button-toggle-mode"
              className="text-sm"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setConfirmPassword("");
              }}
            >
              {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
            </Button>
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
