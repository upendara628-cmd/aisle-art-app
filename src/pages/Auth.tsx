import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Store, User } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "user"; // "user" or "admin"
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const isAdminMode = mode === "admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);

    if (isRegister) {
      const { error } = await signUp(email, password);
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! You can now sign in.");
        setIsRegister(false);
      }
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate(isAdminMode ? "/admin" : "/");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-elevated">
        <CardContent className="p-6">
          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            <button
              onClick={() => navigate("/auth?mode=user", { replace: true })}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                !isAdminMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              Customer
            </button>
            <button
              onClick={() => navigate("/auth?mode=admin", { replace: true })}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                isAdminMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Store className="h-4 w-4" />
              Owner
            </button>
          </div>

          <div className="text-center mb-6">
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${isAdminMode ? "gradient-fresh" : "bg-primary/10"}`}>
              {isAdminMode ? (
                <Store className="h-7 w-7 text-primary-foreground" />
              ) : (
                <User className="h-7 w-7 text-primary" />
              )}
            </div>
            <h1 className="mt-3 text-xl font-bold font-display">
              {isRegister
                ? isAdminMode ? "Owner Registration" : "Create Account"
                : isAdminMode ? "Owner Login" : "Customer Login"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isRegister
                ? isAdminMode ? "Create your owner account" : "Sign up to reserve items"
                : isAdminMode ? "Sign in to manage your store" : "Sign in to reserve items from the store"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdminMode ? "owner@store.com" : "you@email.com"}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className={`w-full h-11 ${isAdminMode ? "gradient-fresh text-primary-foreground" : "bg-primary text-primary-foreground"}`}
              disabled={loading}
            >
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-2"
            onClick={async () => {
              const { error } = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (error) {
                toast.error(error.message);
              }
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <button
            onClick={() => setIsRegister(!isRegister)}
            className="mt-4 block w-full text-center text-sm text-primary hover:underline"
          >
            {isRegister ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
