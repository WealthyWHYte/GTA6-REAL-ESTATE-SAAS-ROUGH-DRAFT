// src/pages/mission-control.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Dataset {
  dataset_id: string;
  name: string;
  status: string;
  row_count: number;
  processed_count: number;
  error_count: number;
  created_at: string;
}

export default function MissionControlPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  const datasetIds = searchParams.get("datasets")?.split(",") || [];

  // Fetch all mission data
  const fetchMissionsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // SECURE query with account_id
      const { data, error } = await supabase
        .from("datasets")
        .select("*")
        .in("dataset_id", datasetIds)
        .eq("account_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMissions(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching missions:", error);
      setLoading(false);
    }
  };

  // Poll for updates every 5 seconds
  useEffect(() => {
    if (datasetIds.length === 0) {
      navigate("/mission-briefing");
      return;
    }

    fetchMissionsData();
    const interval = setInterval(fetchMissionsData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-vice-cyan animate-spin mx-auto mb-4" />
          <p className="text-xl text-vice-cyan">Loading mission control...</p>
        </div>
      </div>
    );
  }

  const totalProperties = missions.reduce((sum, m) => sum + m.row_count, 0);
  const totalProcessed = missions.reduce((sum, m) => sum + m.processed_count, 0);
  const totalErrors = missions.reduce((sum, m) => sum + m.error_count, 0);
  const overallProgress = totalProperties > 0 
    ? Math.round((totalProcessed / totalProperties) * 100)
    : 0;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: string }> = {
      PROCESSING: { color: "border-vice-orange text-vice-orange", icon: "⚙️" },
      COMPLETED: { color: "border-vice-green text-vice-green", icon: "✅" },
      FAILED: { color: "border-vice-pink text-vice-pink", icon: "❌" },
    };
    const config = statusConfig[status] || statusConfig.PROCESSING;
    return (
      <Badge variant="outline" className={config.color}>
        {config.icon} {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text mb-4">
            🎯 MULTI-MISSION CONTROL
          </h1>
          <p className="text-2xl text-vice-cyan font-gta">
            {missions.length} Heist Missions Active
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-vice-pink font-gta text-sm">ACTIVE MISSIONS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-vice-cyan">{missions.length}</p>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-vice-cyan font-gta text-sm">TOTAL PROPERTIES</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-vice-pink">{totalProperties}</p>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-vice-orange font-gta text-sm">PROCESSED</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-vice-green">{totalProcessed}</p>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-vice-yellow font-gta text-sm">ERRORS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-vice-orange">{totalErrors}</p>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="mission-card mb-8">
          <CardHeader>
            <CardTitle className="text-vice-cyan font-gta">OVERALL PROGRESS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={overallProgress} className="h-4" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {totalProcessed} / {totalProperties} properties analyzed across all missions
                </span>
                <span className="text-vice-cyan font-bold">{overallProgress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Missions */}
        <div className="space-y-6">
          <h2 className="text-3xl font-gta text-vice-pink neon-text">INDIVIDUAL MISSIONS</h2>

          {missions.map((mission) => {
            const progress = mission.row_count > 0
              ? Math.round((mission.processed_count / mission.row_count) * 100)
              : 0;

            return (
              <Card key={mission.dataset_id} className="mission-card">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-vice-cyan font-gta">{mission.name}</CardTitle>
                    {getStatusBadge(mission.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-vice-pink">{mission.row_count}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-vice-green">{mission.processed_count}</p>
                      <p className="text-xs text-muted-foreground">Processed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-vice-orange">{mission.error_count}</p>
                      <p className="text-xs text-muted-foreground">Errors</p>
                    </div>
                  </div>

                  <Progress value={progress} className="h-2 mb-4" />

                  <div className="flex gap-3">
                    <Button
                      variant="neon-cyan"
                      size="sm"
                      onClick={() => navigate(`/heist-mission/${mission.dataset_id}`)}
                    >
                      📊 View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/properties?dataset=${mission.dataset_id}`)}
                    >
                      📋 View Properties
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button
            variant="neon-pink"
            size="lg"
            onClick={() => navigate("/upload")}
          >
            📤 UPLOAD MORE FILES
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/mission-briefing")}
          >
            ← BACK TO BRIEFING
          </Button>
        </div>
      </div>
    </div>
  );
}