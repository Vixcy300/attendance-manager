import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Flame, Zap, Palette, Award, Rocket, ChevronRight, Star } from 'lucide-react';
import gsap from 'gsap';

const VERSION = '3.1.3';
const STORAGE_KEY = `whatsnew_shown_${VERSION}`;

const WhatsNew = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const modalRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    // Show popup once per app open (session-based) but only if not shown this session
    const hasShown = sessionStorage.getItem(STORAGE_KEY);
    if (!hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(STORAGE_KEY, 'true');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(modalRef.current, 
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && featuresRef.current) {
      gsap.fromTo('.feature-item',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.2,
        onComplete: () => setIsOpen(false)
      });
    }
  };

  const features = [
    { icon: Palette, title: 'New Black Theme', description: 'Sleek dark UI for your eyes', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-500' },
    { icon: Flame, title: 'Streaks System', description: 'Track your daily consistency', color: 'from-orange-500 to-red-500', bg: 'bg-orange-500' },
    { icon: Award, title: 'Achievements', description: 'Unlock badges & rewards', color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-500' },
    { icon: Zap, title: 'GSAP Animations', description: 'Smooth interactive experience', color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500' },
    { icon: Rocket, title: 'Performance Boost', description: 'Faster & more optimized', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500' },
    { icon: Star, title: 'Mobile Ready', description: 'Perfect on any device', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Animated Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 overflow-hidden">
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
          
          <button 
            onClick={handleClose} 
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300"
          >
            <X size={18} className="text-white" />
          </button>
          
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-bounce">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">What's New</h2>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white font-medium">v3.1</span>
              </div>
              <p className="text-emerald-100 text-sm mt-0.5">December 2025</p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div ref={featuresRef} className="p-4 max-h-[45vh] overflow-y-auto">
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`feature-item group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeIndex === index 
                    ? 'bg-neutral-800 scale-[1.02]' 
                    : 'bg-neutral-900/50 hover:bg-neutral-800/70'
                }`}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className={`p-2.5 rounded-xl ${feature.bg} transition-transform group-hover:scale-110`}>
                  <feature.icon className="text-white" size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white text-sm">{feature.title}</h3>
                  <p className="text-xs text-neutral-500">{feature.description}</p>
                </div>
                <ChevronRight 
                  size={16} 
                  className={`text-neutral-600 transition-transform ${activeIndex === index ? 'translate-x-1 text-white' : ''}`} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-2 border-t border-neutral-800/50">
          <button
            onClick={handleClose}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Rocket size={18} />
            Let's Explore!
          </button>
          <p className="text-center text-[10px] text-neutral-600 mt-3">
            Made with ❤️ by VIGNESH
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsNew;
