import React from 'react';
import { motion } from 'framer-motion';
import type { User } from '../types';

interface HeaderProps {
  user: User | null;
  currentTab: 'homepage' | 'storefront' | 'vault' | 'admin';
  onTabChange: (tab: 'homepage' | 'storefront' | 'vault' | 'admin') => void;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onToggleCart: () => void;
  cartCount: number;
  onTopup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentTab,
  onTabChange,
  onLogout,
  onOpenAuth,
  onToggleCart,
  cartCount,
  onTopup,
}) => {
  return (
    <header className="sticky top-0 z-40 flex justify-between items-center px-6 py-4 w-full backdrop-blur-md bg-surface/80 border-b border-white/10 shadow-sm select-none">
      <div 
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => onTabChange('homepage')}
      >
        {/* PulseVault Vector SVG Logo */}
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12L20 32L32 12" stroke="url(#paint0_linear_header)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 20H18L20 16L22 24L24 20H28" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="paint0_linear_header" x1="8" y1="12" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#06B6D4"/>
            </linearGradient>
          </defs>
        </svg>
        
        <h1 className="font-display text-2xl font-black bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent tracking-tight">
          PulseVault
        </h1>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-6">
        <button 
          className={`font-semibold text-xs uppercase tracking-wider transition-colors ${currentTab === 'homepage' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          onClick={() => onTabChange('homepage')}
        >
          Home
        </button>
        <button 
          className={`font-semibold text-xs uppercase tracking-wider transition-colors ${currentTab === 'storefront' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
          onClick={() => onTabChange('storefront')}
        >
          Marketplace
        </button>
        {user && (
          <>
            <button 
              className={`font-semibold text-xs uppercase tracking-wider transition-colors ${currentTab === 'vault' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
              onClick={() => onTabChange('vault')}
            >
              My Vault
            </button>
            {(user.role === 'seller' || user.role === 'admin') && (
              <button 
                className={`font-semibold text-xs uppercase tracking-wider transition-colors ${currentTab === 'admin' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
                onClick={() => onTabChange('admin')}
              >
                Admin Panel
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Wallet Display */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2 text-sm shadow-sm border-white/40"
          >
            <span className="material-symbols-outlined text-sm text-tertiary font-bold">account_balance_wallet</span>
            <span className="font-semibold text-on-surface text-xs">$ {user.balance.toFixed(2)}</span>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onTopup} 
              className="bg-primary/10 hover:bg-primary/20 text-primary rounded-full p-1 leading-none transition-all flex items-center justify-center" 
              title="Add $50.00 Credits"
            >
              <span className="material-symbols-outlined text-xs font-bold">add</span>
            </motion.button>
          </motion.div>
        )}

        {/* Cart Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 text-on-surface-variant hover:text-primary transition-colors" 
          onClick={onToggleCart}
        >
          <span className="material-symbols-outlined text-2xl">shopping_cart</span>
          {cartCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-0 right-0 bg-secondary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
            >
              {cartCount}
            </motion.span>
          )}
        </motion.button>

        {/* Auth Button */}
        <div id="auth-header-container">
          {user ? (
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 10 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl shadow-inner border border-white/20 select-none cursor-pointer"
                title={`${user.role} Account`}
                onClick={() => onTabChange('vault')}
              >
                {user.avatar}
              </motion.div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-on-surface line-clamp-1">{user.username}</span>
                <button 
                  onClick={onLogout} 
                  className="text-[10px] font-semibold text-outline hover:text-error uppercase tracking-wider text-left transition-colors"
                >
                  Logout
                </button>
              </div>
              <button 
                onClick={onLogout} 
                className="lg:hidden p-2 text-outline-variant hover:text-error leading-none" 
                title="Logout"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary to-secondary text-white font-semibold text-xs uppercase px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all" 
              onClick={() => onOpenAuth('login')}
            >
              Login
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
