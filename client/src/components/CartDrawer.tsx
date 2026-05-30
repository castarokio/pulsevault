import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onCheckout,
  isCheckingOut,
}) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md glass-panel shadow-2xl flex flex-col p-6 text-on-surface border-l border-white/30 rounded-l-2xl"
            >
              <div className="flex justify-between items-center border-b border-outline-variant pb-4 mb-4 select-none">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl font-bold">
                    shopping_cart
                  </span>
                  <h2 className="font-display text-xl font-bold">Your Cart</h2>
                </div>
                <button 
                  className="p-2 hover:bg-surface-container rounded-full leading-none" 
                  onClick={onClose}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
                {cartItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 py-16 select-none">
                    <span className="material-symbols-outlined text-5xl mb-3 text-outline">
                      shopping_cart
                    </span>
                    <div className="font-bold text-sm uppercase tracking-wide">Your Cart is Empty</div>
                    <p className="text-xs text-outline max-w-[200px] mt-1">
                      Navigate the index and scan items to store them here.
                    </p>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 p-3 bg-white/40 border border-white/50 rounded-xl items-center"
                    >
                      <img 
                        className="w-16 h-16 object-cover rounded-lg bg-surface-container flex-shrink-0" 
                        src={item.imageUrl} 
                        alt={item.title}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-on-surface truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                          {item.category}
                        </span>
                        <div className="text-primary font-bold text-sm mt-0.5">
                          $ {item.price.toFixed(2)}
                        </div>
                      </div>
                      <button 
                        onClick={() => onRemoveItem(item.id)} 
                        className="p-1 hover:bg-error/10 text-outline-variant hover:text-error rounded-full leading-none transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Summary and Purchase Button */}
              {cartItems.length > 0 && (
                <div className="border-t border-outline-variant pt-6 mt-4">
                  <div className="flex justify-between items-center mb-6 select-none">
                    <span className="font-bold text-xs text-outline-variant uppercase tracking-wider">
                      Subtotal:
                    </span>
                    <span className="font-display text-2xl text-primary font-extrabold">
                      $ {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCheckout} 
                    disabled={isCheckingOut}
                    className="w-full bg-gradient-to-r from-primary-container to-secondary text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-80"
                  >
                    {isCheckingOut ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">hourglass_empty</span>
                        Purchasing...
                      </>
                    ) : (
                      'Confirm Purchase'
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
