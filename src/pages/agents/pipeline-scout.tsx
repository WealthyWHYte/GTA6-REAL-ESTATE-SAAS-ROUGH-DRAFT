import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Database,
  Target,
  CheckCircle,
  ArrowLeft,
  FileText,
  TrendingUp
} from "lucide-react";

export default function PipelineScoutPage() {
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
                PIPELINE SCOUT
              </h1>
              <p className="text-vice-cyan font-body">Data processing & opportunity identification</p>
            </div>
          </div>
          <Badge variant="outline" className="border-vice-green text-vice-green text-lg px-4 py-2">
            ACTIVE
          </Badge>
        </div>

        {/* Stats Dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-pink flex items-center gap-2">
                <Upload className="w-4 h-4" />
                CSVs UPLOADED
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-pink">0</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-cyan flex items-center gap-2">
                <Database className="w-4 h-4" />
                PROPERTIES PROCESSED
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-cyan">0</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-orange flex items-center gap-2">
                <Target className="w-4 h-4" />
                SUCCESS RATE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-orange">--%</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-green flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                DATA QUALITY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-green">--/10</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <Card className="mission-card">
              <CardHeader>
                <CardTitle className="font-gta text-vice-pink">ACTIVITY FEED</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-gta text-muted-foreground mb-2">NO ACTIVITY YET</h3>
                  <p className="text-muted-foreground mb-6">
                    Upload your first PropWire CSV to start the pipeline scouting process
                  </p>
                  <Button
                    variant="neon-pink"
                    size="lg"
                    onClick={() => navigate("/upload")}
                    className="px-8"
                  >
                    <Upload className="mr-2 w-5 h-5" />
                    UPLOAD CSV FILE
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div>
            <Card className="mission-card">
              <CardHeader>
                <CardTitle className="font-gta text-vice-cyan">CONFIGURATION</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">Agent Settings:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Auto-process new uploads</li>
                    <li>• Quality threshold: 7/10</li>
                    <li>• Market filters: Active</li>
                    <li>• Notification alerts: Enabled</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Next Agent:</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-vice-orange" />
                    <span className="text-sm font-gta text-vice-orange">UNDERWRITER</span>
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
