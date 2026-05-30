import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (assetData: {
    title: string;
    category: string;
    price: number;
    originalPrice: number | null;
    isVerified: boolean;
    description: string;
    imageUrl: string;
    fileUrl: string;
  }) => Promise<void>;
}

export const SellerModal: React.FC<SellerModalProps> = ({
  isOpen,
  onClose,
  onPublish,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sensitivity');
  const [price, setPrice] = useState('');
  const [originalPriceVal, setOriginalPriceVal] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMsg('Price must be a valid positive number');
      return;
    }

    const origPriceNum = originalPriceVal.trim() ? parseFloat(originalPriceVal) : null;
    if (origPriceNum !== null && (isNaN(origPriceNum) || origPriceNum < 0)) {
      setErrorMsg('Original Price must be a valid positive number');
      return;
    }

    setIsLoading(true);
    try {
      await onPublish({
        title,
        category,
        price: priceNum,
        originalPrice: origPriceNum,
        isVerified,
        description,
        imageUrl: imageUrl.trim(),
        fileUrl: fileUrl.trim(),
      });
      // Reset form
      setTitle('');
      setCategory('Sensitivity');
      setPrice('');
      setOriginalPriceVal('');
      setIsVerified(false);
      setDescription('');
      setImageUrl('');
      setFileUrl('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to list asset in index');
    } finally {
      setIsLoading(false);
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
            className="glass-panel w-full max-w-lg p-8 rounded-2xl shadow-2xl border-white/50 relative z-10 overflow-y-auto max-h-[90vh]"
          >
            <button 
              className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full leading-none" 
              onClick={onClose}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="text-center mb-6 select-none">
              <h2 className="font-display text-2xl font-bold text-primary mb-1">Developer Portal</h2>
              <p className="text-xs text-on-surface-variant">Publish digital assets to the PulseVault index</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="asset-title">
                  Asset Title
                </label>
                <input 
                  className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none" 
                  type="text" 
                  id="asset-title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                  placeholder="e.g. FPS Boost Tweakpack"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="asset-category">
                    Category
                  </label>
                  <select 
                    className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none cursor-pointer" 
                    id="asset-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Sensitivity">Sensitivity</option>
                    <option value="Presets">Presets</option>
                    <option value="Packs">Packs</option>
                    <option value="Guides">Guides</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="asset-price">
                    Price ($)
                  </label>
                  <input 
                    className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    id="asset-price" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required 
                    placeholder="19.90"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="asset-original-price">
                    Original Price ($ - Optional)
                  </label>
                  <input 
                    className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    id="asset-original-price" 
                    value={originalPriceVal}
                    onChange={(e) => setOriginalPriceVal(e.target.value)}
                    placeholder="Leave empty if no discount"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-end select-none">
                  <label className="flex items-center gap-2 p-3 bg-surface-container rounded-lg border border-outline-variant/30 cursor-pointer hover:bg-white/10 h-[42px]">
                    <input 
                      type="checkbox" 
                      id="asset-verified" 
                      checked={isVerified}
                      onChange={(e) => setIsVerified(e.target.checked)}
                      className="rounded text-primary focus:ring-primary text-sm focus:ring-offset-0"
                    />
                    <span className="text-xs font-semibold text-on-surface">Verified Asset</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="asset-description">
                  Description
                </label>
                <textarea 
                  className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm h-24 border-0 outline-none resize-none" 
                  id="asset-description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required 
                  placeholder="Write a detailed description explaining what is inside this asset..."
                />
              </div>

              <div>
                <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="asset-image">
                  Cover Image URL (Optional)
                </label>
                <input 
                  className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none" 
                  type="url" 
                  id="asset-image" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="asset-file">
                  Mock File Download URL (Optional)
                </label>
                <input 
                  className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none" 
                  type="text" 
                  id="asset-file" 
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="/downloads/fps_boost.zip"
                />
              </div>

              {errorMsg && (
                <div className="text-error text-xs font-semibold select-none">
                  {errorMsg}
                </div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-primary-container to-secondary text-white font-semibold py-3.5 rounded-lg shadow-md mt-2 disabled:opacity-80"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-sm leading-none">sync</span>
                ) : (
                  'Publish Vault Asset'
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
