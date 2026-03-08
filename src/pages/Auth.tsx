import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Store, User } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "user";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdminMode = mode === "admin";

  // Customer: sign up with a dummy password (auto-confirmed, no verification)
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);

    // Try signing in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: "customer-auto-login",
    });

    if (!signInError) {
      setLoading(false);
      toast.success("Welcome back!");
      navigate("/");
      return;
    }

    // If sign-in fails, sign up (auto-confirmed)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: "customer-auto-login",
    });

    setLoading(false);
    if (signUpError) {
      toast.error(signUpError.message);
    } else {
      toast.success("Welcome!");
      navigate("/");
    }
  };

  // Owner: Password login only
  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Invalid credentials. Only registered owners can sign in.");
    } else {
      toast.success("Welcome back!");
      navigate("/admin");
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
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
              isAdminMode ? "gradient-fresh" : "bg-primary/10"
            }`}>
              {isAdminMode ? (
                <Store className="h-7 w-7 text-primary-foreground" />
              ) : (
                <User className="h-7 w-7 text-primary" />
              )}
            </div>
            <h1 className="mt-3 text-xl font-bold font-display">
              {isAdminMode ? "Owner Login" : "Customer Login"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdminMode
                ? "Sign in with your owner credentials"
                : "Enter your email to continue"}
            </p>
          </div>

          {isAdminMode ? (
            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@store.com"
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
                className="w-full h-11 gradient-fresh text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Continue"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
