// src/pages/heist-mission/[dataset_id].tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";

interface Dataset {
  dataset_id: string;
  name: string;
  status: string;
  row_count: number;
  processed_count: number;
  error_count: number;
  created_at: string;
}

interface Property {
  property_id: string;
  property_address: string;
  city: string;
  state: string;
  status: string;
  list_price: number;
  created_at: string;
}

export default function HeistMissionPage() {
  const { dataset_id } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Dataset | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch mission data
  const fetchMissionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get dataset info - SECURE with account_id
      const { data: datasetData, error: datasetError } = await supabase
        .from("datasets")
        .select("*")
        .eq("dataset_id", dataset_id)
        .eq("account_id", user.id)
        .single();

      if (datasetError) throw datasetError;
      setMission(datasetData);

      // Get recent properties - SECURE with account_id
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .eq("dataset_id", dataset_id)
        .eq("account_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching mission data:", error);
      setLoading(false);
    }
  };

  // Poll for updates every 5 seconds
  useEffect(() => {
    fetchMissionData();
    const interval = setInterval(fetchMissionData, 5000);
    return () => clearInterval(interval);
  }, [dataset_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-vice-cyan animate-spin mx-auto mb-4" />
          <p className="text-xl text-vice-cyan">Loading mission data...</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-vice-orange mx-auto mb-4" />
          <p className="text-xl text-vice-orange">Mission not found</p>
          <Button onClick={() => navigate("/mission-briefing")} className="mt-4">
            Back to Briefing
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage = mission.row_count > 0 
    ? Math.round((mission.processed_count / mission.row_count) * 100)
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
            🎯 HEIST MISSION
          </h1>
          <p className="text-2xl text-vice-cyan font-gta">{mission.name}</p>
          <div className="mt-4">{getStatusBadge(mission.status)}</div>
        </div>

        {/* Mission Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-vice-pink font-gta">TOTAL PROPERTIES</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-vice-cyan">{mission.row_count}</p>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-vice-orange font-gta">PROCESSED</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-vice-green">{mission.processed_count}</p>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-vice-yellow font-gta">ERRORS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-vice-pink">{mission.error_count}</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mission-card mb-8">
          <CardHeader>
            <CardTitle className="text-vice-cyan font-gta">MISSION PROGRESS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progressPercentage} className="h-4" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {mission.processed_count} / {mission.row_count} properties analyzed
                </span>
                <span className="text-vice-cyan font-bold">{progressPercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Agents Active */}
        <Card className="mission-card mb-8">
          <CardHeader>
            <CardTitle className="text-vice-pink font-gta">🤖 AI AGENTS ACTIVE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-vice-cyan animate-spin" />
                <span className="text-vice-cyan">🔍 Scout Agent: Analyzing properties</span>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-vice-orange animate-spin" />
                <span className="text-vice-orange">💰 Underwriter: Calculating deals</span>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-vice-yellow animate-spin" />
                <span className="text-vice-yellow">📧 Outreach Agent: Drafting emails</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mission-card mb-8">
          <CardHeader>
            <CardTitle className="text-vice-green font-gta">📊 RECENT ACTIVITY</CardTitle>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No properties processed yet...
              </p>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div
                    key={property.property_id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg border border-vice-cyan/20"
                  >
                    <div>
                      <p className="font-gta text-vice-cyan">{property.property_address}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.city}, {property.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-vice-green font-bold">
                        ${property.list_price?.toLocaleString() || "N/A"}
                      </p>
                      <Badge variant="outline" className="border-vice-green text-vice-green mt-1">
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="neon-cyan"
            size="lg"
            onClick={() => navigate(`/properties?dataset=${dataset_id}`)}
          >
            📋 VIEW ALL PROPERTIES
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