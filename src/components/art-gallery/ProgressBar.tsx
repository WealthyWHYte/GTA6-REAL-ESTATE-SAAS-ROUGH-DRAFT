import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  className?: string;
}

export const ProgressBar = ({ className }: ProgressBarProps) => {
  // Calculate real progress
  const announcementDate = new Date('2024-01-01')
  const releaseDate = new Date('2026-11-19')
  const today = new Date()
  const totalDays = (releaseDate - announcementDate) / (1000 * 60 * 60 * 24)
  const daysPassed = (today - announcementDate) / (1000 * 60 * 60 * 24)
  const progress = (daysPassed / totalDays) * 100

  const [loadingText, setLoadingText] = useState('LOADING VICE CITY...');

  // Loading text variations
  const loadingTexts = [
    'LOADING VICE CITY...',
    'PREPARING HEIST...',
    'ASSEMBLING CREW...',
    'LOADING MISSIONS...',
    'INITIALIZING GAME...',
    'CONNECTING TO VICE CITY...'
  ];

  useEffect(() => {
    // Rotate loading text every 3 seconds
    const textTimer = setInterval(() => {
      setLoadingText(prev => {
        const currentIndex = loadingTexts.indexOf(prev);
        return loadingTexts[(currentIndex + 1) % loadingTexts.length];
      });
    }, 3000);

    return () => {
      clearInterval(textTimer);
    };
  }, []);

  return (
    <motion.div
      className={`w-full max-w-4xl mx-auto ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      {/* Loading Text */}
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-2xl md:text-3xl font-gta font-bold text-vice-pink"
            style={{
              textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff',
              animation: 'pulse 2s ease-in-out infinite alternate'
            }}>
          🌴 {loadingText} 🌴
        </h2>
      </motion.div>

      {/* GTA-Style Loading Bar Container */}
      <motion.div
        className="relative mb-6"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        style={{ transformOrigin: 'center' }}
      >
        {/* Outer Border - Purple to Pink Gradient */}
        <div className="relative border-4 rounded-lg overflow-hidden"
             style={{
               background: 'linear-gradient(45deg, #8B00FF, #FF1493)',
               borderImage: 'linear-gradient(45deg, #8B00FF, #FF1493) 1',
               boxShadow: '0 0 20px rgba(139, 0, 255, 0.5), inset 0 0 20px rgba(255, 20, 147, 0.3)'
             }}>

          {/* Middle Border - Gold */}
          <div className="m-1 border-2 border-yellow-500 rounded-md overflow-hidden">

            {/* Inner Border - Red Accent */}
            <div className="m-0.5 border border-red-500 rounded overflow-hidden">

              {/* Background - Black */}
              <div className="bg-black p-2 rounded-sm">

                {/* Progress Bar Container */}
                <div className="relative h-12 bg-gray-800 rounded overflow-hidden border border-gray-600">

                  {/* Progress Fill - Orange to Gold Gradient */}
                  <motion.div
                    className="absolute top-0 left-0 h-full rounded-sm"
                    style={{
                      background: 'linear-gradient(90deg, #FF8C00, #FFD700)',
                      boxShadow: '0 0 15px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255, 140, 0, 0.4)'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                  />

                  {/* Palm Tree Silhouettes */}
                  <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                    <div className="text-2xl opacity-30" style={{ color: '#4A0E4E' }}>🌴</div>
                    <div className="text-2xl opacity-30" style={{ color: '#2D0A2E' }}>🌴</div>
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-sm"
                       style={{
                         boxShadow: 'inset 0 0 20px rgba(255, 0, 255, 0.3)',
                         background: 'radial-gradient(ellipse at center, rgba(255, 0, 255, 0.1) 0%, transparent 70%)'
                       }} />

                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Date Labels Row */}
      <div className="flex justify-between items-center mb-4 px-4">
        {/* Left: Clickable Announcement */}
        <a
          href="https://youtu.be/QdBZY2fkU-0?si=RGVv-tIpbXvtUW5q"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs md:text-sm text-purple-400 hover:text-pink-400 transition-colors cursor-pointer underline font-gta"
        >
          📺 ANNOUNCEMENT: JAN 1, 2024
        </a>

        {/* Right: Release Date */}
        <div className="text-xs md:text-sm text-purple-400 font-gta">
          🎮 RELEASE: NOV 19, 2026
        </div>
      </div>

      {/* Percentage Text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="text-2xl md:text-3xl font-gta font-bold text-yellow-400"
             style={{
               textShadow: '0 0 10px #FFD700, 0 0 20px #FFD700',
               animation: 'pulse 1.5s ease-in-out infinite alternate'
             }}>
          {progress.toFixed(1)}% LOADED
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProgressBar;
