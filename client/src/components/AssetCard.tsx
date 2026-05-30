import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  isOwned: boolean;
  isInCart: boolean;
  onAddToCart: (id: string) => void;
  onViewDetails: (id: string) => void;
  onOpenLibrary: () => void;
  onToggleCart: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isOwned,
  isInCart,
  onAddToCart,
  onViewDetails,
  onOpenLibrary,
  onToggleCart,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // GSAP 3D Elastic Tilt Effect
  useGSAP(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 15; // slightly higher multiplier for noticeable tilt
      const rotateY = (centerX - x) / 15;

      gsap.to(card, {
        rotateX,
        rotateY,
        scale: 1.025,
        z: 10,
        transformPerspective: 1000,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        z: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.6)',
        overwrite: 'auto'
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, { scope: cardRef });

  const discountPercent = asset.originalPrice 
    ? Math.round((1 - asset.price / asset.originalPrice) * 100)
    : null;

  return (
    <div 
      ref={cardRef}
      onClick={() => onViewDetails(asset.id)}
      className="glass-panel rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border-white/40 cursor-pointer select-none"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="relative h-48 overflow-hidden bg-surface-container" style={{ transform: 'translateZ(20px)' }}>
        <img 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          src={asset.imageUrl} 
          alt={asset.title}
          loading="lazy"
        />
        
        {/* Verified Badge */}
        {asset.isVerified && (
          <div className="absolute top-3 left-3 bg-tertiary-container/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-on-tertiary-container font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="text-[10px] font-semibold text-on-tertiary-container uppercase tracking-wider">
              Verified Asset
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercent !== null && (
          <div className="absolute top-3 right-3 bg-error/90 backdrop-blur-md px-3 py-1 rounded-full">
            <span className="text-[10px] font-semibold text-white uppercase">
              -{discountPercent}% OFF
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col h-[calc(100%-12rem)] min-h-[170px] justify-between" style={{ transform: 'translateZ(10px)' }}>
        <div>
          <span className="text-secondary font-semibold text-[10px] uppercase mb-1 block tracking-wider">
            {asset.category}
          </span>
          <h3 className="font-display text-lg font-bold text-on-surface mb-2 truncate group-hover:text-primary transition-colors">
            {asset.title}
          </h3>
          <div className="flex items-center gap-1 mb-4 text-outline-variant">
            {asset.rating > 0 ? (
              <>
                <span className="material-symbols-outlined text-sm text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="font-bold text-xs text-on-surface">
                  {asset.rating.toFixed(1)}
                </span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm text-outline-variant">
                  star_border
                </span>
                <span className="text-xs text-outline-variant">
                  New
                </span>
              </>
            )}
            <span className="text-xs">({asset.ratingCount || 0})</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            {asset.originalPrice ? (
              <span className="block text-outline-variant text-[11px] font-semibold line-through">
                $ {asset.originalPrice.toFixed(2)}
              </span>
            ) : (
              <span className="block text-[11px] opacity-0">.</span>
            )}
            <span className="text-primary font-bold text-xl">
              $ {asset.price.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(asset.id);
              }}
              className="p-2 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors" 
              title="View details"
            >
              <span className="material-symbols-outlined text-lg">visibility</span>
            </button>

            {isOwned ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLibrary();
                }}
                className="bg-tertiary-container/20 text-tertiary px-3.5 py-1.5 rounded-full font-semibold text-xs hover:bg-tertiary-container hover:text-white transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">done</span> Owned
              </button>
            ) : isInCart ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCart();
                }}
                className="bg-secondary-container/20 text-secondary px-3.5 py-1.5 rounded-full font-semibold text-xs hover:bg-secondary hover:text-white transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">shopping_bag</span> In Cart
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(asset.id);
                }}
                className="bg-primary-container/10 text-primary p-2.5 rounded-full hover:bg-primary-container hover:text-white transition-all neon-glow-primary flex items-center justify-center leading-none"
                title="Add to cart"
              >
                <span className="material-symbols-outlined text-lg">shopping_cart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
