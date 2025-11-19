import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCountdown } from '../../hooks/useCountdown';

interface CountdownDisplayProps {
  className?: string;
}

export const CountdownTimer = ({ className }: CountdownDisplayProps) => {
  const { countdown, isReleased, progress } = useCountdown();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (isReleased) {
    return (
      <motion.div 
        className={`text-center ${className}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-6xl md:text-8xl font-bold text-green-400 animate-pulse mb-4">
          GTA VI IS HERE!
        </h1>
        <p className="text-xl text-yellow-400">Welcome to Vice City</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`text-center ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main Title */}
      <motion.h1 
        className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-wider"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          textShadow: '0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 30px #8b5cf6',
          animation: 'pulse 2s ease-in-out infinite alternate'
        }}
      >
        GTA VI COUNTDOWN
      </motion.h1>
      
      <motion.p 
        className="text-lg md:text-xl text-pink-400 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Time until Vice City opens its doors
      </motion.p>

      {/* Progress Bar */}
      <motion.div 
        className="mb-8 max-w-md mx-auto"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        <div className="bg-gray-800 rounded-full h-4 mb-2 border border-purple-500 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-full rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 1, duration: 2 }}
            style={{
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
            }}
          />
        </div>
        <p className="text-sm text-gray-400">
          {progress.toFixed(1)}% of the wait is over
        </p>
      </motion.div>

      {/* Countdown Grid */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <CountdownCard value={countdown.days} label="DAYS" color="purple" delay={0.9} />
        <CountdownCard value={countdown.hours} label="HOURS" color="pink" delay={1.0} />
        <CountdownCard value={countdown.minutes} label="MINUTES" color="blue" delay={1.1} />
        <CountdownCard value={countdown.seconds} label="SECONDS" color="green" delay={1.2} />
      </motion.div>

      {/* Release Date */}
      <motion.p 
        className="text-sm text-gray-500 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        Expected Release: December 31, 2025
      </motion.p>
    </motion.div>
  );
};

interface CountdownCardProps {
  value: number;
  label: string;
  color: 'purple' | 'pink' | 'blue' | 'green';
  delay: number;
}

const CountdownCard = ({ value, label, color, delay }: CountdownCardProps) => {
  const colorClasses = {
    purple: 'border-purple-500 text-purple-400 shadow-purple-500/20',
    pink: 'border-pink-500 text-pink-400 shadow-pink-500/20',
    blue: 'border-blue-500 text-blue-400 shadow-blue-500/20',
    green: 'border-green-500 text-green-400 shadow-green-500/20'
  };

  return (
    <motion.div 
      className={`bg-black/80 backdrop-blur-sm border-2 ${colorClasses[color]} rounded-lg p-4 shadow-2xl`}
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ delay, duration: 0.6, type: 'spring' }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div 
        className="text-3xl md:text-4xl font-mono font-bold"
        key={value}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {value.toString().padStart(2, '0')}
      </motion.div>
      <div className="text-xs md:text-sm font-semibold tracking-wider opacity-80">
        {label}
      </div>
    </motion.div>
  );
};

export default CountdownTimer;