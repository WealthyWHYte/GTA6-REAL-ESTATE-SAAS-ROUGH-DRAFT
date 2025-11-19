import { useState, useEffect } from 'react';

export const useCountdown = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [progress, setProgress] = useState(0);
  const [isReleased, setIsReleased] = useState(false);

  // GTA 6 Release Date: November 19, 2026, 12:00 AM EST (5:00 AM UTC)
  const releaseDate = new Date('2026-11-19T05:00:00Z');

  // GTA 6 Announcement Date: January 1, 2024 (for progress calculation)
  const announcementDate = new Date('2024-01-01T00:00:00Z');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = releaseDate.getTime() - now.getTime();

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });

        // Calculate progress percentage
        const totalTime = releaseDate.getTime() - announcementDate.getTime();
        const elapsedTime = now.getTime() - announcementDate.getTime();
        const progressPercent = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
        setProgress(progressPercent);
      } else {
        setIsReleased(true);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setProgress(100);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return { countdown, progress, isReleased };
};
