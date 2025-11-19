import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import viceCityBg from "@/assets/vice-city-bg.jpg";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [showPressEnter, setShowPressEnter] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setShowPressEnter(true);
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && showPressEnter) {
      onComplete();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showPressEnter]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8 relative"
      style={{
        backgroundImage: `url(${viceCityBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-background/80" />
      <div className="max-w-4xl w-full relative z-10">
        {/* Main Loading Frame */}
        <div className="border-4 border-vice-purple bg-vice-orange p-8 rounded-lg">
          <div className="bg-background border-4 border-vice-purple p-8 rounded">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-gta font-black text-vice-pink neon-text mb-4">
                GTA 6: PROPERTY HEISTS
              </h1>
            </div>
            

            {/* Progress Bar */}
            <div className="gta-loading-bar mb-8">
              <div 
                className="gta-loading-progress" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center text-vice-yellow font-gta font-bold text-xl mb-8">
              {progress}%
            </div>

            {/* System Status */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4 text-sm font-body">
                <div className="text-vice-cyan">AI ACQUISITION SYSTEM:</div>
                <div className="text-vice-green">ONLINE</div>
                
                <div className="text-vice-cyan">UNDERWRITING PROTOCOLS:</div>
                <div className="text-vice-green">ARMED</div>
                
                <div className="text-vice-cyan">CONTRACT GENERATION:</div>
                <div className="text-vice-green">READY</div>
                
                <div className="text-vice-cyan">EMAIL CLOSER:</div>
                <div className="text-vice-green">DEPLOYED</div>
              </div>
            </div>

            {/* Press Enter */}
            {showPressEnter && (
              <div className="text-center">
                <div className="text-vice-yellow font-gta font-bold text-xl mb-4 animate-pulse">
                  PRESS [ENTER] TO START HEIST
                </div>
                <Button
                  variant="heist"
                  size="lg"
                  onClick={onComplete}
                  className="text-xl px-12 py-6"
                >
                  INITIATE MISSION
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;