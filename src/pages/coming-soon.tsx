import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Construction,
  ArrowLeft,
  Clock,
  Zap,
  Building2,
  Users,
  Target
} from "lucide-react";

export default function ComingSoonPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🏗️",
      title: "PLATFORM CONSTRUCTION",
      description: "Building the ultimate real estate acquisition system"
    },
    {
      icon: "🎯",
      title: "AGENT TRAINING",
      description: "Fine-tuning AI agents for maximum deal flow"
    },
    {
      icon: "💰",
      title: "MARKET ANALYSIS",
      description: "Analyzing South Florida real estate trends"
    },
    {
      icon: "🚀",
      title: "LAUNCH PREPARATION",
      description: "Preparing for the big reveal"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-vice-orange to-vice-yellow rounded-full flex items-center justify-center">
              <Construction className="w-10 h-10 text-black" />
            </div>
          </div>

          <h1 className="text-6xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text mb-4">
            🚧 HEIST PREP IN PROGRESS 🚧
          </h1>

          <div className="text-vice-cyan text-xl font-body mb-8">
            The GTA 6 Real Estate platform is being built. We'll notify you when it's ready to launch.
          </div>

          <div className="flex items-center justify-center gap-2 text-vice-yellow text-lg mb-8">
            <Clock className="w-6 h-6" />
            <span>Check back soon, operative.</span>
          </div>
        </div>

        {/* Main Content */}
        <Card className="mission-card mb-8">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-gta text-vice-orange">
              WHAT'S BEING BUILT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-vice-orange/10 to-vice-yellow/10 border border-vice-orange/20">
                  <span className="text-3xl">{feature.icon}</span>
                  <div>
                    <h3 className="font-gta text-vice-orange font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <Card className="mission-card mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-gta text-vice-cyan">
              DEVELOPMENT PROGRESS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Platform Foundation</span>
                <span className="text-vice-green">✅ COMPLETE</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>AI Agent System</span>
                <span className="text-vice-green">✅ COMPLETE</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>User Authentication</span>
                <span className="text-vice-green">✅ COMPLETE</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Property Database</span>
                <span className="text-vice-yellow">🔄 IN PROGRESS</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Deal Flow Automation</span>
                <span className="text-muted-foreground">⏳ PENDING</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Launch Preparation</span>
                <span className="text-muted-foreground">⏳ PENDING</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button
            variant="neon-cyan"
            size="lg"
            onClick={() => navigate("/")}
            className="text-lg px-8 mb-4"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            BACK TO COUNTDOWN
          </Button>

          <p className="text-muted-foreground text-sm">
            Want to stay updated? Join our Telegram community for the latest updates.
          </p>
        </div>
      </div>
    </div>
  );
}
