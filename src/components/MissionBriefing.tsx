// src/components/MissionBriefing.tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import IntensityMeter from "./IntensityMeter";

interface MissionBriefingProps {
  onStartMission: () => void;
}

const MissionBriefing = ({ onStartMission }: MissionBriefingProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text mb-4">
            OPERATION: PROPERTY DOMINANCE
          </h1>
          <div className="text-vice-cyan text-xl font-body">
            LOCATION: Any Market, Any Price Point | OBJECTIVE: Acquire 9 properties daily
          </div>
        </div>

        {/* Mission Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="mission-card">
            <h2 className="text-2xl font-gta text-vice-pink mb-4">🎯 MISSION BRIEFING</h2>
            <div className="space-y-3 text-foreground">
              <p><strong className="text-vice-cyan">OPERATION:</strong> Property Dominance</p>
              <p><strong className="text-vice-cyan">LOCATION:</strong> Any Market, Any Price Point</p>
              <p><strong className="text-vice-cyan">OBJECTIVE:</strong> Acquire 9 properties daily through creative finance warfare</p>
            </div>
          </div>

          <div className="mission-card">
            <h2 className="text-2xl font-gta text-vice-orange mb-4">🚀 QUICK START PROTOCOL</h2>
            <div className="space-y-3 text-foreground">
              <p><strong>STEP 1:</strong> Upload Your Property List</p>
              <p><strong>STEP 2:</strong> AI Does The Heavy Lifting</p>
              <p><strong>STEP 3:</strong> Combat-Ready Output</p>
            </div>
          </div>
        </div>

        {/* Your Crew */}
        <div className="mb-12">
          <h2 className="text-3xl font-gta text-vice-pink neon-text text-center mb-8">YOUR CREW</h2>
          <div className="grid md:grid-cols-6 gap-6">
            {[
              { name: "PIPELINE SCOUT", specialty: "Data processing & opportunity identification", mission: "Find the needles in the haystack", route: "/agent/pipeline-scout" },
              { name: "MARKET SCOUT", specialty: "Market research, comps, ARV calculation", mission: "Conduct deep market analysis", route: "/agent/market-scout" },
              { name: "UNDERWRITER", specialty: "Deal vetting & creative finance analysis", mission: "Separate gold from garbage", route: "/agent/underwriter" },
              { name: "OFFER GENERATOR", specialty: "Personalized offer creation", mission: "Craft irresistible proposals", route: "/agent/offer-generator" },
              { name: "CONTRACT SPECIALIST", specialty: "Legal document generation", mission: "Bulletproof agreement creation", route: "/agent/contract-specialist" },
              { name: "EMAIL CLOSER", specialty: "Negotiation & relationship management", mission: "Close deals through communication", route: "/agent/email-closer" }
            ].map((agent, index) => (
              <div
                key={index}
                className="agent-card cursor-pointer hover:border-vice-cyan transition-all duration-300"
                onClick={() => navigate(agent.route)}
              >
                <h3 className="font-gta text-vice-cyan text-sm mb-2">{agent.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{agent.specialty}</p>
                <p className="text-xs text-vice-yellow">"{agent.mission}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Intensity Meter */}
        <IntensityMeter />

        {/* Performance Dashboard */}
        <div className="mb-12">
          <h2 className="text-3xl font-gta text-vice-orange neon-text text-center mb-8">PERFORMANCE DASHBOARD</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="stat-display">
              <div className="text-2xl font-gta text-vice-pink">9</div>
              <div className="text-sm text-muted-foreground">DAILY TARGETS</div>
            </div>
            <div className="stat-display">
              <div className="text-2xl font-gta text-vice-cyan">45</div>
              <div className="text-sm text-muted-foreground">WEEKLY GOALS</div>
            </div>
            <div className="stat-display">
              <div className="text-2xl font-gta text-vice-orange">180+</div>
              <div className="text-sm text-muted-foreground">MONTHLY OBJECTIVES</div>
            </div>
            <div className="stat-display">
              <div className="text-2xl font-gta text-vice-yellow">2,000+</div>
              <div className="text-sm text-muted-foreground">YEARLY DOMINANCE</div>
            </div>
          </div>
        </div>

        {/* Start Mission Buttons */}
        <div className="text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-gta text-vice-pink mb-4">
              READY TO START YOUR PROPERTY HEIST?
            </h3>
            <p className="text-vice-cyan">
              Upload your PropWire CSV file to begin acquisition protocols
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {/* Upload Button - FIXED ✅ */}
            <Button 
              variant="neon-pink" 
              size="lg" 
              className="text-lg px-8"
              onClick={() => {
                console.log("📤 Upload clicked!");
                navigate("/upload");
              }}
            >
              📤 UPLOAD PROPERTY LIST
            </Button>

            {/* Command Center - FIXED ✅ */}
            <Button
              variant="mission"
              size="lg"
              onClick={() => {
                console.log("🎯 Command Center clicked!");
                onStartMission();
              }}
              className="text-lg px-8"
            >
              🎯 ENTER COMMAND CENTER
            </Button>

            {/* Black Market - FIXED ✅ */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                console.log("💰 Black Market clicked!");
                navigate("/black-market");
              }}
              className="text-lg px-8 bg-gtaGreen text-white hover:bg-crimeRed transition-all rounded-xl shadow-neon-pink"
            >
              💰 ENTER BLACK MARKET
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionBriefing;