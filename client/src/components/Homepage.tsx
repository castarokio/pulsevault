import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HomepageProps {
  onEnterStorefront: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isLoggedIn: boolean;
}

export const Homepage: React.FC<HomepageProps> = ({
  onEnterStorefront,
  onOpenAuth,
  isLoggedIn,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is PulseVault?",
      a: "PulseVault is a next-generation decentralized digital locker specifically designed for gamers, developers, and creators. We secure and index high-performance sensitivities, editing FX presets, citizen cleanup scripts, and gameplay optimization guides."
    },
    {
      q: "How does locker encryption work?",
      a: "Every transaction generates a unique cryptographic AES-256 session key. Files in your Digital Locker are completely encrypted in transit and can only be decrypted locally when you authenticate on your dashboard."
    },
    {
      q: "Are the catalog presets safe to run?",
      a: "Yes. Every single asset marked with the 'Verified Asset' badge undergoes rigorous automated sandboxed runtime scans and manual security clearance checks before listing."
    },
    {
      q: "How can I publish my own assets?",
      a: "Simply initialize an account as a 'Seller / Dev' inside the Auth Portal. Once registered, you will gain instant access to our Seller Dashboard where you can index presets, guides, and packs."
    }
  ];

  return (
    <div className="relative font-sans text-on-surface select-none pb-12">
      {/* Hero Header Area */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 md:px-margin-desktop overflow-hidden">
        {/* Logo Visual SVG */}
        <motion.div 
          initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-6 relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse-slow"></div>
          <svg className="w-24 h-24 relative z-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12L20 32L32 12" stroke="url(#paint0_linear)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 20H18L20 16L22 24L24 20H28" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="paint0_linear" x1="8" y1="12" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6"/>
                <stop offset="1" stopColor="#06B6D4"/>
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl"
        >
          Locker of the Future:<br/>
          <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
            Secure Digital Asset Vault
          </span>
        </motion.h2>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-on-surface-variant max-w-xl text-sm md:text-base mt-4 leading-relaxed font-medium"
        >
          Unlock verified game optimizations, editing presets, and scripts. Protected by cryptographic handshakes and served with lightning speed.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center mt-8 z-10"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnterStorefront}
            className="px-8 py-4 bg-gradient-to-r from-primary-container via-secondary to-secondary-container text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm font-bold">storefront</span>
            Initialize Storefront
          </motion.button>

          {!isLoggedIn && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenAuth('signup')}
              className="px-8 py-4 glass-panel border border-white/50 text-on-surface font-bold rounded-full shadow-md hover:bg-white/40 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm font-bold">lock_open</span>
              Create Digital Locker
            </motion.button>
          )}
        </motion.div>
      </section>

      {/* Features Showcase */}
      <section className="py-16 bg-surface-container-low/30 rounded-3xl border border-white/30 backdrop-blur shadow-sm mx-4 md:mx-0 my-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="font-display text-3xl font-bold tracking-tight text-on-surface mb-12">
            Why Opt for PulseVault?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-white/40 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full text-primary mb-4">
                <span className="material-symbols-outlined text-3xl font-bold">shield</span>
              </div>
              <h4 className="font-display text-lg font-bold text-on-surface mb-2">Military Encryption</h4>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                All purchased products are stored in a private digital locker compiled natively with AES-256 bit ciphers.
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white/40 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-secondary/10 p-3 rounded-full text-secondary mb-4">
                <span className="material-symbols-outlined text-3xl font-bold">verified</span>
              </div>
              <h4 className="font-display text-lg font-bold text-on-surface mb-2">Automated Verifications</h4>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                Automated sandboxes check registry configurations, presets, and guides to ensure absolute system security.
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white/40 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-tertiary/10 p-3 rounded-full text-tertiary mb-4">
                <span className="material-symbols-outlined text-3xl font-bold">speed</span>
              </div>
              <h4 className="font-display text-lg font-bold text-on-surface mb-2">Handshake Downloads</h4>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                High-performance endpoints ensure your gaming files decrypt and compile instantly in under a second.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Collapsible FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h3 className="font-display text-3xl font-bold text-center mb-12">Frequently Answered Queries</h3>
        
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="glass-panel border border-white/50 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-white/20 transition-colors focus:outline-none select-none"
              >
                <span className="font-semibold text-sm text-on-surface">{faq.q}</span>
                <span className={`material-symbols-outlined text-outline transition-transform duration-250 ${activeFaq === idx ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-white/10"
                  >
                    <p className="px-6 pb-5 pt-2 text-xs text-on-surface-variant font-medium leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
