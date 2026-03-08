import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Store } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else if (isLogin) {
      toast.success("Welcome back!");
      navigate("/admin");
    } else {
      toast.success("Check your email to confirm your account");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-elevated">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full gradient-fresh">
              <Store className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="mt-3 text-xl font-bold font-display">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLogin ? "Sign in to manage your store" : "Start managing your store"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full gradient-fresh text-primary-foreground h-11" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-4 block w-full text-center text-sm text-primary hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
