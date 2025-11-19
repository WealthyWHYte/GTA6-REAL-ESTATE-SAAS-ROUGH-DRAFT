import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

interface PageNavigationProps {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
}

export default function PageNavigation({
  showBack = true,
  backTo = "/command-center",
  backLabel = "Back"
}: PageNavigationProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 left-6 flex gap-3 z-50">
      {/* Home Button - Always visible */}
      <Button
        variant="outline"
        size="lg"
        onClick={() => navigate("/mission-briefing")}
        className="border-vice-cyan/50 hover:border-vice-cyan hover:bg-vice-cyan/10 shadow-neon-cyan"
      >
        <Home className="w-5 h-5 mr-2" />
        HOME
      </Button>

      {/* Back Button - Optional */}
      {showBack && (
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate(backTo)}
          className="border-vice-pink/50 hover:border-vice-pink hover:bg-vice-pink/10 shadow-neon-pink"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {backLabel}
        </Button>
      )}
    </div>
  );
}
