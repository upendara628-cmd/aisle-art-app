import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Store, User, ArrowLeft, Mail } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "user";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const isAdminMode = mode === "admin";

  // Customer: Magic link flow
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setMagicLinkSent(true);
      toast.success("Magic link sent to your email!");
    }
  };

  // Owner: Password login only (no signup)
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
              onClick={() => { navigate("/auth?mode=user", { replace: true }); setMagicLinkSent(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                !isAdminMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              Customer
            </button>
            <button
              onClick={() => { navigate("/auth?mode=admin", { replace: true }); setMagicLinkSent(false); }}
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
              isAdminMode ? "gradient-fresh" : magicLinkSent ? "bg-primary/10" : "bg-primary/10"
            }`}>
              {isAdminMode ? (
                <Store className="h-7 w-7 text-primary-foreground" />
              ) : magicLinkSent ? (
                <Mail className="h-7 w-7 text-primary" />
              ) : (
                <User className="h-7 w-7 text-primary" />
              )}
            </div>
            <h1 className="mt-3 text-xl font-bold font-display">
              {isAdminMode
                ? "Owner Login"
                : magicLinkSent
                ? "Check Your Email"
                : "Customer Login"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdminMode
                ? "Sign in with your owner credentials"
                : magicLinkSent
                ? `We sent a sign-in link to ${email}`
                : "Sign in to reserve items from the store"}
            </p>
          </div>

          {isAdminMode ? (
            /* Owner: email + password only */
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
          ) : !magicLinkSent ? (
            /* Customer: send magic link */
            <form onSubmit={handleSendMagicLink} className="space-y-4">
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
                {loading ? "Sending..." : "Send Sign-In Link"}
              </Button>
            </form>
          ) : (
            /* Customer: magic link sent confirmation */
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-foreground font-medium">
                  Click the link in your email to sign in
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check your spam folder if you don't see it
                </p>
              </div>
              <Button
                onClick={handleSendMagicLink as any}
                variant="outline"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend Link"}
              </Button>
              <button
                onClick={() => { setMagicLinkSent(false); }}
                className="flex items-center justify-center gap-1 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change email
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
