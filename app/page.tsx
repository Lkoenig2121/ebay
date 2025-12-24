'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import SaveButton from '@/components/SaveButton';

interface Item {
  id: string;
  title: string;
  description: string;
  image: string;
  startingPrice: number;
  currentPrice: number;
  endTime: string | null;
  sellerId: string;
  sellerName: string;
  category: string;
  type: 'auction' | 'buy-it-now';
  quantity?: number;
  condition?: string;
}

export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { addToCart, isLoading: cartLoading } = useCart();

  const categories = ['All', 'Electronics', 'Collectibles', 'Home & Garden', 'Clothing, Shoes & Accessories', 'Toys', 'Motors'];

  useEffect(() => {
    checkAuth();
    fetchItems();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/items');
      const data = await response.json();
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, items]);


  const formatTimeRemaining = (endTime: string | null) => {
    if (!endTime) return null;
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">Browse Items</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:justify-end">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                  selectedCategory === category
                    ? 'bg-ebay-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const timeRemaining = formatTimeRemaining(item.endTime);
            const isAuction = item.type === 'auction';
            
            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  {isAuction ? (
                    <span className="absolute top-2 left-2 bg-ebay-red text-white px-2 py-1 rounded text-xs font-semibold">
                      Auction
                    </span>
                  ) : (
                    <span className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                      Buy It Now
                    </span>
                  )}
                  <div className="absolute top-2 right-2">
                    <SaveButton itemId={item.id} />
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-ebay-red">${item.currentPrice}</p>
                      {isAuction && (
                        <p className="text-xs sm:text-sm text-gray-500">Starting: ${item.startingPrice}</p>
                      )}
                      {!isAuction && item.condition && (
                        <p className="text-xs sm:text-sm text-gray-500">{item.condition}</p>
                      )}
                    </div>
                    {isAuction && timeRemaining && (
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">{timeRemaining}</p>
                        <p className="text-xs text-gray-500">remaining</p>
                      </div>
                    )}
                    {!isAuction && item.quantity !== undefined && (
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">{item.quantity} available</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(item.id);
                    }}
                    disabled={cartLoading}
                    className="w-full bg-ebay-blue text-white py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

