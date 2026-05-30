import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ScannerSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onScan: () => void;
  isScanning: boolean;
  onQuickScan: (term: string) => void;
}

export const ScannerSection: React.FC<ScannerSectionProps> = ({
  searchQuery,
  setSearchQuery,
  onScan,
  isScanning,
  onQuickScan,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);

  // GSAP Laser Scan Line Sweep Animation
  useGSAP(() => {
    if (!isScanning) return;

    // Reset and sweep
    gsap.fromTo(scanLineRef.current,
      { y: 0, opacity: 0.8 },
      { 
        y: () => {
          const height = containerRef.current?.getBoundingClientRect().height || 80;
          return height - 4;
        }, 
        opacity: 0, 
        duration: 0.8, 
        ease: 'power2.inOut',
        repeat: 0
      }
    );
  }, [isScanning]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onScan();
    }
  };

  return (
    <section className="mt-8 mb-12 flex flex-col items-center gap-6">
      <div 
        ref={containerRef}
        className="w-full max-w-2xl relative group overflow-hidden rounded-full p-2"
      >
        {/* Neon scan sweep line */}
        <div 
          ref={scanLineRef}
          className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-0 pointer-events-none z-10 shadow-[0_0_12px_#06b6d4,0_0_20px_#8b5cf6]"
          style={{ top: 0 }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-10 blur-2xl -z-10 transition-opacity group-focus-within:opacity-20"></div>
        <div className="glass-panel rounded-full p-2 flex items-center shadow-lg border-white/60 relative z-0">
          <div className="flex items-center flex-1 px-4">
            <span className="material-symbols-outlined text-outline">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 w-full font-sans text-on-surface placeholder:text-outline-variant px-3 py-2 border-0 outline-none" 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search sensitivities, packs, presets..."
            />
          </div>
          <button 
            className="bg-gradient-to-r from-primary-container to-secondary text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 flex-shrink-0 disabled:opacity-85" 
            onClick={onScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">sync</span> 
                Scanning...
              </>
            ) : (
              'Initialize Scan'
            )}
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 select-none">
        <span className="font-semibold text-xs text-outline-variant uppercase tracking-wider self-center mr-2">
          Quick Scans:
        </span>
        <button 
          onClick={() => onQuickScan('FiveM')}
          className="bg-surface-container-low px-4 py-1.5 rounded-full font-bold text-on-surface-variant hover:bg-primary-container hover:text-white transition-all text-xs"
        >
          #FiveM_Pack
        </button>
        <button 
          onClick={() => onQuickScan('Hacker')}
          className="bg-surface-container-low px-4 py-1.5 rounded-full font-bold text-on-surface-variant hover:bg-primary-container hover:text-white transition-all text-xs"
        >
          #Hacker_Tuts
        </button>
        <button 
          onClick={() => onQuickScan('Editing')}
          className="bg-surface-container-low px-4 py-1.5 rounded-full font-bold text-on-surface-variant hover:bg-primary-container hover:text-white transition-all text-xs"
        >
          #Editing_Flow
        </button>
      </div>
    </section>
  );
};
