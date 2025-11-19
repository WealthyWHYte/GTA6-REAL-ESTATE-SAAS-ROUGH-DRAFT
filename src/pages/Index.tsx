// src/pages/Index.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/components/LoadingScreen";

const Index = () => {
  const [showLoading, setShowLoading] = useState(true);
  const navigate = useNavigate();

  const handleLoadingComplete = async () => {
    setShowLoading(false);
    
    // After loading screen, check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // User is logged in, go to mission briefing
      setTimeout(() => {
        navigate("/mission-briefing");
      }, 500);
    } else {
      // Not logged in, go to login
      setTimeout(() => {
        navigate("/login");
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
    </div>
  );
};

export default Index;