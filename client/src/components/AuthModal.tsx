import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string, password: string, isSignup: boolean, role: 'customer' | 'seller', avatar: string) => Promise<void>;
  initialMode: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialMode,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [avatar, setAvatar] = useState('👾');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode state when initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setUsername('');
    setPassword('');
  }, [initialMode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await onSubmit(username.trim(), password, mode === 'signup', role, avatar);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Credentials authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrorMsg('');
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

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="glass-panel w-full max-w-md p-8 rounded-2xl shadow-2xl border-white/50 relative z-10"
          >
            <button 
              className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full leading-none" 
              onClick={onClose}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="text-center mb-6 select-none">
              <h2 className="font-display text-2xl font-bold text-primary mb-1">
                {mode === 'login' ? 'Welcome Back' : 'Initialize Account'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {mode === 'login' ? 'Verify user credentials to access vault' : 'Establish login keys inside the catalog directory'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="username">
                  Username
                </label>
                <input 
                  className="w-full bg-surface-container border border-outline-variant px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface text-sm border-0 outline-none" 
                  type="text" 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                  placeholder="Enter username..."
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="password">
                  Password
                </label>
                <input 
                  className="w-full bg-surface-container border border-outline-variant px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface text-sm border-0 outline-none" 
                  type="password" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  placeholder="••••••••"
                />
              </div>

              {/* Avatar Selection (Signup only) */}
              {mode === 'signup' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2">
                    Select Avatar
                  </label>
                  <div className="flex gap-4 justify-around text-3xl py-2 bg-surface-container rounded-lg">
                    {['👾', '🐉', '⚡', '🔮'].map(emoji => (
                      <label 
                        key={emoji}
                        className={`cursor-pointer p-2 rounded hover:bg-white/20 transition-all border border-transparent ${avatar === emoji ? 'bg-white/40 border-white/50 shadow-sm scale-110' : ''}`}
                      >
                        <input 
                          type="radio" 
                          name="avatar" 
                          value={emoji} 
                          className="hidden" 
                          checked={avatar === emoji}
                          onChange={() => setAvatar(emoji)}
                        /> 
                        {emoji}
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Role Selection (Signup only) */}
              {mode === 'signup' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2">
                    Account Type
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 bg-surface-container rounded-lg border cursor-pointer hover:bg-white/10 ${role === 'customer' ? 'border-primary shadow-sm bg-white/15' : 'border-outline-variant/30'}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="customer" 
                        checked={role === 'customer'}
                        onChange={() => setRole('customer')}
                        className="text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-xs font-semibold text-on-surface">Customer</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 bg-surface-container rounded-lg border cursor-pointer hover:bg-white/10 ${role === 'seller' ? 'border-primary shadow-sm bg-white/15' : 'border-outline-variant/30'}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="seller"
                        checked={role === 'seller'}
                        onChange={() => setRole('seller')}
                        className="text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-xs font-semibold text-on-surface">Seller / Dev</span>
                    </label>
                  </div>
                </motion.div>
              )}

              {errorMsg && (
                <div className="text-error text-xs font-semibold select-none">
                  {errorMsg}
                </div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3.5 rounded-lg shadow-md mt-2 disabled:opacity-80"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-sm leading-none">sync</span>
                ) : mode === 'login' ? (
                  'Access Vault'
                ) : (
                  'Register Profile'
                )}
              </motion.button>
            </form>

            <div className="text-center mt-6 pt-4 border-t border-outline-variant/30 select-none">
              <button 
                className="text-secondary font-semibold text-[10px] hover:underline uppercase tracking-wider" 
                onClick={toggleMode}
              >
                {mode === 'login' ? 'Create New Account (Sign Up)' : 'Already have credentials? Sign In'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
