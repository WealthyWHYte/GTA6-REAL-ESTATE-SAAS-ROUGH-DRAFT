import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArtGallery } from '../../hooks/useArtGallery';

interface ArtPiece {
  id: string;
  file_url: string;
  title: string;
  artist_name: string;
  description?: string;
  featured: boolean;
}

interface ArtSlideshowProps {
  className?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  interval?: number;
}

export const ArtSlideshow = ({ 
  className = '', 
  showControls = true, 
  autoPlay = true, 
  interval = 5000 
}: ArtSlideshowProps) => {
  const { approvedArt, loading, error } = useArtGallery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [artPieces, setArtPieces] = useState<ArtPiece[]>([]);

  // Fallback sample images if no art in database
  const fallbackArt: ArtPiece[] = [
    {
      id: 'sample-1',
      title: 'Vice City Sunset',
      artist_name: 'GTA Community',
      file_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&h=1080&fit=crop',
      description: 'Neon-soaked cityscape',
      featured: true
    },
    {
      id: 'sample-2',
      title: 'Miami Nights',
      artist_name: 'Art Bot',
      file_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
      description: 'Cyberpunk aesthetic',
      featured: false
    },
    {
      id: 'sample-3',
      title: 'Neon Dreams',
      artist_name: 'Community Artist',
      file_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop',
      description: 'Electric future vision',
      featured: false
    }
  ];

  useEffect(() => {
    if (approvedArt && approvedArt.length > 0) {
      setArtPieces(approvedArt);
    } else {
      setArtPieces(fallbackArt);
    }
  }, [approvedArt]);

  useEffect(() => {
    if (!autoPlay || artPieces.length === 0) return;

    const autoPlayInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === artPieces.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(autoPlayInterval);
  }, [artPieces.length, autoPlay, interval]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === artPieces.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? artPieces.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className={`fixed inset-0 bg-gray-900 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error || artPieces.length === 0) {
    return (
      <div className={`fixed inset-0 bg-gray-900 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Loading GTA VI Art Gallery...</h3>
            <p className="text-gray-400">Preparing the Vice City experience</p>
          </div>
        </div>
      </div>
    );
  }

  const currentArt = artPieces[currentIndex];

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1 }}
        >
          <img
            src={currentArt.file_url}
            alt={currentArt.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          
          {/* Overlay gradients for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
          
          {/* Featured Badge */}
          {currentArt.featured && (
            <motion.div 
              className="absolute top-8 right-8 bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold z-20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              ⭐ FEATURED
            </motion.div>
          )}
          
          {/* Art info overlay */}
          <motion.div 
            className="absolute bottom-8 left-8 text-white z-20 max-w-md"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold text-purple-400 mb-2" style={{
              textShadow: '0 0 10px rgba(139, 92, 246, 0.8)'
            }}>
              {currentArt.title}
            </h3>
            <p className="text-xl text-pink-400 mb-3">
              by {currentArt.artist_name}
            </p>
            {currentArt.description && (
              <p className="text-sm text-gray-300 leading-relaxed">
                {currentArt.description}
              </p>
            )}
          </motion.div>

          {/* Slide indicators */}
          <div className="absolute bottom-8 right-8 flex space-x-2 z-20">
            {artPieces.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-purple-500 shadow-lg shadow-purple-500/50 scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {showControls && artPieces.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 z-30 backdrop-blur-sm group"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 z-30 backdrop-blur-sm group"
            aria-label="Next image"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Progress bar for auto-play */}
      {autoPlay && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 z-20">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: interval / 1000, ease: 'linear' }}
            key={currentIndex}
          />
        </div>
      )}
    </div>
  );
};

export default ArtSlideshow;