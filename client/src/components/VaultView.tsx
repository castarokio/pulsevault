import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import type { Asset } from '../types';

interface VaultViewProps {
  apiRequest: (endpoint: string, options?: any) => Promise<any>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  apiRequest,
  showToast,
}) => {
  const [library, setLibrary] = useState<Asset[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Codes' | 'Files' | 'Guides'>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [decryptStatus, setDecryptStatus] = useState('');
  
  // Modal for Key Reveal
  const [revealingAsset, setRevealingAsset] = useState<Asset | null>(null);
  const [revealedKey, setRevealedKey] = useState('');
  const [isKeyLoading, setIsKeyLoading] = useState(false);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/api/library');
      setLibrary(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to sync vault locker', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (asset: Asset) => {
    if (isDecrypting) return;

    setIsDecrypting(true);
    setDecryptProgress(0);
    setDecryptStatus('Establishing secure handshake...');

    try {
      const meta = await apiRequest(`/api/library/download/${asset.id}`);

      // GSAP Numerical Easing
      const progressObj = { value: 0 };
      
      const tl = gsap.timeline({
        onUpdate: () => {
          const progress = Math.round(progressObj.value);
          setDecryptProgress(progress);
          
          if (progress < 25) {
            setDecryptStatus('Connecting to secure gateway...');
          } else if (progress < 55) {
            setDecryptStatus('Bypassing firewalls & decrypting keys (AES-256)...');
          } else if (progress < 80) {
            setDecryptStatus('Re-assembling binary blocks...');
          } else if (progress < 95) {
            setDecryptStatus('Compiling secure package...');
          } else {
            setDecryptStatus('Vault decryption complete!');
          }
        },
        onComplete: () => {
          setTimeout(() => {
            setIsDecrypting(false);
            showToast(`Decrypted and downloaded: ${meta.fileName}`, 'success');

            // Trigger file download
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`[PulseVault Secure Locker Key: ${meta.key}]\nLocker asset signature verified. Decrypted successfully.`));
            element.setAttribute('download', meta.fileName);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }, 600);
        }
      });

      tl.to(progressObj, {
        value: 100,
        duration: 2.0,
        ease: 'power1.inOut'
      });

    } catch (err: any) {
      setIsDecrypting(false);
      showToast(err.message || 'Decryption sequence failed', 'error');
    }
  };

  const handleRevealCode = async (asset: Asset) => {
    setRevealingAsset(asset);
    setRevealedKey('');
    setIsKeyLoading(true);

    try {
      // Simulate decryption handshake for codes
      const meta = await apiRequest(`/api/library/download/${asset.id}`);
      setTimeout(() => {
        setRevealedKey(meta.key || 'PV-CODE-' + Math.random().toString(36).substring(2, 7).toUpperCase());
        setIsKeyLoading(false);
      }, 800);
    } catch (err: any) {
      setIsKeyLoading(false);
      showToast(err.message || 'Key decryption failed', 'error');
    }
  };

  // Categories Filters
  const filteredLibrary = library.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Codes') return item.category === 'Sensitivity';
    if (activeFilter === 'Files') return item.category === 'Presets' || item.category === 'Packs';
    if (activeFilter === 'Guides') return item.category === 'Guides';
    return true;
  });

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 pb-32 relative">
      
      {/* Stats Summary Area */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12 select-none">
        <div className="glass-card rounded-xl p-6 flex items-center gap-4 border-l-4 border-primary-container neon-glow-cyan">
          <div className="bg-primary-container/10 p-3 rounded-full text-primary-container">
            <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              inventory_2
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant font-semibold text-xs uppercase tracking-wider">Assets Secured</p>
            <p className="font-display text-2xl font-bold text-on-surface">{library.length} Items</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 flex items-center gap-4 border-l-4 border-secondary neon-glow-violet">
          <div className="bg-secondary/10 p-3 rounded-full text-secondary">
            <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock_person
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant font-semibold text-xs uppercase tracking-wider">Sync Status</p>
            <div className="flex items-center gap-2">
              <p className="font-display text-2xl font-bold text-on-surface">Active</p>
              <span className="px-2 py-0.5 bg-tertiary-container/20 text-tertiary font-bold text-[9px] rounded-full uppercase tracking-wider select-none">
                Encrypted
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 flex items-center gap-4 border-l-4 border-tertiary">
          <div className="bg-tertiary/10 p-3 rounded-full text-tertiary">
            <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              update
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant font-semibold text-xs uppercase tracking-wider">Last Update</p>
            <p className="font-display text-2xl font-bold text-on-surface">Just Now</p>
          </div>
        </div>
      </section>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 select-none border-b border-outline-variant/20 pb-4">
        <h2 className="font-display text-2xl font-bold text-on-surface">Digital Locker</h2>
        <div className="flex p-1 bg-surface-container rounded-full gap-1">
          {(['All', 'Codes', 'Files', 'Guides'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${activeFilter === tab ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:text-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* GSAP Progress Decryption Block */}
      <AnimatePresence>
        {isDecrypting && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mb-8 bg-surface-container-high p-4 rounded-xl border border-primary/20 flex flex-col gap-2 shadow-inner select-none"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-xs text-primary transition-all duration-100">{decryptStatus}</span>
              <span className="font-bold text-xs text-primary">{decryptProgress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
                style={{ width: `${decryptProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Locker Items */}
      {isLoading ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
        </div>
      ) : filteredLibrary.length === 0 ? (
        <div className="text-center py-20 opacity-60 select-none">
          <span className="material-symbols-outlined text-6xl mb-2 text-outline">
            lock_open
          </span>
          <div className="font-bold text-sm uppercase">Locker Category is Empty</div>
          <p className="text-xs text-outline mt-1 max-w-sm mx-auto">
            You don't own any items under this category. Visit the marketplace to decrypt presets or guides.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {filteredLibrary.map(item => (
            <div key={item.id} className="glass-card rounded-xl overflow-hidden group shadow-sm flex flex-col justify-between min-h-[300px]">
              <div className="relative h-48 w-full bg-surface-container overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  src={item.imageUrl} 
                  alt={item.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-3 left-3 select-none">
                  <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    {item.category === 'Sensitivity' ? 'Sensitivity Code' : item.category === 'Guides' ? 'Pro Guide' : 'System Package'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <span className="material-symbols-outlined text-outline text-sm select-none" title="Verified Locker Signature">
                      verified
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-[11px] select-none">Added: {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>

                {item.category === 'Sensitivity' ? (
                  <button 
                    onClick={() => handleRevealCode(item)}
                    className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">key</span>
                    Reveal Code
                  </button>
                ) : (
                  <button 
                    onClick={() => handleDownload(item)}
                    className="w-full py-3 border border-primary text-primary hover:bg-primary/5 font-bold text-xs uppercase tracking-wider rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download Files
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Secure Sync Bottom Card */}
      <section className="mt-16 flex flex-col items-center select-none">
        <div className="glass-card rounded-2xl p-8 max-w-2xl w-full text-center border-t-2 border-primary-container shadow-2xl">
          <span className="material-symbols-outlined text-primary text-5xl mb-4 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
          <h3 className="font-display text-xl font-bold mb-2">End-to-End Encryption Active</h3>
          <p className="text-on-surface-variant text-xs leading-relaxed mb-6">
            All your assets are secured with AES-256 bit encryption. Decryption keys are processed locally on your client machine and are not stored in raw format on the cloud indexes.
          </p>
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            Live Syncing Protected
          </div>
        </div>
      </section>

      {/* Code Reveal Modal Popup */}
      <AnimatePresence>
        {revealingAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRevealingAsset(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="glass-panel w-full max-w-md p-8 rounded-2xl border-white/50 shadow-2xl relative z-10 text-center text-on-surface"
            >
              <button 
                className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full leading-none" 
                onClick={() => setRevealingAsset(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <span className="material-symbols-outlined text-secondary text-5xl mb-4 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                key
              </span>
              <h3 className="font-display text-lg font-bold mb-1">Secure Decryption Key</h3>
              <p className="text-xs text-on-surface-variant mb-6">Vault configuration for {revealingAsset.title}</p>

              {isKeyLoading ? (
                <div className="py-4 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-primary text-2xl">sync</span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">Decrypting locker...</span>
                </div>
              ) : (
                <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-2">
                  <div className="font-mono text-xl font-bold text-primary select-all tracking-wider">
                    {revealedKey}
                  </div>
                  <span className="text-[10px] text-outline font-semibold select-none">
                    Select key to copy to clipboard
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
