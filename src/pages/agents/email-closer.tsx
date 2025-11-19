import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Eye,
  MessageSquare,
  Trophy,
  ArrowLeft,
  Target
} from "lucide-react";

export default function EmailCloserPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/command-center")}
              className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              BACK TO COMMAND CENTER
            </Button>
            <div>
              <h1 className="text-4xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text">
                EMAIL CLOSER
              </h1>
              <p className="text-vice-cyan font-body">Negotiation & relationship management</p>
            </div>
          </div>
          <Badge variant="outline" className="border-muted text-muted-foreground text-lg px-4 py-2">
            STANDBY
          </Badge>
        </div>

        {/* Stats Dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-pink flex items-center gap-2">
                <Mail className="w-4 h-4" />
                EMAILS SENT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-pink">0</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-cyan flex items-center gap-2">
                <Eye className="w-4 h-4" />
                OPEN RATE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-cyan">--%</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-orange flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                RESPONSE RATE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-orange">--%</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-green flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                DEALS CLOSED
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-green">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <Card className="mission-card">
              <CardHeader>
                <CardTitle className="font-gta text-vice-pink">NEGOTIATION CAMPAIGN</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-gta text-muted-foreground mb-2">NO NEGOTIATIONS ACTIVE</h3>
                  <p className="text-muted-foreground mb-6">
                    Contract Specialist will send signed contracts here for closing
                  </p>
                  <Button
                    variant="neon-yellow"
                    size="lg"
                    onClick={() => navigate("/agent/contract-specialist")}
                    className="px-8"
                  >
                    <Target className="mr-2 w-5 h-5" />
                    CHECK CONTRACT SPECIALIST
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div>
            <Card className="mission-card">
              <CardHeader>
                <CardTitle className="font-gta text-vice-cyan">NEGOTIATION SCRIPTS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">Communication Strategies:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Initial outreach</li>
                    <li>• Follow-up sequences</li>
                    <li>• Objection handling</li>
                    <li>• Closing techniques</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Final Stage:</p>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-vice-green" />
                    <span className="text-sm font-gta text-vice-green">DEAL CLOSED</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
