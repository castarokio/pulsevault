export interface User {
  id: string;
  username: string;
  role: 'customer' | 'seller' | 'admin';
  balance: number;
  avatar: string;
  createdAt: string;
}

export interface Review {
  id: string;
  assetId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  title: string;
  category: 'Sensitivity' | 'Presets' | 'Packs' | 'Guides';
  description: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  ratingCount: number;
  isVerified: boolean;
  tag: string;
  imageUrl: string;
  fileUrl: string;
  sellerId: string;
  createdAt: string;
  reviews?: Review[];
}

export interface CartItem extends Asset {}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
