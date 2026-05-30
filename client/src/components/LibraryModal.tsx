import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import type { Asset } from '../types';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiRequest: (endpoint: string, options?: any) => Promise<any>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  apiRequest,
  showToast,
}) => {
  const [library, setLibrary] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [decryptStatus, setDecryptStatus] = useState('');
  
  const progressBarRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      fetchLibrary();
    } else {
      setIsDecrypting(false);
      setDecryptProgress(0);
    }
  }, [isOpen]);

  const fetchLibrary = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/api/library');
      setLibrary(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load library', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (assetId: string) => {
    if (isDecrypting) return;

    setIsDecrypting(true);
    setDecryptProgress(0);
    setDecryptStatus('Establishing secure handshake...');

    try {
      // Request download tokens from backend
      const meta = await apiRequest(`/api/library/download/${assetId}`);

      // GSAP Numerical Easing timeline
      const progressObj = { value: 0 };
      
      const tl = gsap.timeline({
        onUpdate: () => {
          const progress = Math.round(progressObj.value);
          setDecryptProgress(progress);
          
          if (progress < 25) {
            setDecryptStatus('Bypassing firewall protocols...');
          } else if (progress < 55) {
            setDecryptStatus('Decrypting cipher keys (AES-256)...');
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
            showToast(`Decrypted and fetched: ${meta.fileName}`, 'success');

            // Trigger virtual file download in the browser
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`[PulseVault Encrypted File Key: ${meta.key}]\nSecure asset signature approved. Downloaded successfully.`));
            element.setAttribute('download', meta.fileName);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }, 600);
        }
      });

      // Animate progress with customized pacing
      tl.to(progressObj, {
        value: 100,
        duration: 2.2,
        ease: 'power2.out'
      });

    } catch (err: any) {
      setIsDecrypting(false);
      showToast(err.message || 'Decryption sequence failed', 'error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="glass-panel w-full max-w-2xl p-8 rounded-2xl shadow-2xl border-white/50 relative z-10 overflow-y-auto max-h-[90vh]"
          >
            <button 
              className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full leading-none" 
              onClick={onClose}
              disabled={isDecrypting}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="text-center mb-6 select-none">
              <h2 className="font-display text-2xl font-bold text-primary mb-1">My Secure Library</h2>
              <p className="text-xs text-on-surface-variant">Access your decrypted files and downloads</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
                </div>
              ) : library.length === 0 ? (
                <div className="text-center py-12 opacity-60 select-none">
                  <span className="material-symbols-outlined text-5xl mb-2 text-outline">
                    folder_zip
                  </span>
                  <div className="font-bold text-sm uppercase">Library is Empty</div>
                  <p className="text-xs text-outline mt-1">Acquire sensitivities and presets to load decrypted packets here.</p>
                </div>
              ) : (
                library.map(asset => (
                  <div 
                    key={asset.id} 
                    className="flex gap-4 p-4 bg-white/40 border border-white/50 rounded-xl items-center hover:bg-white/60 transition-colors"
                  >
                    <img 
                      className="w-16 h-16 object-cover rounded-lg bg-surface-container flex-shrink-0" 
                      src={asset.imageUrl} 
                      alt={asset.title}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-on-surface truncate">
                        {asset.title}
                      </h4>
                      <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                        {asset.category}
                      </span>
                      <div className="text-[9px] text-outline font-semibold select-none">
                        Bought: {new Date(asset.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(asset.id)}
                      disabled={isDecrypting}
                      className="bg-gradient-to-r from-primary to-secondary text-white font-semibold text-xs uppercase px-4 py-2 rounded-lg flex items-center gap-1 shadow-md disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">download</span> Fetch
                    </motion.button>
                  </div>
                ))
              )}
            </div>

            {/* GSAP Progress Decryption Drawer */}
            <AnimatePresence>
              {isDecrypting && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 bg-surface-container-high p-4 rounded-xl border border-primary/20 flex flex-col gap-2 overflow-hidden select-none"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs text-primary transition-all duration-100">
                      {decryptStatus}
                    </span>
                    <span className="font-bold text-xs text-primary">
                      {decryptProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div 
                      ref={progressBarRef}
                      className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
                      style={{ width: `${decryptProgress}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
