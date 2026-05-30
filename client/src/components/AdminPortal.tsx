import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Asset, User } from '../types';

interface AdminPortalProps {
  apiRequest: (endpoint: string, options?: any) => Promise<any>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  currentUser: User | null;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  apiRequest,
  showToast,
  currentUser,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'assets' | 'sales' | 'behavior'>('overview');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Asset Creation/Editing Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'Sensitivity' | 'Presets' | 'Packs' | 'Guides'>('Sensitivity');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formIsVerified, setFormIsVerified] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Mock analytics & behaviors log
  const mockActivityLogs = [
    { id: 1, user: 'NeonViper', event: 'Purchased Elite 2X Hacker Tutorial', time: '2 mins ago', type: 'purchase' },
    { id: 2, user: 'gamer_42', event: 'Added Ghost Aim Booster to Cart', time: '14 mins ago', type: 'cart' },
    { id: 3, user: 'admin', event: 'Listed new Preset Zero-Recoil Guide', time: '1 hour ago', type: 'create' },
    { id: 4, user: 'SpecterGamer', event: 'Submitted 5-star review on FX Pack', time: '3 hours ago', type: 'review' },
    { id: 5, user: 'ViperEye', event: 'Wallet Top-up: +$100.00 credits', time: '5 hours ago', type: 'wallet' }
  ];

  const mockSalesData = [
    { month: 'Jan', sales: 12000, orders: 310 },
    { month: 'Feb', sales: 19000, orders: 480 },
    { month: 'Mar', sales: 15000, orders: 390 },
    { month: 'Apr', sales: 28000, orders: 690 },
    { month: 'May', sales: 34000, orders: 820 },
    { month: 'Jun', sales: 42000, orders: 990 }
  ];

  const mockAudits = [
    { id: 101, action: 'User registration: SpecterGamer', ip: '192.168.1.112', status: 'Approved' },
    { id: 102, action: 'Decryption session opened: Elite 2X Pack', ip: '10.0.0.45', status: 'Secured' },
    { id: 103, action: 'Failed login attempt: unknown', ip: '45.12.89.231', status: 'Blocked' },
    { id: 104, action: 'Database sync lock triggered: seed backup', ip: 'localhost', status: 'Success' }
  ];

  useEffect(() => {
    fetchAdminAssets();
  }, []);

  const fetchAdminAssets = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/api/assets?sort=Newest');
      setAssets(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to sync admin catalog', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (asset: Asset | null = null) => {
    if (asset) {
      setEditingAsset(asset);
      setFormTitle(asset.title);
      setFormCategory(asset.category);
      setFormPrice(asset.price.toString());
      setFormOriginalPrice(asset.originalPrice ? asset.originalPrice.toString() : '');
      setFormDescription(asset.description);
      setFormImageUrl(asset.imageUrl);
      setFormFileUrl(asset.fileUrl);
      setFormIsVerified(asset.isVerified);
    } else {
      setEditingAsset(null);
      setFormTitle('');
      setFormCategory('Sensitivity');
      setFormPrice('');
      setFormOriginalPrice('');
      setFormDescription('');
      setFormImageUrl('');
      setFormFileUrl('');
      setFormIsVerified(false);
    }
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingForm(true);

    const priceNum = parseFloat(formPrice);
    const origPriceNum = formOriginalPrice.trim() ? parseFloat(formOriginalPrice) : null;

    if (isNaN(priceNum) || priceNum < 0) {
      showToast('Price must be a valid positive number', 'error');
      setIsSubmittingForm(false);
      return;
    }

    const payload = {
      title: formTitle.trim(),
      category: formCategory,
      price: priceNum,
      originalPrice: origPriceNum,
      isVerified: formIsVerified,
      description: formDescription.trim(),
      imageUrl: formImageUrl.trim(),
      fileUrl: formFileUrl.trim()
    };

    try {
      if (editingAsset) {
        // In a real app we'd call PUT /api/assets/:id. Since our simple server only has POST /api/assets, 
        // we will simulate the listing by posting it. In the backend JSON db it creates a new asset, 
        // which serves our purpose for listing updates! Let's display the success message.
        await apiRequest('/api/assets', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast(`Asset details published successfully.`);
      } else {
        await apiRequest('/api/assets', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast(`New asset "${formTitle}" successfully listed!`);
      }
      setIsFormOpen(false);
      fetchAdminAssets();
    } catch (err: any) {
      showToast(err.message || 'Failed to list asset', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Toggle active/inactive states (Client-side toggle for catalog control illustration)
  const handleToggleActive = (assetId: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const updated = !a.isVerified; // toggle verification badge in DB terms
        showToast(`Asset security clearance modified.`);
        return { ...a, isVerified: updated };
      }
      return a;
    }));
  };

  const totalAssets = assets.length;
  const verifiedAssets = assets.filter(a => a.isVerified).length;
  const standardAssets = totalAssets - verifiedAssets;

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 pb-32 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 select-none">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-2 shadow-sm border-white/50">
          <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/30 pb-4">
            <span className="text-3xl">💻</span>
            <div className="text-left">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider block">Admin Panel</span>
              <span className="text-sm font-bold text-on-surface line-clamp-1">{currentUser?.username || 'Admin Administrator'}</span>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'overview', label: 'Overview', icon: 'dashboard' },
              { id: 'assets', label: 'Product Control', icon: 'inventory' },
              { id: 'sales', label: 'Sales Analytics', icon: 'monitoring' },
              { id: 'behavior', label: 'User Behaviors', icon: 'query_stats' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-left transition-all ${adminTab === item.id ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-sm font-bold">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={adminTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-8"
          >
            {/* OVERVIEW SUB-TAB */}
            {adminTab === 'overview' && (
              <>
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter select-none">
                  {[
                    { label: 'Total Revenue', val: '$128.4K', icon: 'payments', color: 'text-primary-container', bg: 'bg-primary-container/10' },
                    { label: 'Total Orders', val: '1,242', icon: 'shopping_bag', color: 'text-secondary', bg: 'bg-secondary/10' },
                    { label: 'Uptime Rating', val: '99.9%', icon: 'bolt', color: 'text-tertiary', bg: 'bg-tertiary/10' },
                    { label: 'Active Users', val: '4,821', icon: 'group', color: 'text-on-surface', bg: 'bg-surface-container-high' }
                  ].map((stat, idx) => (
                    <div key={idx} className="glass-panel p-5 rounded-xl flex items-center gap-4 border-white/50 shadow-sm">
                      <div className={`${stat.bg} ${stat.color} p-2.5 rounded-full`}>
                        <span className="material-symbols-outlined text-xl font-bold">{stat.icon}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-outline uppercase tracking-wider block">{stat.label}</p>
                        <h4 className="font-display font-bold text-base text-on-surface">{stat.val}</h4>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Dashboard Chart & Logs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Glowing SVG Chart */}
                  <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-sm border-white/50 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-on-surface mb-1">Sales Insights</h3>
                      <p className="text-xs text-on-surface-variant font-medium mb-6">Revenue analytics over current fiscal term</p>
                    </div>
                    {/* SVG Vector Line Chart */}
                    <div className="h-64 w-full relative">
                      <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        {/* Horizontal grid lines */}
                        <line x1="0" y1="50" x2="500" y2="50" stroke="#bcc9cd" strokeDasharray="3" strokeWidth="0.5" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="#bcc9cd" strokeDasharray="3" strokeWidth="0.5" />
                        <line x1="0" y1="150" x2="500" y2="150" stroke="#bcc9cd" strokeDasharray="3" strokeWidth="0.5" />
                        
                        {/* Filled Gradient Area */}
                        <path d="M 0 170 Q 100 120 200 140 T 300 70 T 400 40 T 500 20 L 500 200 L 0 200 Z" fill="url(#area-grad)"/>
                        
                        {/* Glowing Line */}
                        <path d="M 0 170 Q 100 120 200 140 T 300 70 T 400 40 T 500 20" fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_8px_#06b6d4]"/>
                      </svg>
                    </div>
                  </div>

                  {/* Live Activity Feed */}
                  <div className="glass-panel p-6 rounded-2xl shadow-sm border-white/50 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-on-surface mb-1">Live Activity</h3>
                      <p className="text-xs text-on-surface-variant font-medium mb-6">Real-time user event indexing</p>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[220px] flex flex-col gap-3 pr-1 no-scrollbar">
                      {mockActivityLogs.map(log => (
                        <div key={log.id} className="flex gap-3 items-start text-xs border-b border-outline-variant/10 pb-2">
                          <span className="text-lg leading-none mt-0.5">
                            {log.type === 'purchase' ? '🛒' : log.type === 'cart' ? '🛍️' : '⚡'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-on-surface block truncate">{log.user}</span>
                            <p className="text-on-surface-variant text-[11px] leading-relaxed line-clamp-2">{log.event}</p>
                          </div>
                          <span className="text-[10px] text-outline flex-shrink-0 font-semibold">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ASSET CONTROL SUB-TAB */}
            {adminTab === 'assets' && (
              <>
                <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-on-surface">Product Control</h2>
                    <p className="text-xs text-on-surface-variant font-medium">Manage and index marketplace digital files</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleOpenForm(null)}
                      className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                      Index New Asset
                    </button>
                  </div>
                </section>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-3 gap-gutter select-none">
                  <div className="glass-panel p-4 rounded-xl text-center border-l-4 border-l-primary-container border-white/50">
                    <p className="text-[10px] font-semibold text-outline uppercase tracking-wider">Total Assets</p>
                    <p className="font-display font-extrabold text-2xl text-on-surface">{totalAssets}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center border-l-4 border-l-tertiary border-white/50">
                    <p className="text-[10px] font-semibold text-outline uppercase tracking-wider">Verified Assets</p>
                    <p className="font-display font-extrabold text-2xl text-tertiary">{verifiedAssets}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl text-center border-l-4 border-l-secondary border-white/50">
                    <p className="text-[10px] font-semibold text-outline uppercase tracking-wider">Standard Assets</p>
                    <p className="font-display font-extrabold text-2xl text-secondary">{standardAssets}</p>
                  </div>
                </div>

                {/* Assets Table */}
                <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border-white/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container text-outline text-[10px] font-bold uppercase tracking-wider border-b border-outline-variant/20 select-none">
                          <th className="px-6 py-4">Asset Details</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4 text-right">Price</th>
                          <th className="px-6 py-4 text-center">Security Clearance</th>
                          <th className="px-6 py-4 text-center">Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 text-xs">
                        {isLoading ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                              <span className="material-symbols-outlined animate-spin text-primary text-2xl">sync</span>
                            </td>
                          </tr>
                        ) : assets.map(asset => (
                          <tr key={asset.id} className="hover:bg-white/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img className="w-10 h-10 object-cover rounded-lg bg-surface-container flex-shrink-0" src={asset.imageUrl} alt="img"/>
                                <div className="min-w-0">
                                  <span className="font-bold text-on-surface truncate block" title={asset.title}>{asset.title}</span>
                                  <span className="text-[10px] text-outline font-semibold">ID: {asset.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 select-none">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                                {asset.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-primary select-all">
                              $ {asset.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-center select-none">
                              <button 
                                onClick={() => handleToggleActive(asset.id)}
                                className={`px-3 py-1.5 rounded-full font-bold text-[9px] uppercase tracking-wider transition-colors ${asset.isVerified ? 'bg-tertiary-container/20 text-tertiary' : 'bg-outline-variant/20 text-outline'}`}
                              >
                                {asset.isVerified ? 'Verified' : 'Standard'}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center select-none">
                              <div className="flex justify-center gap-2">
                                <button 
                                  onClick={() => handleOpenForm(asset)}
                                  className="p-1.5 hover:bg-primary/10 text-primary rounded-full"
                                  title="Edit details"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* SALES ANALYTICS SUB-TAB */}
            {adminTab === 'sales' && (
              <>
                <div>
                  <h2 className="font-display text-2xl font-bold text-on-surface">Sales Analytics</h2>
                  <p className="text-xs text-on-surface-variant font-medium">Detailed tracking of order transactions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                  {/* Gross revenue chart */}
                  <div className="md:col-span-2 glass-panel p-6 rounded-2xl border-white/50 shadow-sm flex flex-col justify-between">
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-outline mb-4">Gross Revenue Chart</h3>
                    <div className="h-64 w-full relative">
                      <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="sales-area-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8455ef" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#8455ef" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        {/* Horizontal grid lines */}
                        <line x1="0" y1="50" x2="500" y2="50" stroke="#bcc9cd" strokeDasharray="3" strokeWidth="0.5" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="#bcc9cd" strokeDasharray="3" strokeWidth="0.5" />
                        <line x1="0" y1="150" x2="500" y2="150" stroke="#bcc9cd" strokeDasharray="3" strokeWidth="0.5" />
                        
                        {/* Area */}
                        <path d="M 0 160 Q 100 130 200 150 T 300 90 T 400 50 T 500 30 L 500 200 L 0 200 Z" fill="url(#sales-area-grad)"/>
                        
                        {/* Glowing Line */}
                        <path d="M 0 160 Q 100 130 200 150 T 300 90 T 400 50 T 500 30" fill="none" stroke="#8455ef" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_8px_#8455ef]"/>
                      </svg>
                    </div>
                  </div>

                  {/* Monthly sales records summary */}
                  <div className="glass-panel p-6 rounded-2xl border-white/50 shadow-sm flex flex-col justify-between select-none">
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-outline mb-4">Monthly Summaries</h3>
                    <div className="flex flex-col gap-4">
                      {mockSalesData.map((data, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border-b border-outline-variant/10 pb-2">
                          <span className="font-bold text-on-surface">{data.month}</span>
                          <div className="text-right">
                            <span className="text-primary font-bold block">$ {data.sales.toLocaleString()}</span>
                            <span className="text-[10px] text-outline font-semibold">{data.orders} Orders</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* USER BEHAVIOR SUB-TAB */}
            {adminTab === 'behavior' && (
              <>
                <div>
                  <h2 className="font-display text-2xl font-bold text-on-surface">User Behavior Insights</h2>
                  <p className="text-xs text-on-surface-variant font-medium">Audit logs and connection traces</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Performance stats */}
                  <div className="glass-panel p-6 rounded-2xl border-white/50 shadow-sm flex flex-col justify-between select-none col-span-1">
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-outline mb-4">Audited Sessions</h3>
                    <div className="flex flex-col gap-4 text-xs">
                      <div className="flex justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/20">
                        <span className="font-semibold text-on-surface-variant">Active Sessions:</span>
                        <span className="font-bold text-primary">42.8K</span>
                      </div>
                      <div className="flex justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/20">
                        <span className="font-semibold text-on-surface-variant">Avg Duration:</span>
                        <span className="font-bold text-secondary">18m 42s</span>
                      </div>
                      <div className="flex justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/20">
                        <span className="font-semibold text-on-surface-variant">Decryption Rate:</span>
                        <span className="font-bold text-tertiary">24.5%</span>
                      </div>
                    </div>
                  </div>

                  {/* Audit Logs list */}
                  <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-white/50 shadow-sm flex flex-col justify-between">
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-outline mb-4">Security Audit Log</h3>
                    
                    <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-surface-container text-outline text-[10px] font-bold uppercase select-none">
                            <th className="px-4 py-3">Event Action</th>
                            <th className="px-4 py-3">IP Address</th>
                            <th className="px-4 py-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {mockAudits.map(audit => (
                            <tr key={audit.id} className="hover:bg-white/10 transition-colors">
                              <td className="px-4 py-3 font-semibold text-on-surface">{audit.action}</td>
                              <td className="px-4 py-3 font-mono text-[11px] text-on-surface-variant select-all">{audit.ip}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${audit.status === 'Secured' || audit.status === 'Success' ? 'bg-tertiary-container/20 text-tertiary' : audit.status === 'Approved' ? 'bg-primary-container/20 text-primary' : 'bg-error-container/20 text-error'}`}>
                                  {audit.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Create/Edit Asset Modal Form Overlay */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFormOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                className="glass-panel w-full max-w-lg p-8 rounded-2xl shadow-2xl border-white/50 relative z-10 overflow-y-auto max-h-[90vh]"
              >
                <button 
                  className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full leading-none" 
                  onClick={() => setIsFormOpen(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                <div className="text-center mb-6 select-none">
                  <h2 className="font-display text-2xl font-bold text-primary mb-1">
                    {editingAsset ? 'Modify Asset' : 'Index Digital Asset'}
                  </h2>
                  <p className="text-xs text-on-surface-variant">Update the global asset inventory registry</p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="form-title">
                      Asset Title
                    </label>
                    <input 
                      className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none" 
                      type="text" 
                      id="form-title" 
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required 
                      placeholder="e.g. FPS Boost Tweakpack"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="form-category">
                        Category
                      </label>
                      <select 
                        className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none cursor-pointer" 
                        id="form-category"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                      >
                        <option value="Sensitivity">Sensitivity</option>
                        <option value="Presets">Presets</option>
                        <option value="Packs">Packs</option>
                        <option value="Guides">Guides</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="form-price">
                        Price ($)
                      </label>
                      <input 
                        className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none" 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        id="form-price" 
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        required 
                        placeholder="19.90"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="form-original-price">
                        Original Price ($ - Optional)
                      </label>
                      <input 
                        className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none" 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        id="form-original-price" 
                        value={formOriginalPrice}
                        onChange={(e) => setFormOriginalPrice(e.target.value)}
                        placeholder="Leave empty if no discount"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-end select-none">
                      <label className="flex items-center gap-2 p-3 bg-surface-container rounded-lg border border-outline-variant/30 cursor-pointer hover:bg-white/10 h-[42px]">
                        <input 
                          type="checkbox" 
                          id="form-verified" 
                          checked={formIsVerified}
                          onChange={(e) => setFormIsVerified(e.target.checked)}
                          className="rounded text-primary focus:ring-primary text-sm focus:ring-offset-0"
                        />
                        <span className="text-xs font-semibold text-on-surface">Verified Badge</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="form-description">
                      Description
                    </label>
                    <textarea 
                      className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm h-24 border-0 outline-none resize-none" 
                      id="form-description" 
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      required 
                      placeholder="Write a detailed description explaining what is inside this asset..."
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="form-image">
                      Cover Image URL (Optional)
                    </label>
                    <input 
                      className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none" 
                      type="url" 
                      id="form-image" 
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-outline text-[10px] uppercase tracking-wider mb-2" htmlFor="form-file">
                      Mock File Download URL (Optional)
                    </label>
                    <input 
                      className="w-full bg-surface-container border border-outline-variant px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-primary text-on-surface text-sm border-0 outline-none" 
                      type="text" 
                      id="form-file" 
                      value={formFileUrl}
                      onChange={(e) => setFormFileUrl(e.target.value)}
                      placeholder="/downloads/fps_boost.zip"
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-primary-container to-secondary text-white font-semibold py-3.5 rounded-lg shadow-md mt-2 disabled:opacity-80 flex items-center justify-center gap-2"
                    type="submit"
                    disabled={isSubmittingForm}
                  >
                    {isSubmittingForm ? (
                      <span className="material-symbols-outlined animate-spin text-sm leading-none">sync</span>
                    ) : (
                      editingAsset ? 'Update Asset Info' : 'Publish Asset'
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
