// src/pages/auth/register-page.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            company_name: companyName,
          },
        },
      });

      if (authError) throw authError;

      // 2. Create account record
      const { error: accountError } = await supabase.from("accounts").insert({
        id: authData.user!.id,
        email,
        display_name: displayName,
        company_name: companyName,
        subscription_tier: "free",
      });

      if (accountError) throw accountError;

      toast({
        title: "🎉 CREW MEMBER ACTIVATED",
        description: "Welcome to the operation.",
      });

      navigate("/coming-soon");
    } catch (error: any) {
      toast({
        title: "❌ RECRUITMENT FAILED",
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
            RECRUIT
          </h1>
          <div className="flex items-center justify-center gap-2 text-vice-orange text-xl">
            <span className="text-2xl">👤</span>
            <span>NEW OPERATIVE REGISTRATION</span>
          </div>
        </div>

        {/* Registration Form */}
        <div className="mission-card p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <Label htmlFor="displayName" className="text-vice-pink font-gta text-sm mb-2 block">
                🎭 OPERATIVE CODENAME
              </Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-muted border-vice-pink/20 text-foreground focus:border-vice-pink"
                placeholder="Ghost, Shadow, Phoenix..."
                required
              />
            </div>

            <div>
              <Label htmlFor="companyName" className="text-vice-orange font-gta text-sm mb-2 block">
                🏢 ORGANIZATION (OPTIONAL)
              </Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-muted border-vice-orange/20 text-foreground focus:border-vice-orange"
                placeholder="Your crew or company name"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-vice-cyan font-gta text-sm mb-2 block">
                📧 SECURE EMAIL
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
              <Label htmlFor="password" className="text-vice-yellow font-gta text-sm mb-2 block">
                🔐 ACCESS CODE
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted border-vice-yellow/20 text-foreground focus:border-vice-yellow"
                placeholder="Min. 8 characters"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="neon-orange"
              className="w-full text-lg font-gta"
            >
              {loading ? (
                <>
                  <span className="animate-pulse">⚙️ CREATING PROFILE...</span>
                </>
              ) : (
                <>
                  🚀 JOIN THE HEIST
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-muted-foreground">
            ALREADY PART OF THE CREW?
          </p>
          <Link to="/login">
            <Button variant="neon-cyan" className="mt-3 font-gta">
              🔓 ACCESS YOUR ACCOUNT
            </Button>
          </Link>
        </div>

        {/* Flavor Text */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>⚠️ BY JOINING, YOU AGREE TO THE HEIST PROTOCOLS</p>
          <p className="text-vice-green">ENCRYPTION LEVEL: MAXIMUM</p>
        </div>
      </div>
    </div>
  );
}