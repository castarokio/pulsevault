import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'pulsevault-neon-secret-key-1337';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build directory
app.use(express.static(path.join(process.cwd(), 'client', 'dist')));

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.getUserById(decoded.userId);
    if (!user) {
      return res.status(403).json({ error: 'User no longer exists' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// --- AUTH ENDPOINTS ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, password, role, avatar } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const newUser = await db.createUser({ username, password, role, avatar });
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Don't send password hash back
    const { passwordHash, ...userResponse } = newUser;
    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
import bcrypt from 'bcryptjs';
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash, ...userResponse } = user;
    
    res.json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get User Profile & Library
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const purchased = await db.getPurchasedAssets(req.user.id);
    const { passwordHash, ...userResponse } = req.user;
    res.json({
      user: userResponse,
      purchasedAssetIds: purchased.map(p => p.id)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Top-up wallet balance
app.post('/api/auth/wallet/topup', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid top-up amount' });
  }

  try {
    const updatedUser = await db.topupWallet(req.user.id, amount);
    res.json({ balance: updatedUser.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- ASSET ENDPOINTS ---

// Get Assets (Filter + Search + Sort)
app.get('/api/assets', async (req, res) => {
  const { search, category, sort } = req.query;
  try {
    const assets = await db.getAssets({ search, category, sort });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Get Asset Detail
app.get('/api/assets/:id', async (req, res) => {
  try {
    const asset = await db.getAssetById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    
    const reviews = await db.getReviews(req.params.id);
    res.json({ ...asset, reviews });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset detail' });
  }
});

// Add New Asset (Seller Portal)
app.post('/api/assets', authenticateToken, async (req, res) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only sellers or admins can list assets' });
  }

  const { title, category, description, price, originalPrice, isVerified, imageUrl, fileUrl } = req.body;

  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({ error: 'Title, category, description, and price are required' });
  }

  if (isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  try {
    const newAsset = await db.createAsset({
      title,
      category,
      description,
      price,
      originalPrice,
      isVerified,
      imageUrl,
      fileUrl,
      sellerId: req.user.id
    });
    res.status(201).json(newAsset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list asset' });
  }
});


// --- CART ENDPOINTS ---

// Get Cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await db.getCart(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to Cart
app.post('/api/cart/add', authenticateToken, async (req, res) => {
  const { assetId } = req.body;
  if (!assetId) return res.status(400).json({ error: 'Asset ID is required' });

  try {
    const asset = await db.getAssetById(assetId);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    // Check if user already owns it
    const owned = await db.getPurchasedAssets(req.user.id);
    if (owned.some(a => a.id === assetId)) {
      return res.status(400).json({ error: 'You already own this asset' });
    }

    const updatedCart = await db.addToCart(req.user.id, assetId);
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Remove from Cart
app.post('/api/cart/remove', authenticateToken, async (req, res) => {
  const { assetId } = req.body;
  if (!assetId) return res.status(400).json({ error: 'Asset ID is required' });

  try {
    const updatedCart = await db.removeFromCart(req.user.id, assetId);
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Cart Checkout
app.post('/api/cart/checkout', authenticateToken, async (req, res) => {
  try {
    const checkoutResult = await db.checkout(req.user.id);
    res.json({
      message: 'Checkout successful! Thank you for your purchase.',
      ...checkoutResult
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get User Library (purchased assets)
app.get('/api/library', authenticateToken, async (req, res) => {
  try {
    const purchased = await db.getPurchasedAssets(req.user.id);
    res.json(purchased);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load library' });
  }
});

// Download Asset File
app.get('/api/library/download/:id', authenticateToken, async (req, res) => {
  try {
    const purchased = await db.getPurchasedAssets(req.user.id);
    const ownsAsset = purchased.some(a => a.id === req.params.id);

    if (!ownsAsset) {
      return res.status(403).json({ error: 'Access denied. You must purchase this asset first.' });
    }

    const asset = await db.getAssetById(req.params.id);
    // In a real app we would serve the actual file. Here we send a secure success response with mock content
    res.json({
      downloadUrl: asset.fileUrl,
      fileName: `${asset.title.replace(/\s+/g, '_').toLowerCase()}.zip`,
      message: 'Secure download initialized successfully.',
      key: Buffer.from(Math.random().toString()).toString('base64').substring(0, 16)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to download asset' });
  }
});


// --- REVIEW ENDPOINTS ---

// Get Reviews for Asset
app.get('/api/assets/:id/reviews', async (req, res) => {
  try {
    const reviews = await db.getReviews(req.params.id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// Add Review
app.post('/api/assets/:id/reviews', authenticateToken, async (req, res) => {
  const { rating, comment } = req.body;
  const assetId = req.params.id;

  if (rating === undefined || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  const ratingNum = Number(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
  }

  try {
    // Check if user has purchased the asset
    const purchased = await db.getPurchasedAssets(req.user.id);
    const hasPurchased = purchased.some(a => a.id === assetId);

    if (!hasPurchased && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only review assets you have purchased.' });
    }

    const result = await db.addReview(assetId, req.user.id, req.user.username, ratingNum, comment);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚡ PulseVault server listening on http://localhost:${PORT}`);
  console.log(`🔋 Environment: Production Mode (JSON Database)`);
  console.log(`====================================================`);
});
