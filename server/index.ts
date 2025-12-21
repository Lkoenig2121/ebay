import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// In-memory storage (replace with database in production)
interface User {
  id: string;
  username: string;
  password: string;
  email: string;
}

interface Bid {
  id: string;
  itemId: string;
  userId: string;
  username: string;
  amount: number;
  timestamp: Date;
}

interface Item {
  id: string;
  title: string;
  description: string;
  image: string;
  startingPrice: number;
  currentPrice: number;
  endTime: Date | null; // null for Buy It Now items
  sellerId: string;
  sellerName: string;
  category: string;
  type: 'auction' | 'buy-it-now';
  quantity?: number; // For Buy It Now items
  condition?: string;
}

const users: User[] = [
  {
    id: '1',
    username: 'buyer1',
    password: bcrypt.hashSync('password123', 10),
    email: 'buyer1@example.com',
  },
  {
    id: '2',
    username: 'buyer2',
    password: bcrypt.hashSync('password123', 10),
    email: 'buyer2@example.com',
  },
  {
    id: '3',
    username: 'buyer3',
    password: bcrypt.hashSync('password123', 10),
    email: 'buyer3@example.com',
  },
];

const items: Item[] = [
  // Auction Items
  {
    id: '1',
    title: 'Vintage Camera',
    description: 'Beautiful vintage camera in excellent condition',
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500',
    startingPrice: 50,
    currentPrice: 50,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    sellerId: 'seller1',
    sellerName: 'CameraSeller',
    category: 'Electronics',
    type: 'auction',
  },
  {
    id: '2',
    title: 'Gaming Laptop',
    description: 'High-performance gaming laptop with RTX 3080',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
    startingPrice: 800,
    currentPrice: 850,
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
    sellerId: 'seller2',
    sellerName: 'TechDeals',
    category: 'Electronics',
    type: 'auction',
  },
  {
    id: '3',
    title: 'Designer Watch',
    description: 'Luxury designer watch, authentic and rare',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    startingPrice: 200,
    currentPrice: 220,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
    sellerId: 'seller3',
    sellerName: 'WatchCollector',
    category: 'Collectibles',
    type: 'auction',
  },
  {
    id: '4',
    title: 'Vintage Vinyl Records Collection',
    description: 'Rare collection of 50 vintage vinyl records from the 60s and 70s',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
    startingPrice: 150,
    currentPrice: 150,
    endTime: new Date(Date.now() + 36 * 60 * 60 * 1000),
    sellerId: 'seller4',
    sellerName: 'VinylVault',
    category: 'Collectibles',
    type: 'auction',
  },
  {
    id: '5',
    title: 'Antique Wooden Desk',
    description: 'Beautiful handcrafted antique desk from the 1800s',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
    startingPrice: 300,
    currentPrice: 320,
    endTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
    sellerId: 'seller5',
    sellerName: 'AntiqueTreasures',
    category: 'Home & Garden',
    type: 'auction',
  },
  {
    id: '6',
    title: 'Rare Comic Book Collection',
    description: 'First edition comic books including rare superhero issues',
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500',
    startingPrice: 500,
    currentPrice: 550,
    endTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
    sellerId: 'seller6',
    sellerName: 'ComicCollector',
    category: 'Collectibles',
    type: 'auction',
  },
  // Buy It Now Items
  {
    id: '7',
    title: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    startingPrice: 99,
    currentPrice: 99,
    endTime: null,
    sellerId: 'seller7',
    sellerName: 'AudioPro',
    category: 'Electronics',
    type: 'buy-it-now',
    quantity: 15,
    condition: 'New',
  },
  {
    id: '8',
    title: 'Nike Running Shoes',
    description: 'Brand new Nike Air Max running shoes, size 10',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    startingPrice: 120,
    currentPrice: 120,
    endTime: null,
    sellerId: 'seller8',
    sellerName: 'ShoeStore',
    category: 'Clothing, Shoes & Accessories',
    type: 'buy-it-now',
    quantity: 8,
    condition: 'New',
  },
  {
    id: '9',
    title: 'Coffee Maker Machine',
    description: 'Programmable coffee maker with thermal carafe, 12-cup capacity',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ce8b55c?w=500',
    startingPrice: 45,
    currentPrice: 45,
    endTime: null,
    sellerId: 'seller9',
    sellerName: 'KitchenEssentials',
    category: 'Home & Garden',
    type: 'buy-it-now',
    quantity: 20,
    condition: 'New',
  },
  {
    id: '10',
    title: 'LEGO Star Wars Set',
    description: 'Complete LEGO Star Wars Millennium Falcon set, 7541 pieces',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    startingPrice: 150,
    currentPrice: 150,
    endTime: null,
    sellerId: 'seller10',
    sellerName: 'ToyWorld',
    category: 'Toys',
    type: 'buy-it-now',
    quantity: 5,
    condition: 'New',
  },
  {
    id: '11',
    title: 'Designer Handbag',
    description: 'Authentic designer handbag, gently used, excellent condition',
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500',
    startingPrice: 250,
    currentPrice: 250,
    endTime: null,
    sellerId: 'seller11',
    sellerName: 'FashionBoutique',
    category: 'Clothing, Shoes & Accessories',
    type: 'buy-it-now',
    quantity: 3,
    condition: 'Used - Excellent',
  },
  {
    id: '12',
    title: 'Smartphone Case & Screen Protector',
    description: 'Premium protective case with tempered glass screen protector',
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500',
    startingPrice: 25,
    currentPrice: 25,
    endTime: null,
    sellerId: 'seller12',
    sellerName: 'PhoneAccessories',
    category: 'Electronics',
    type: 'buy-it-now',
    quantity: 50,
    condition: 'New',
  },
  {
    id: '13',
    title: 'Garden Tool Set',
    description: 'Complete 10-piece stainless steel garden tool set',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
    startingPrice: 35,
    currentPrice: 35,
    endTime: null,
    sellerId: 'seller13',
    sellerName: 'GardenSupply',
    category: 'Home & Garden',
    type: 'buy-it-now',
    quantity: 12,
    condition: 'New',
  },
  {
    id: '14',
    title: 'Action Figure Collection',
    description: 'Vintage action figures from popular franchises, complete with accessories',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    startingPrice: 80,
    currentPrice: 80,
    endTime: null,
    sellerId: 'seller14',
    sellerName: 'CollectiblesRUs',
    category: 'Toys',
    type: 'buy-it-now',
    quantity: 7,
    condition: 'Used - Good',
  },
  {
    id: '15',
    title: 'Vintage Motorcycle Helmet',
    description: 'Classic vintage motorcycle helmet, retro design',
    image: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=500',
    startingPrice: 75,
    currentPrice: 75,
    endTime: null,
    sellerId: 'seller15',
    sellerName: 'MotorcycleGear',
    category: 'Motors',
    type: 'buy-it-now',
    quantity: 4,
    condition: 'Used - Very Good',
  },
  // More Auction Items
  {
    id: '16',
    title: 'Vintage Typewriter',
    description: 'Classic 1950s typewriter in working condition, perfect for collectors',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500',
    startingPrice: 120,
    currentPrice: 120,
    endTime: new Date(Date.now() + 30 * 60 * 60 * 1000),
    sellerId: 'seller16',
    sellerName: 'VintageCollector',
    category: 'Collectibles',
    type: 'auction',
  },
  {
    id: '17',
    title: 'Rare Baseball Card Collection',
    description: 'Complete set of rare baseball cards from the 1950s, including Mickey Mantle',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    startingPrice: 1000,
    currentPrice: 1050,
    endTime: new Date(Date.now() + 20 * 60 * 60 * 1000),
    sellerId: 'seller17',
    sellerName: 'SportsMemorabilia',
    category: 'Collectibles',
    type: 'auction',
  },
  {
    id: '18',
    title: 'Antique Persian Rug',
    description: 'Handwoven Persian rug, 8x10 feet, excellent condition',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500',
    startingPrice: 800,
    currentPrice: 850,
    endTime: new Date(Date.now() + 60 * 60 * 60 * 1000),
    sellerId: 'seller18',
    sellerName: 'RugMaster',
    category: 'Home & Garden',
    type: 'auction',
  },
  {
    id: '19',
    title: 'Vintage Electric Guitar',
    description: '1960s Fender Stratocaster, all original parts, excellent sound',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
    startingPrice: 2000,
    currentPrice: 2100,
    endTime: new Date(Date.now() + 15 * 60 * 60 * 1000),
    sellerId: 'seller19',
    sellerName: 'GuitarShop',
    category: 'Electronics',
    type: 'auction',
  },
  {
    id: '20',
    title: 'Rare Stamps Collection',
    description: 'Complete collection of rare postage stamps from around the world',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
    startingPrice: 300,
    currentPrice: 320,
    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
    sellerId: 'seller20',
    sellerName: 'StampCollector',
    category: 'Collectibles',
    type: 'auction',
  },
  // More Buy It Now Items
  {
    id: '21',
    title: 'Smart TV 55 inch',
    description: '4K Ultra HD Smart TV with HDR, streaming apps included',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500',
    startingPrice: 399,
    currentPrice: 399,
    endTime: null,
    sellerId: 'seller21',
    sellerName: 'ElectronicsHub',
    category: 'Electronics',
    type: 'buy-it-now',
    quantity: 12,
    condition: 'New',
  },
  {
    id: '22',
    title: 'Yoga Mat Set',
    description: 'Premium non-slip yoga mat with carrying strap and blocks',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    startingPrice: 35,
    currentPrice: 35,
    endTime: null,
    sellerId: 'seller22',
    sellerName: 'FitnessStore',
    category: 'Clothing, Shoes & Accessories',
    type: 'buy-it-now',
    quantity: 30,
    condition: 'New',
  },
  {
    id: '23',
    title: 'Kitchen Knife Set',
    description: 'Professional 8-piece stainless steel knife set with block',
    image: 'https://images.unsplash.com/photo-1583484963886-e6614c0b0a0a?w=500',
    startingPrice: 85,
    currentPrice: 85,
    endTime: null,
    sellerId: 'seller23',
    sellerName: 'KitchenPro',
    category: 'Home & Garden',
    type: 'buy-it-now',
    quantity: 18,
    condition: 'New',
  },
  {
    id: '24',
    title: 'Board Game Collection',
    description: 'Set of 5 popular board games: Monopoly, Scrabble, Risk, Clue, and Chess',
    image: 'https://images.unsplash.com/photo-1606166188517-cf1a8b3b8c5a?w=500',
    startingPrice: 60,
    currentPrice: 60,
    endTime: null,
    sellerId: 'seller24',
    sellerName: 'GameStore',
    category: 'Toys',
    type: 'buy-it-now',
    quantity: 10,
    condition: 'New',
  },
  {
    id: '25',
    title: 'Wireless Mouse & Keyboard',
    description: 'Ergonomic wireless mouse and keyboard combo, long battery life',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
    startingPrice: 45,
    currentPrice: 45,
    endTime: null,
    sellerId: 'seller25',
    sellerName: 'TechAccessories',
    category: 'Electronics',
    type: 'buy-it-now',
    quantity: 25,
    condition: 'New',
  },
  {
    id: '26',
    title: 'Designer Sunglasses',
    description: 'Premium designer sunglasses with UV protection, multiple styles available',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
    startingPrice: 80,
    currentPrice: 80,
    endTime: null,
    sellerId: 'seller26',
    sellerName: 'SunglassHut',
    category: 'Clothing, Shoes & Accessories',
    type: 'buy-it-now',
    quantity: 15,
    condition: 'New',
  },
  {
    id: '27',
    title: 'Garden Tool Set',
    description: 'Complete 15-piece stainless steel garden tool set with storage bag',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
    startingPrice: 55,
    currentPrice: 55,
    endTime: null,
    sellerId: 'seller27',
    sellerName: 'GardenSupply',
    category: 'Home & Garden',
    type: 'buy-it-now',
    quantity: 22,
    condition: 'New',
  },
  {
    id: '28',
    title: 'RC Drone with Camera',
    description: '4K HD camera drone with GPS, 30-minute flight time, perfect for beginners',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500',
    startingPrice: 199,
    currentPrice: 199,
    endTime: null,
    sellerId: 'seller28',
    sellerName: 'DroneStore',
    category: 'Electronics',
    type: 'buy-it-now',
    quantity: 8,
    condition: 'New',
  },
  {
    id: '29',
    title: 'Vintage Leather Jacket',
    description: 'Classic brown leather jacket, size M, excellent condition',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    startingPrice: 180,
    currentPrice: 180,
    endTime: null,
    sellerId: 'seller29',
    sellerName: 'VintageClothing',
    category: 'Clothing, Shoes & Accessories',
    type: 'buy-it-now',
    quantity: 3,
    condition: 'Used - Excellent',
  },
  {
    id: '30',
    title: 'Puzzle Set Collection',
    description: 'Set of 5 jigsaw puzzles, 1000 pieces each, various themes',
    image: 'https://images.unsplash.com/photo-1611522135883-0b1c0e0a5f9b?w=500',
    startingPrice: 40,
    currentPrice: 40,
    endTime: null,
    sellerId: 'seller30',
    sellerName: 'PuzzleWorld',
    category: 'Toys',
    type: 'buy-it-now',
    quantity: 14,
    condition: 'New',
  },
  {
    id: '31',
    title: 'Car Phone Mount',
    description: 'Magnetic car phone mount, adjustable, fits all smartphones',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500',
    startingPrice: 20,
    currentPrice: 20,
    endTime: null,
    sellerId: 'seller31',
    sellerName: 'CarAccessories',
    category: 'Motors',
    type: 'buy-it-now',
    quantity: 40,
    condition: 'New',
  },
  {
    id: '32',
    title: 'Portable Bluetooth Speaker',
    description: 'Waterproof Bluetooth speaker with 20-hour battery, excellent sound quality',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    startingPrice: 65,
    currentPrice: 65,
    endTime: null,
    sellerId: 'seller32',
    sellerName: 'AudioPro',
    category: 'Electronics',
    type: 'buy-it-now',
    quantity: 20,
    condition: 'New',
  },
  {
    id: '33',
    title: 'Vintage Record Player',
    description: 'Retro turntable with built-in speakers, perfect for vinyl enthusiasts',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500',
    startingPrice: 150,
    currentPrice: 150,
    endTime: null,
    sellerId: 'seller33',
    sellerName: 'VinylShop',
    category: 'Electronics',
    type: 'buy-it-now',
    quantity: 6,
    condition: 'New',
  },
  {
    id: '34',
    title: 'Running Shoes - Multiple Sizes',
    description: 'Comfortable running shoes with cushioned sole, available in sizes 8-12',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    startingPrice: 75,
    currentPrice: 75,
    endTime: null,
    sellerId: 'seller34',
    sellerName: 'ShoeStore',
    category: 'Clothing, Shoes & Accessories',
    type: 'buy-it-now',
    quantity: 25,
    condition: 'New',
  },
  {
    id: '35',
    title: 'Indoor Plant Set',
    description: 'Set of 5 low-maintenance indoor plants with decorative pots',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
    startingPrice: 50,
    currentPrice: 50,
    endTime: null,
    sellerId: 'seller35',
    sellerName: 'PlantShop',
    category: 'Home & Garden',
    type: 'buy-it-now',
    quantity: 12,
    condition: 'New',
  },
  {
    id: '36',
    title: 'Action Figure Set',
    description: 'Collectible action figures from popular movie franchises',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    startingPrice: 90,
    currentPrice: 90,
    endTime: null,
    sellerId: 'seller36',
    sellerName: 'CollectiblesRUs',
    category: 'Toys',
    type: 'buy-it-now',
    quantity: 9,
    condition: 'New',
  },
  {
    id: '37',
    title: 'Car Floor Mats',
    description: 'Premium all-weather car floor mats, universal fit',
    image: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=500',
    startingPrice: 35,
    currentPrice: 35,
    endTime: null,
    sellerId: 'seller37',
    sellerName: 'AutoParts',
    category: 'Motors',
    type: 'buy-it-now',
    quantity: 18,
    condition: 'New',
  },
  {
    id: '38',
    title: 'Vintage Poster Collection',
    description: 'Set of 10 vintage movie and music posters, ready to frame',
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500',
    startingPrice: 45,
    currentPrice: 45,
    endTime: null,
    sellerId: 'seller38',
    sellerName: 'PosterShop',
    category: 'Collectibles',
    type: 'buy-it-now',
    quantity: 7,
    condition: 'New',
  },
  {
    id: '39',
    title: 'Tablet Stand',
    description: 'Adjustable aluminum tablet stand, works with all tablets',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
    startingPrice: 25,
    currentPrice: 25,
    endTime: null,
    sellerId: 'seller39',
    sellerName: 'TechAccessories',
    category: 'Electronics',
    type: 'buy-it-now',
    quantity: 30,
    condition: 'New',
  },
  {
    id: '40',
    title: 'Ceramic Dinnerware Set',
    description: 'Complete 16-piece ceramic dinnerware set, dishwasher safe',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500',
    startingPrice: 70,
    currentPrice: 70,
    endTime: null,
    sellerId: 'seller40',
    sellerName: 'HomeEssentials',
    category: 'Home & Garden',
    type: 'buy-it-now',
    quantity: 15,
    condition: 'New',
  },
];

const bids: Bid[] = [];

// Cart storage: userId -> itemId[]
const carts: Record<string, string[]> = {};

// Authentication middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === (req as any).user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
  });
});

// Items routes
app.get('/api/items', (req, res) => {
  res.json(items);
});

app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

app.post('/api/items', authenticateToken, (req, res) => {
  const {
    title,
    description,
    image,
    startingPrice,
    category,
    type,
    quantity,
    condition,
    auctionDurationHours,
  } = req.body;

  // Validation
  if (!title || !description || !image || !startingPrice || !category || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (type === 'auction' && !auctionDurationHours) {
    return res.status(400).json({ error: 'Auction duration is required for auction items' });
  }

  if (type === 'buy-it-now' && (!quantity || quantity <= 0)) {
    return res.status(400).json({ error: 'Quantity is required for Buy It Now items' });
  }

  if (type === 'buy-it-now' && !condition) {
    return res.status(400).json({ error: 'Condition is required for Buy It Now items' });
  }

  const user = users.find(u => u.id === (req as any).user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Create new item
  const newItem: Item = {
    id: Date.now().toString(),
    title,
    description,
    image,
    startingPrice: parseFloat(startingPrice),
    currentPrice: parseFloat(startingPrice),
    endTime: type === 'auction' 
      ? new Date(Date.now() + (parseInt(auctionDurationHours) * 60 * 60 * 1000))
      : null,
    sellerId: user.id,
    sellerName: user.username,
    category,
    type,
    quantity: type === 'buy-it-now' ? parseInt(quantity) : undefined,
    condition: type === 'buy-it-now' ? condition : undefined,
  };

  items.push(newItem);

  res.status(201).json({
    message: 'Item listed successfully',
    item: newItem,
  });
});

// Bids routes
app.get('/api/items/:id/bids', (req, res) => {
  const itemBids = bids
    .filter(b => b.itemId === req.params.id)
    .sort((a, b) => b.amount - a.amount);
  res.json(itemBids);
});

app.post('/api/items/:id/bid', authenticateToken, (req, res) => {
  const { amount } = req.body;
  const item = items.find(i => i.id === req.params.id);
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (item.type !== 'auction') {
    return res.status(400).json({ error: 'This item is not an auction' });
  }

  if (!item.endTime || new Date() > item.endTime) {
    return res.status(400).json({ error: 'Auction has ended' });
  }

  if (amount <= item.currentPrice) {
    return res.status(400).json({ error: 'Bid must be higher than current price' });
  }

  const user = users.find(u => u.id === (req as any).user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const bid: Bid = {
    id: Date.now().toString(),
    itemId: item.id,
    userId: user.id,
    username: user.username,
    amount,
    timestamp: new Date(),
  };

  bids.push(bid);
  item.currentPrice = amount;

  // Emit real-time bid update
  io.emit('newBid', {
    itemId: item.id,
    bid,
    item,
  });

  res.json(bid);
});

app.post('/api/items/:id/buy-it-now', authenticateToken, (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (item.type !== 'buy-it-now') {
    return res.status(400).json({ error: 'This item is not available for Buy It Now' });
  }

  if (item.quantity !== undefined && item.quantity <= 0) {
    return res.status(400).json({ error: 'Item is out of stock' });
  }

  const user = users.find(u => u.id === (req as any).user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Decrease quantity if applicable
  if (item.quantity !== undefined) {
    item.quantity -= 1;
  }

  // Add to cart automatically or process purchase
  if (!carts[user.id]) {
    carts[user.id] = [];
  }
  if (!carts[user.id].includes(item.id)) {
    carts[user.id].push(item.id);
  }

  res.json({ 
    message: 'Item purchased successfully',
    item,
    addedToCart: true,
  });
});

app.get('/api/items/category/:category', (req, res) => {
  const category = req.params.category;
  const categoryItems = items.filter(item => 
    item.category.toLowerCase() === category.toLowerCase()
  );
  res.json(categoryItems);
});

// Cart routes
app.get('/api/cart', authenticateToken, (req, res) => {
  const userId = (req as any).user.userId;
  const userCart = carts[userId] || [];
  const cartItems = userCart
    .map(itemId => items.find(item => item.id === itemId))
    .filter(item => item !== undefined);
  res.json(cartItems);
});

app.post('/api/cart/add/:itemId', authenticateToken, (req, res) => {
  const userId = (req as any).user.userId;
  const itemId = req.params.itemId;
  
  const item = items.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (!carts[userId]) {
    carts[userId] = [];
  }

  // Check if item is already in cart
  if (!carts[userId].includes(itemId)) {
    carts[userId].push(itemId);
  }

  res.json({ message: 'Item added to cart', cart: carts[userId] });
});

app.delete('/api/cart/remove/:itemId', authenticateToken, (req, res) => {
  const userId = (req as any).user.userId;
  const itemId = req.params.itemId;

  if (!carts[userId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  carts[userId] = carts[userId].filter(id => id !== itemId);
  res.json({ message: 'Item removed from cart', cart: carts[userId] });
});

app.get('/api/cart/count', authenticateToken, (req, res) => {
  const userId = (req as any).user.userId;
  const count = carts[userId]?.length || 0;
  res.json({ count });
});

app.delete('/api/cart/clear', authenticateToken, (req, res) => {
  const userId = (req as any).user.userId;
  carts[userId] = [];
  res.json({ message: 'Cart cleared successfully' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinItem', (itemId: string) => {
    socket.join(`item-${itemId}`);
    console.log(`Client ${socket.id} joined item ${itemId}`);
  });

  socket.on('leaveItem', (itemId: string) => {
    socket.leave(`item-${itemId}`);
    console.log(`Client ${socket.id} left item ${itemId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

