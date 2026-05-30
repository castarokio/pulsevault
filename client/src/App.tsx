import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { AssetCard } from './components/AssetCard';
import { ScannerSection } from './components/ScannerSection';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { DetailModal } from './components/DetailModal';
import { Homepage } from './components/Homepage';
import { VaultView } from './components/VaultView';
import { AdminPortal } from './components/AdminPortal';
import type { User, Asset, ToastMessage } from './types';

const API_URL = ''; // local proxy redirects /api to server

export default function App() {
  // Tab Routing State
  const [currentTab, setCurrentTab] = useState<'homepage' | 'storefront' | 'vault' | 'admin'>('homepage');

  // Global State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [cart, setCart] = useState<Asset[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [ownedAssetIds, setOwnedAssetIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Assets');
  const [activeSort, setActiveSort] = useState('Newest');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Scanning State
  const [isScanning, setIsScanning] = useState(false);

  // Overlay Modals State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewingAssetId, setViewingAssetId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Load profile and search assets on initialization
  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    } else {
      triggerSearch();
    }
  }, [token]);

  // Toast Manager
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // HTTP API Client
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, { 
        ...options, 
        headers: headers as HeadersInit 
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Server error occurred');
      }
      return json;
    } catch (err: any) {
      console.error(`API Error: ${endpoint}`, err);
      throw err;
    }
  };

  // Auth Functions
  const fetchUserProfile = async (authToken: string) => {
    try {
      const data = await apiRequest('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(data.user);
      setOwnedAssetIds(new Set(data.purchasedAssetIds));
      
      // Load cart
      const cartData = await apiRequest('/api/cart', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setCart(cartData);
      
      // Load assets (to sync owned indicators)
      await triggerSearch(authToken);
    } catch (error) {
      handleLogout();
    }
  };

  const handleAuthSubmit = async (
    username: string, 
    password: string, 
    isSignup: boolean, 
    role: 'customer' | 'seller', 
    avatar: string
  ) => {
    const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
    const payload = isSignup 
      ? { username, password, role, avatar }
      : { username, password };

    const data = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    
    // Redirect to storefront on success
    setCurrentTab('storefront');
    showToast(isSignup ? 'Account initialized successfully!' : `Access granted. Welcome back, ${username}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCart([]);
    setOwnedAssetIds(new Set());
    setIsCartOpen(false);
    setCurrentTab('homepage');
    showToast('Secure session terminated.', 'info');
  };

  const handleTopup = async () => {
    if (!user) return;
    try {
      const result = await apiRequest('/api/auth/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amount: 50.00 }),
      });
      setUser((prev) => prev ? { ...prev, balance: result.balance } : null);
      showToast('PulseWallet funded: +$50.00 credits added.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Marketplace Catalog Functions
  const triggerSearch = async (authToken = token) => {
    setIsScanning(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchQuery,
        category: activeCategory,
        sort: activeSort,
      });

      const response = await fetch(`${API_URL}/api/assets?${queryParams}`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      const data = await response.json();
      
      setTimeout(() => {
        setAssets(data);
        setIsScanning(false);
      }, 700);
    } catch (error) {
      setIsScanning(false);
      showToast('Failed to load marketplace index.', 'error');
    }
  };

  // Trigger search when category changes
  useEffect(() => {
    if (currentTab === 'storefront') {
      triggerSearch();
    }
  }, [activeCategory, currentTab]);

  const handleQuickScan = (term: string) => {
    setSearchQuery(term);
    setTimeout(() => {
      setIsScanning(true);
      triggerSearch();
    }, 50);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All Assets');
    setActiveSort('Newest');
    showToast('Marketplace filters cleared.', 'info');
  };

  // Cart Functions
  const handleAddToCart = async (assetId: string) => {
    if (!user) {
      setAuthMode('login');
      setIsAuthOpen(true);
      showToast('Authentication credentials needed to use cart.', 'info');
      return;
    }

    try {
      const updatedCart = await apiRequest('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ assetId }),
      });
      setCart(updatedCart);
      showToast('Asset added to cart successfully.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveFromCart = async (assetId: string) => {
    try {
      const updatedCart = await apiRequest('/api/cart/remove', {
        method: 'POST',
        body: JSON.stringify({ assetId }),
      });
      setCart(updatedCart);
      showToast('Asset removed from cart.', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      const result = await apiRequest('/api/cart/checkout', { method: 'POST' });
      showToast(result.message, 'success');
      
      setCart([]);
      if (user) {
        setUser({ ...user, balance: result.balance });
      }
      
      if (token) {
        await fetchUserProfile(token);
      }
      setIsCartOpen(false);
      // Switch to vault to view purchased item!
      setCurrentTab('vault');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Review Submissions
  const handleSubmitReview = async (assetId: string, rating: number, comment: string) => {
    await apiRequest(`/api/assets/${assetId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
    showToast('Review submitted. Security clearance updated.');
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const focusSearch = () => {
    setCurrentTab('storefront');
    setTimeout(() => {
      const el = document.getElementById('main-search');
      if (el) el.focus();
    }, 150);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-between bg-background">
      {/* Background radial glows */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] ambient-glow-1 -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-[400px] right-10 w-[600px] h-[600px] ambient-glow-2 -z-10 pointer-events-none rounded-full" />

      {/* Floating Toast Notification Area */}
      <div id="toast-container" className="fixed bottom-20 md:bottom-8 right-4 z-[99] flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ translateY: 50, scale: 0.9, opacity: 0 }}
              animate={{ translateY: 0, scale: 1, opacity: 1 }}
              exit={{ translateY: -20, opacity: 0, transition: { duration: 0.2 } }}
              className={`pointer-events-auto shadow-xl glass-panel p-4 rounded-xl flex items-center gap-3 border-l-4 min-w-[280px] max-w-sm ${
                t.type === 'success' ? 'border-l-tertiary-container' : t.type === 'error' ? 'border-l-error' : 'border-l-secondary'
              }`}
            >
              <span className={`material-symbols-outlined ${
                t.type === 'success' ? 'text-tertiary' : t.type === 'error' ? 'text-error' : 'text-secondary'
              }`}>
                {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'cancel' : 'info'}
              </span>
              <div className="flex-1 text-xs font-semibold text-on-surface">{t.message}</div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="p-1 hover:bg-surface-container rounded-full leading-none"
              >
                <span className="material-symbols-outlined text-[14px] text-outline">close</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div>
        {/* Header */}
        <Header
          user={user}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onLogout={handleLogout}
          onOpenAuth={openAuth}
          onToggleCart={() => setIsCartOpen(!isCartOpen)}
          cartCount={cart.length}
          onTopup={handleTopup}
        />

        {/* Dynamic Route Content switches */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Tab 1: HOMEPAGE */}
            {currentTab === 'homepage' && (
              <Homepage
                onEnterStorefront={() => setCurrentTab('storefront')}
                onOpenAuth={openAuth}
                isLoggedIn={!!user}
              />
            )}

            {/* Tab 2: STOREFRONT */}
            {currentTab === 'storefront' && (
              <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-4">
                {/* Search center */}
                <ScannerSection
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onScan={() => triggerSearch()}
                  isScanning={isScanning}
                  onQuickScan={handleQuickScan}
                />

                {/* Filters control bar */}
                <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 select-none">
                  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full no-scrollbar">
                    {['All Assets', 'Sensitivity', 'Presets', 'Packs', 'Guides'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex-shrink-0 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wide transition-all ${
                          activeCategory === cat
                            ? 'bg-primary-container text-on-primary-container shadow-md'
                            : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                        }`}
                      >
                        {cat === 'All Assets' && (
                          <span className="material-symbols-outlined text-xs mr-1 align-middle">grid_view</span>
                        )}
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                      <select
                        value={activeSort}
                        onChange={(e) => {
                          setActiveSort(e.target.value);
                          setTimeout(() => triggerSearch(), 50);
                        }}
                        className="appearance-none w-full bg-surface-container border border-outline-variant px-6 py-2 rounded-lg font-bold text-xs text-on-surface-variant pr-10 focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer border-0 outline-none"
                      >
                        <option value="Newest">Sort by: Newest</option>
                        <option value="Price: Low to High">Price: Low to High</option>
                        <option value="Price: High to Low">Price: High to Low</option>
                        <option value="Top Rated">Top Rated</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                        expand_more
                      </span>
                    </div>
                  </div>
                </section>

                {/* Staggered grid results */}
                <AnimatePresence mode="popLayout">
                  {!isScanning && assets.length > 0 && (
                    <motion.section 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                      {assets.map((asset) => (
                        <AssetCard
                          key={asset.id}
                          asset={asset}
                          isOwned={ownedAssetIds.has(asset.id)}
                          isInCart={cart.some((item) => item.id === asset.id)}
                          onAddToCart={handleAddToCart}
                          onViewDetails={(id) => setViewingAssetId(id)}
                          onOpenLibrary={() => setCurrentTab('vault')}
                          onToggleCart={() => setIsCartOpen(true)}
                        />
                      ))}
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* Empty State */}
                {!isScanning && assets.length === 0 && (
                  <section className="flex flex-col items-center justify-center py-24 text-center select-none">
                    <div className="relative w-48 h-48 mb-8">
                      <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full radar-scan" />
                      <div className="absolute inset-4 border border-secondary/10 rounded-full radar-scan" style={{ animationDelay: '-1s' }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-primary opacity-40">radar</span>
                      </div>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-on-surface mb-2">No Vault Data Found</h2>
                    <p className="font-sans text-on-surface-variant text-sm max-w-sm">
                      We couldn't locate any assets matching your current query. Try adjusting your scan parameters.
                    </p>
                    <button
                      className="mt-6 text-primary font-bold text-xs uppercase tracking-wide flex items-center gap-2 hover:underline mx-auto"
                      onClick={handleResetFilters}
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span> Clear Filters
                    </button>
                  </section>
                )}

                {/* Scanning Spinner */}
                {isScanning && (
                  <div className="flex flex-col items-center justify-center py-32 select-none">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 border-2 border-dashed border-primary/45 rounded-full radar-scan" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl animate-spin text-primary">sync</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary uppercase tracking-widest">
                      Scanning Vault Indexes...
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: MY VAULT (LIBRARY) */}
            {currentTab === 'vault' && (
              <VaultView
                apiRequest={apiRequest}
                showToast={showToast}
              />
            )}

            {/* Tab 4: ADMIN PORTAL */}
            {currentTab === 'admin' && (
              <AdminPortal
                apiRequest={apiRequest}
                showToast={showToast}
                currentUser={user}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="w-full px-margin-mobile md:px-margin-desktop py-12 flex flex-col md:flex-row justify-between items-center border-t border-outline-variant bg-surface-container-lowest select-none">
        <div className="mb-6 md:mb-0 text-center md:text-left flex items-center gap-3">
          {/* PulseVault Logo */}
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12L20 32L32 12" stroke="url(#paint0_linear_footer)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 20H18L20 16L22 24L24 20H28" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="paint0_linear_footer" x1="8" y1="12" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6"/>
                <stop offset="1" stopColor="#06B6D4"/>
              </linearGradient>
            </defs>
          </svg>
          <div>
            <h2 className="font-display text-lg font-bold text-on-surface">PulseVault</h2>
            <p className="font-sans text-[10px] text-outline">© 2026 PulseVault. Secure Digital Assets.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold">
          <a className="font-sans text-outline hover:text-secondary underline transition-all" href="#">Support</a>
          <a className="font-sans text-outline hover:text-secondary underline transition-all" href="#">License Agreement</a>
          <a className="font-sans text-outline hover:text-secondary underline transition-all" href="#">Terms of Service</a>
          <a className="font-sans text-outline hover:text-secondary underline transition-all" href="#">Privacy</a>
        </div>
      </footer>

      {/* Bottom Nav Bar (Mobile HUD) */}
      <nav className="fixed bottom-0 left-0 w-full z-35 flex justify-around items-center px-4 py-3 bg-surface/75 backdrop-blur-lg border-t border-white/20 shadow-[0_-4px_30px_rgba(0,0,0,0.15)] rounded-t-xl md:hidden select-none">
        <a 
          className={`flex flex-col items-center justify-center transition-opacity ${currentTab === 'homepage' ? 'text-primary' : 'text-on-surface-variant opacity-60 hover:opacity-100'}`} 
          href="#"
          onClick={(e) => { e.preventDefault(); setCurrentTab('homepage'); }}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-bold text-[9px] uppercase tracking-wide">Home</span>
        </a>
        <a 
          className={`flex flex-col items-center justify-center transition-opacity ${currentTab === 'storefront' ? 'text-primary' : 'text-on-surface-variant opacity-60 hover:opacity-100'}`} 
          href="#"
          onClick={(e) => { e.preventDefault(); focusSearch(); }}
        >
          <span className="material-symbols-outlined">search</span>
          <span className="font-bold text-[9px] uppercase tracking-wide">Search</span>
        </a>
        {user && (
          <a 
            className={`flex flex-col items-center justify-center transition-opacity ${currentTab === 'vault' ? 'text-primary' : 'text-on-surface-variant opacity-60 hover:opacity-100'}`} 
            href="#"
            onClick={(e) => { e.preventDefault(); setCurrentTab('vault'); }}
          >
            <span className="material-symbols-outlined">category</span>
            <span className="font-bold text-[9px] uppercase tracking-wide">Library</span>
          </a>
        )}
        <a 
          className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity" 
          href="#"
          onClick={(e) => { e.preventDefault(); setIsCartOpen(true); }}
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          <span className="font-bold text-[9px] uppercase tracking-wide">Cart</span>
        </a>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSubmit={handleAuthSubmit}
        initialMode={authMode}
      />

      {/* Detail Modal */}
      <DetailModal
        isOpen={viewingAssetId !== null}
        onClose={() => setViewingAssetId(null)}
        assetId={viewingAssetId}
        user={user}
        isOwned={viewingAssetId ? ownedAssetIds.has(viewingAssetId) : false}
        isInCart={viewingAssetId ? cart.some((item) => item.id === viewingAssetId) : false}
        onAddToCart={handleAddToCart}
        onOpenLibrary={() => setCurrentTab('vault')}
        onToggleCart={() => setIsCartOpen(true)}
        onSubmitReview={handleSubmitReview}
        apiRequest={apiRequest}
      />
    </div>
  );
}
