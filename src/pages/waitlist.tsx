import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import {
  Mail,
  User,
  Send,
  MessageCircle,
  Hash,
  Gamepad2,
  Monitor,
  Users,
  Target,
  Zap,
  Building2,
  DollarSign
} from "lucide-react";

export default function WaitlistPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: '',
    discord: '',
    xbox: '',
    playstation: '',
    steam: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.email.trim()) {
        toast.error("Name and email are required!");
        return;
      }

      // Submit to Supabase
      const { error } = await supabase
        .from('waitlist')
        .insert([{
          name: formData.name.trim(),
          email: formData.email.trim(),
          telegram_username: formData.telegram.trim() || null,
          discord_username: formData.discord.trim() || null,
          xbox_gamertag: formData.xbox.trim() || null,
          playstation_psn: formData.playstation.trim() || null,
          steam_name: formData.steam.trim() || null,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Supabase error:', error);
        toast.error("Failed to join waitlist. Please try again.");
        return;
      }

      toast.success("🎮 Welcome to the crew! Redirecting to countdown...");
      setTimeout(() => {
        navigate('/countdown');
      }, 2000);

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: "🏙️",
      title: "EARLY ACCESS",
      description: "Be first to invest in South Florida real estate before GTA 6 drops"
    },
    {
      icon: "💰",
      title: "EXCLUSIVE DEALS",
      description: "Priority access to off-market properties and investment opportunities"
    },
    {
      icon: "🎮",
      title: "COMMUNITY PERKS",
      description: "Join a network of investors who love GTA and real estate"
    },
    {
      icon: "📈",
      title: "MARKET INSIGHTS",
      description: "Get weekly reports on Miami real estate trends and opportunities"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Neon Grid Lines */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-pink-400/30 to-transparent"></div>
        <div className="absolute top-1/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
        <div className="absolute bottom-1/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-orange-400/30 to-transparent"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl md:text-7xl font-gta font-black text-transparent bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text mb-2">
                  GTA6 REAL ESTATE
                </h1>
                <Badge variant="outline" className="border-cyan-400 text-cyan-400 text-lg px-4 py-1">
                  EARLY INVESTOR WAITLIST
                </Badge>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Join the exclusive community of investors positioning themselves in
              <span className="text-cyan-400 font-bold"> South Florida real estate </span>
              before Grand Theft Auto 6 transforms the market forever.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Benefits Section */}
            <div className="space-y-6">
              <Card className="bg-black/50 border border-cyan-400/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-center text-2xl font-gta text-cyan-400 flex items-center justify-center gap-2">
                    <Target className="w-6 h-6" />
                    WHY JOIN NOW?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-400/20">
                      <span className="text-3xl">{benefit.icon}</span>
                      <div>
                        <h3 className="font-gta text-cyan-400 font-bold mb-1">{benefit.title}</h3>
                        <p className="text-sm text-gray-300">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="bg-black/50 border border-pink-400/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-center text-xl font-gta text-pink-400">
                    📊 MARKET OPPORTUNITY
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-gta text-cyan-400">$2.8T</div>
                      <div className="text-sm text-gray-400">GTA 6 Economic Impact</div>
                    </div>
                    <div>
                      <div className="text-3xl font-gta text-pink-400">15%</div>
                      <div className="text-sm text-gray-400">Expected Miami Price Growth</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Waitlist Form */}
            <Card className="bg-black/50 border border-purple-400/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-gta text-purple-400 flex items-center justify-center gap-2">
                  <Users className="w-6 h-6" />
                  JOIN THE CREW
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Required Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-cyan-400 font-gta flex items-center gap-2">
                        <User className="w-4 h-4" />
                        FULL NAME *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="bg-gray-900/50 border-cyan-400/50 text-white placeholder-gray-400 focus:border-cyan-400"
                        placeholder="Enter your full name..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-cyan-400 font-gta flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        EMAIL ADDRESS *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-gray-900/50 border-cyan-400/50 text-white placeholder-gray-400 focus:border-cyan-400"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Gaming Platforms */}
                  <div className="space-y-4">
                    <Label className="text-purple-400 font-gta text-lg">GAMING PROFILES (OPTIONAL)</Label>

                    <div>
                      <Label htmlFor="telegram" className="text-pink-400 font-gta flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        TELEGRAM
                      </Label>
                      <Input
                        id="telegram"
                        type="text"
                        value={formData.telegram}
                        onChange={(e) => handleInputChange('telegram', e.target.value)}
                        className="bg-gray-900/50 border-pink-400/50 text-white placeholder-gray-400 focus:border-pink-400"
                        placeholder="@username"
                      />
                    </div>

                    <div>
                      <Label htmlFor="discord" className="text-purple-400 font-gta flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        DISCORD
                      </Label>
                      <Input
                        id="discord"
                        type="text"
                        value={formData.discord}
                        onChange={(e) => handleInputChange('discord', e.target.value)}
                        className="bg-gray-900/50 border-purple-400/50 text-white placeholder-gray-400 focus:border-purple-400"
                        placeholder="username#1234"
                      />
                    </div>

                    <div>
                      <Label htmlFor="xbox" className="text-green-400 font-gta flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4" />
                        XBOX GAMERTAG
                      </Label>
                      <Input
                        id="xbox"
                        type="text"
                        value={formData.xbox}
                        onChange={(e) => handleInputChange('xbox', e.target.value)}
                        className="bg-gray-900/50 border-green-400/50 text-white placeholder-gray-400 focus:border-green-400"
                        placeholder="YourGamertag"
                      />
                    </div>

                    <div>
                      <Label htmlFor="playstation" className="text-blue-400 font-gta flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4" />
                        PLAYSTATION PSN
                      </Label>
                      <Input
                        id="playstation"
                        type="text"
                        value={formData.playstation}
                        onChange={(e) => handleInputChange('playstation', e.target.value)}
                        className="bg-gray-900/50 border-blue-400/50 text-white placeholder-gray-400 focus:border-blue-400"
                        placeholder="YourPSN"
                      />
                    </div>

                    <div>
                      <Label htmlFor="steam" className="text-orange-400 font-gta flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        STEAM NAME
                      </Label>
                      <Input
                        id="steam"
                        type="text"
                        value={formData.steam}
                        onChange={(e) => handleInputChange('steam', e.target.value)}
                        className="bg-gray-900/50 border-orange-400/50 text-white placeholder-gray-400 focus:border-orange-400"
                        placeholder="YourSteamName"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-gta text-lg py-4 border-0"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        JOINING CREW...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        🚀 JOIN THE MISSION
                      </div>
                    )}
                  </Button>

                  <p className="text-center text-sm text-gray-400">
                    By joining, you agree to receive updates about GTA 6 real estate opportunities.
                    <br />
                    We respect your privacy and will never spam you.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              🎮 Powered by the same team bringing you GTA 6 countdown • Built for the real estate heist
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
