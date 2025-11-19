import UploadIntel from "./UploadIntel";
import DealTable from "./DealTable";
import MissionStats from "./MissionStats";
import HeistMeter from "./HeistMeter";

export default function CloserAgentPanel() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-gta">🕵️ Closer Agent</h1>
        <HeistMeter />
      </div>

      <MissionStats />

      <UploadIntel />
      <DealTable />
    </div>
  );
}
