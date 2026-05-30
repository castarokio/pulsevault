import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Asset, User } from '../types';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string | null;
  user: User | null;
  isOwned: boolean;
  isInCart: boolean;
  onAddToCart: (id: string) => void;
  onOpenLibrary: () => void;
  onToggleCart: () => void;
  onSubmitReview: (assetId: string, rating: number, comment: string) => Promise<void>;
  apiRequest: (endpoint: string, options?: any) => Promise<any>;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  assetId,
  user,
  isOwned,
  isInCart,
  onAddToCart,
  onOpenLibrary,
  onToggleCart,
  onSubmitReview,
  apiRequest,
}) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (isOpen && assetId) {
      fetchAssetDetail();
    } else {
      setAsset(null);
      setComment('');
      setRating(5);
    }
  }, [isOpen, assetId]);

  const fetchAssetDetail = async () => {
    if (!assetId) return;
    setIsLoading(true);
    try {
      const data = await apiRequest(`/api/assets/${assetId}`);
      setAsset(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await onSubmitReview(asset.id, rating, comment.trim());
      // Reload details to fetch the updated reviews list and average rating!
      await fetchAssetDetail();
      setComment('');
      setRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const fillStars = asset ? Math.round(asset.rating) : 0;

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
            transition={{ type: 'spring', damping: 24, stiffness: 250 }}
            className="glass-panel w-full max-w-3xl p-6 md:p-8 rounded-2xl shadow-2xl border-white/50 relative overflow-y-auto max-h-[90vh] flex flex-col md:flex-row gap-6 z-10"
          >
            <button 
              className="absolute top-4 right-4 p-2 bg-surface rounded-full shadow hover:bg-surface-container z-10 leading-none" 
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {isLoading ? (
              <div className="w-full h-64 flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
              </div>
            ) : asset ? (
              <>
                {/* Product Visual */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="h-64 rounded-xl overflow-hidden shadow-md relative bg-surface-container">
                    <img className="w-full h-full object-cover" src={asset.imageUrl} alt={asset.title}/>
                    {asset.isVerified && (
                      <span className="absolute top-3 left-3 bg-tertiary-container/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-on-tertiary-container font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                        <span className="text-[10px] font-semibold text-on-tertiary-container uppercase tracking-wider">
                          Verified Asset
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center select-none">
                    <span className="text-secondary font-bold text-xs uppercase tracking-wider">
                      {asset.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="flex text-primary-container">
                        {Array(5).fill(0).map((_, i) => (
                          <span 
                            key={i} 
                            className="material-symbols-outlined text-sm" 
                            style={{ fontVariationSettings: i < fillStars ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            {i < fillStars ? 'star' : 'star_border'}
                          </span>
                        ))}
                      </div>
                      <span className="text-outline font-semibold text-xs">
                        ({asset.ratingCount || 0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Info and Reviews */}
                <div className="flex-1 flex flex-col gap-4 justify-between min-h-[350px]">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-on-surface mb-2">
                      {asset.title}
                    </h3>
                    <p className="font-sans text-on-surface-variant text-sm leading-relaxed mb-4">
                      {asset.description}
                    </p>
                    
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-primary font-bold text-3xl">$ {asset.price.toFixed(2)}</span>
                      {asset.originalPrice && (
                        <span className="text-outline-variant text-sm line-through">
                          $ {asset.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mb-4">
                    {isOwned ? (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { onClose(); onOpenLibrary(); }}
                        className="w-full bg-tertiary text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined">download</span> Access in Library
                      </motion.button>
                    ) : isInCart ? (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { onClose(); onToggleCart(); }}
                        className="w-full bg-secondary text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined">shopping_cart</span> View in Cart
                      </motion.button>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAddToCart(asset.id)}
                        className="w-full bg-gradient-to-r from-primary-container to-secondary text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <span className="material-symbols-outlined">add_shopping_cart</span> Add to Cart — $ {asset.price.toFixed(2)}
                      </motion.button>
                    )}
                  </div>

                  {/* User Feedback */}
                  <div className="border-t border-outline-variant/30 pt-4 flex-1 flex flex-col min-h-[200px]">
                    <h4 className="font-semibold text-outline text-xs uppercase tracking-wider mb-3 select-none">
                      User Feedback
                    </h4>
                    
                    {/* Write Review Form */}
                    {isOwned && user && (
                      <form onSubmit={handleReviewSubmit} className="flex flex-col gap-2 mb-4 bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                        <div className="flex items-center justify-between select-none">
                          <span className="text-xs font-semibold text-on-surface">Write your review:</span>
                          <div className="flex gap-0.5 text-primary-container">
                            {[1, 2, 3, 4, 5].map(starNum => (
                              <button 
                                key={starNum}
                                type="button" 
                                className="material-symbols-outlined text-sm font-bold star-input-btn"
                                onClick={() => setRating(starNum)}
                              >
                                {starNum <= rating ? 'star' : 'star_border'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            className="flex-1 bg-surface border-none text-xs rounded px-2 py-1.5 focus:ring-1 focus:ring-primary text-on-surface outline-none" 
                            type="text" 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write feedback..." 
                            required
                          />
                          <button 
                            type="submit" 
                            disabled={isSubmittingReview}
                            className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-primary-container transition-all flex items-center justify-center min-w-[60px]"
                          >
                            {isSubmittingReview ? (
                              <span className="material-symbols-outlined animate-spin text-xs">sync</span>
                            ) : (
                              'Submit'
                            )}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Reviews List */}
                    <div className="flex-1 overflow-y-auto max-h-[160px] flex flex-col gap-3 pr-2 no-scrollbar">
                      {!asset.reviews || asset.reviews.length === 0 ? (
                        <div className="text-xs text-outline opacity-60 text-center py-6 select-none">
                          No feedback submitted for this asset yet.
                        </div>
                      ) : (
                        asset.reviews.map(rev => (
                          <div key={rev.id} className="bg-white/30 border border-white/20 p-3 rounded-lg flex flex-col gap-1 text-xs">
                            <div className="flex justify-between items-center select-none">
                              <span className="font-semibold text-on-surface">{rev.username}</span>
                              <div className="flex gap-0.5">
                                {Array(5).fill(0).map((_, i) => (
                                  <span 
                                    key={i} 
                                    className="material-symbols-outlined text-[10px] text-primary-container"
                                    style={{ fontVariationSettings: i < rev.rating ? "'FILL' 1" : "'FILL' 0" }}
                                  >
                                    {i < rev.rating ? 'star' : 'star_border'}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-on-surface-variant text-[11px] leading-relaxed">
                              {rev.comment}
                            </p>
                            <span className="text-[9px] text-outline text-right mt-1 select-none">
                              {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
