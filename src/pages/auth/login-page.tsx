// src/pages/auth/login-page.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "🎯 ACCESS GRANTED",
        description: "Welcome back to the heist crew.",
      });

      navigate("/mission-briefing");
    } catch (error: any) {
      toast({
        title: "❌ ACCESS DENIED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text mb-4">
            CREW LOGIN
          </h1>
          <div className="flex items-center justify-center gap-2 text-vice-cyan text-xl">
            <span className="text-2xl">🔐</span>
            <span>SECURITY CLEARANCE REQUIRED</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="mission-card p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-vice-cyan font-gta text-sm mb-2 block">
                📧 OPERATIVE EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted border-vice-cyan/20 text-foreground focus:border-vice-cyan"
                placeholder="your.email@heistcrew.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-vice-cyan font-gta text-sm mb-2 block">
                🔑 SECURITY CODE
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted border-vice-cyan/20 text-foreground focus:border-vice-cyan"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="neon-pink"
              className="w-full text-lg font-gta"
            >
              {loading ? (
                <>
                  <span className="animate-pulse">⚙️ AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  🚀 INITIATE HEIST
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-muted-foreground">
            NOT PART OF THE CREW YET?
          </p>
          <Link to="/register">
            <Button variant="neon-cyan" className="mt-3 font-gta">
              📋 JOIN THE OPERATION
            </Button>
          </Link>
        </div>

        {/* Flavor Text */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>⚠️ UNAUTHORIZED ACCESS IS PROHIBITED</p>
          <p className="text-vice-yellow">SECURITY LEVEL: CLASSIFIED</p>
        </div>
      </div>
    </div>
  );
}