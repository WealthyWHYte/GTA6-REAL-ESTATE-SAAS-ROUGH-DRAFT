// src/pages/MissionBriefing.tsx
import MissionBriefing from "@/components/MissionBriefing";
import { useNavigate } from "react-router-dom";

export default function MissionBriefingPage() {
  const navigate = useNavigate();

  const handleStartMission = () => {
    console.log("Starting mission - navigating to command center"); // ✅ Debug
    navigate("/command-center");
  };

  return <MissionBriefing onStartMission={handleStartMission} />;
}
