import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Initial Seed Data
const INITIAL_ASSETS = [
  {
    id: "asset-1",
    title: "Elite 2X Hacker Tutorial",
    category: "Sensitivity",
    description: "The ultimate sensitivity config guide and register tweaks for double responsiveness. Perfect for competitive play and high-precision aiming in modern tactical shooters.",
    price: 17.90,
    originalPrice: 34.90,
    rating: 4.0,
    ratingCount: 124,
    isVerified: true,
    tag: "Verified Asset",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCswi5m62KyAFplnUF3TmRIc7j8wetZnbRwMhADLx9UFyZZBuirAo8V1tXyWxQtvFUwm8Ix0caXA4v3vJ0sUjhrwDBvRGMM_XxJjNhN2FfiTrWpHoSSQKF6EejpTtRpG36d67LyCFw9HHYg1xiZpo2bKQzmRmUeV9f8fnmaqwg1hV0EsVKoFBHGeGMa7hz7zubD9tC_0WqrsHceA8sw4XaZWVZdIcFQinO4zfCl5d5X2iENsxH_Lx43-1L4_U-fabtJCMHFZGNk4xKD",
    fileUrl: "/downloads/elite_2x_sens.zip",
    sellerId: "admin",
    createdAt: new Date("2026-01-10").toISOString()
  },
  {
    id: "asset-2",
    title: "TXT Mandela FF Max Standard",
    category: "Presets",
    description: "Highly optimized texture pack and UI presets inspired by the Mandela catalog aesthetic. Gives a sleek, dark cyberpunk look to your character and HUD overlays.",
    price: 7.90,
    originalPrice: 17.00,
    rating: 4.5,
    ratingCount: 89,
    isVerified: false,
    tag: "-53% OFF",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBU_9LwaQ3fLQjdh58hkcQTEKWINdWKcQNrHe0daqxMjbvcnBBY_N9gQsgG0z8JGeqcbtUzCkXqFzRJctdEOcx7aZGNd-5ZaSpSZjXx6R1kwt_-9OAk88NsghPaRb-B-BaccWYBpuKOctTPyoVs_XpGbOAmNN4nNSFRzW7SNimKwx7Q0XlHrMLWpOVuY_UsyzYGc7FsLV5mrg1JrjPiytR9r_2XfZnsfepP9rN4iBkeoWAE439C68RtEzq8PnnPhETm0hoRKCofMOhq",
    fileUrl: "/downloads/txt_mandela_presets.zip",
    sellerId: "admin",
    createdAt: new Date("2026-02-15").toISOString()
  },
  {
    id: "asset-3",
    title: "Pulse Ultimate Editing FX",
    category: "Presets",
    description: "An elite collection of editing FX presets for Premiere Pro and After Effects. Includes transition overlays, custom neon glow lines, speed ramp flow keys, and color grading LUTs.",
    price: 49.90,
    originalPrice: 97.90,
    rating: 5.0,
    ratingCount: 342,
    isVerified: false,
    tag: "Bestseller",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOGpgsejVVs9rMIuevX1RAs8DBWyH5FI8qiqTLCf8mTkgXavHjRefkFRH7dmaPwnw22K0eHtaZt-GYhnu33etjEsU6R8Ep2bENhpZ5XD6xtDrhRsLCvkJPFm_Tz4zCTDBxtCbP1zITcqoU1PW9Xx8zXP2NcHkkBxfEaOuTcLdvVGDk8WVmXmjizLYkiH_8iui6P8RUmitHdLY45l_yHgUql3q-nHPkmYK5QSErm6fVY2dxGHHvDBtTcKM9i3k5c6qkoe5rQNxZoTqa",
    fileUrl: "/downloads/pulse_ultimate_fx.zip",
    sellerId: "admin",
    createdAt: new Date("2026-03-01").toISOString()
  },
  {
    id: "asset-4",
    title: "Citizen Clean FiveM Pack",
    category: "Packs",
    description: "Optimize your FiveM game performance. This package cleans up unnecessary cache files, removes distant fog, configures optimized low-latency textures, and spikes FPS in crowded servers.",
    price: 29.90,
    originalPrice: null,
    rating: 4.0,
    ratingCount: 56,
    isVerified: false,
    tag: "New Drop",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvTYCjh31LxRUG1AbdnxOo8DYlNWFJiQFjkSOMHOSwpCwDqyhmyLNTBJlee0xfK2yAWOw3Nls_HDmyraqKfM8unZ01x1km5UeMN2ra9DSgkpEzaztsJ-GBJWDnjEz-TyHL1l7tyg_AqPNGkn35dJ_hSVMr4c5E2SWaR_r5c1CaQpKe6maOoDq9ZZgB_Ilq6pxYs4NiEF60dcMUVe7xB1uG_nGB3BUfwds6RL-UTW2wLQJmuloNCw6zEL-Po80UFEwc-DBOIyt2pi9I",
    fileUrl: "/downloads/fivem_citizen_clean.zip",
    sellerId: "admin",
    createdAt: new Date("2026-03-20").toISOString()
  },
  {
    id: "asset-5",
    title: "Ghost Aim Booster Pro",
    category: "Sensitivity",
    description: "Professional mouse driver tweaks and 1-to-1 raw input configuration tools. Calibrates pixel skipping and smooths out micro-adjustments for perfect tracking.",
    price: 14.90,
    originalPrice: 24.90,
    rating: 4.8,
    ratingCount: 210,
    isVerified: true,
    tag: "Verified Asset",
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600",
    fileUrl: "/downloads/ghost_aim_booster.zip",
    sellerId: "admin",
    createdAt: new Date("2026-04-05").toISOString()
  },
  {
    id: "asset-6",
    title: "Neo-Neon HUD Stream Overlay",
    category: "Presets",
    description: "Complete stream package featuring reactive neon glass bars, webcam borders, customized transition stinger, and stream starting/ending dynamic panels. Optimized for OBS Studio.",
    price: 39.90,
    originalPrice: 59.90,
    rating: 4.7,
    ratingCount: 75,
    isVerified: true,
    tag: "Streamer Pick",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
    fileUrl: "/downloads/neo_neon_hud.zip",
    sellerId: "admin",
    createdAt: new Date("2026-04-18").toISOString()
  },
  {
    id: "asset-7",
    title: "FPS Optimizer Max Registry",
    category: "Packs",
    description: "Safe registry configurations and CPU parking tools designed to minimize input latency and maximize frames-per-second on mid-to-low end hardware setups.",
    price: 19.90,
    originalPrice: 29.90,
    rating: 4.2,
    ratingCount: 312,
    isVerified: false,
    tag: "Hot Seller",
    imageUrl: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=600",
    fileUrl: "/downloads/fps_optimizer_registry.zip",
    sellerId: "admin",
    createdAt: new Date("2026-05-02").toISOString()
  },
  {
    id: "asset-8",
    title: "Zero-Recoil Sensitivity Guide",
    category: "Guides",
    description: "Master recoil control with this detailed gameplay breakdown, dynamic mouse sensitivity multipliers, and in-game recoil-pattern training presets.",
    price: 9.90,
    originalPrice: 24.90,
    rating: 4.9,
    ratingCount: 430,
    isVerified: true,
    tag: "Trending",
    imageUrl: "https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&q=80&w=600",
    fileUrl: "/downloads/zero_recoil_guide.zip",
    sellerId: "admin",
    createdAt: new Date("2026-05-20").toISOString()
  }
];

const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    assetId: "asset-1",
    userId: "gamer-1",
    username: "NeonViper",
    rating: 5,
    comment: "This literally doubled my headshot percentage. The registry tweaks are pure magic!",
    createdAt: new Date("2026-04-12").toISOString()
  },
  {
    id: "rev-2",
    assetId: "asset-1",
    userId: "gamer-2",
    username: "SpecterGamer",
    rating: 3,
    comment: "Decent tweaks, but you can find some of this for free. Still, having it packaged cleanly is nice.",
    createdAt: new Date("2026-05-01").toISOString()
  },
  {
    id: "rev-3",
    assetId: "asset-3",
    userId: "gamer-1",
    username: "NeonViper",
    rating: 5,
    comment: "Absolutely top-tier AE templates. The glowing effects render incredibly fast.",
    createdAt: new Date("2026-05-10").toISOString()
  }
];

// Helper to read database
async function readDb() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with seed data
    const initialDb = {
      users: [
        {
          id: "admin",
          username: "admin",
          passwordHash: await bcrypt.hash("admin123", 10),
          role: "seller",
          balance: 500.00,
          avatar: "⚡",
          createdAt: new Date().toISOString()
        },
        {
          id: "gamer-1",
          username: "NeonViper",
          passwordHash: await bcrypt.hash("viper123", 10),
          role: "customer",
          balance: 100.00,
          avatar: "🐉",
          createdAt: new Date().toISOString()
        }
      ],
      assets: INITIAL_ASSETS,
      cart: {}, // userId -> array of assetIds
      purchases: [
        {
          id: "purch-1",
          userId: "gamer-1",
          assetId: "asset-1",
          pricePaid: 17.90,
          purchasedAt: new Date("2026-04-10").toISOString()
        }
      ],
      reviews: INITIAL_REVIEWS
    };
    await writeDb(initialDb);
    return initialDb;
  }
}

// Helper to write database
async function writeDb(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Database APIs
export const db = {
  // --- USERS ---
  async getUserById(id) {
    const data = await readDb();
    return data.users.find(u => u.id === id);
  },

  async getUserByUsername(username) {
    const data = await readDb();
    return data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  async createUser({ username, password, role = "customer", avatar = "👾" }) {
    const data = await readDb();
    if (data.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("Username already taken");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: "user-" + Math.random().toString(36).substring(2, 9),
      username,
      passwordHash,
      role,
      balance: 100.00, // Initial sign-up gift balance!
      avatar,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    await writeDb(data);
    return newUser;
  },

  async topupWallet(userId, amount) {
    const data = await readDb();
    const userIndex = data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    data.users[userIndex].balance += Number(amount);
    await writeDb(data);
    return data.users[userIndex];
  },

  // --- ASSETS ---
  async getAssets({ search = "", category = "All Assets", sort = "Newest" }) {
    const data = await readDb();
    let filtered = [...data.assets];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== "All Assets") {
      filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    // Sorting
    if (sort === "Price: Low to High") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "Price: High to Low") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === "Top Rated") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: Newest
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  },

  async getAssetById(id) {
    const data = await readDb();
    return data.assets.find(a => a.id === id);
  },

  async createAsset({ title, category, description, price, originalPrice, isVerified, imageUrl, fileUrl, sellerId }) {
    const data = await readDb();
    const newAsset = {
      id: "asset-" + Math.random().toString(36).substring(2, 9),
      title,
      category,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      rating: 0,
      ratingCount: 0,
      isVerified: !!isVerified,
      tag: isVerified ? "Verified Asset" : "New Drop",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
      fileUrl: fileUrl || "/downloads/mock_asset.zip",
      sellerId,
      createdAt: new Date().toISOString()
    };
    data.assets.push(newAsset);
    await writeDb(data);
    return newAsset;
  },

  // --- CART ---
  async getCart(userId) {
    const data = await readDb();
    const assetIds = data.cart[userId] || [];
    return data.assets.filter(a => assetIds.includes(a.id));
  },

  async addToCart(userId, assetId) {
    const data = await readDb();
    if (!data.cart[userId]) {
      data.cart[userId] = [];
    }
    // Prevent duplicates
    if (!data.cart[userId].includes(assetId)) {
      data.cart[userId].push(assetId);
      await writeDb(data);
    }
    return this.getCart(userId);
  },

  async removeFromCart(userId, assetId) {
    const data = await readDb();
    if (data.cart[userId]) {
      data.cart[userId] = data.cart[userId].filter(id => id !== assetId);
      await writeDb(data);
    }
    return this.getCart(userId);
  },

  // --- CHECKOUT ---
  async checkout(userId) {
    const data = await readDb();
    const cartIds = data.cart[userId] || [];
    if (cartIds.length === 0) throw new Error("Cart is empty");

    const userIndex = data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const user = data.users[userIndex];
    const cartAssets = data.assets.filter(a => cartIds.includes(a.id));
    
    // Calculate total
    const total = cartAssets.reduce((sum, item) => sum + item.price, 0);
    
    if (user.balance < total) {
      throw new Error(`Insufficient funds. You need $ ${(total - user.balance).toFixed(2)} more.`);
    }

    // Check if any cart item is already purchased
    const ownedAssetIds = data.purchases.filter(p => p.userId === userId).map(p => p.assetId);
    const alreadyOwned = cartAssets.filter(a => ownedAssetIds.includes(a.id));
    if (alreadyOwned.length > 0) {
      throw new Error(`You already own: ${alreadyOwned.map(a => a.title).join(', ')}`);
    }

    // Deduct balance
    user.balance -= total;

    // Create purchase records
    cartAssets.forEach(asset => {
      data.purchases.push({
        id: "purch-" + Math.random().toString(36).substring(2, 9),
        userId,
        assetId: asset.id,
        pricePaid: asset.price,
        purchasedAt: new Date().toISOString()
      });
    });

    // Clear cart
    data.cart[userId] = [];

    await writeDb(data);
    return {
      balance: user.balance,
      purchasedCount: cartAssets.length
    };
  },

  async getPurchasedAssets(userId) {
    const data = await readDb();
    const purchasedIds = data.purchases.filter(p => p.userId === userId).map(p => p.assetId);
    return data.assets.filter(a => purchasedIds.includes(a.id));
  },

  // --- REVIEWS ---
  async getReviews(assetId) {
    const data = await readDb();
    return data.reviews.filter(r => r.assetId === assetId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async addReview(assetId, userId, username, rating, comment) {
    const data = await readDb();
    const assetIndex = data.assets.findIndex(a => a.id === assetId);
    if (assetIndex === -1) throw new Error("Asset not found");

    const newReview = {
      id: "rev-" + Math.random().toString(36).substring(2, 9),
      assetId,
      userId,
      username,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    };

    data.reviews.push(newReview);

    // Recalculate asset average rating
    const assetReviews = data.reviews.filter(r => r.assetId === assetId);
    const sum = assetReviews.reduce((s, r) => s + r.rating, 0);
    const avg = sum / assetReviews.length;

    data.assets[assetIndex].rating = Number(avg.toFixed(1));
    data.assets[assetIndex].ratingCount = assetReviews.length;

    await writeDb(data);
    return {
      review: newReview,
      averageRating: data.assets[assetIndex].rating,
      ratingCount: data.assets[assetIndex].ratingCount
    };
  }
};
