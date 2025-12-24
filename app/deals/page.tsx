'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import SaveButton from '@/components/SaveButton';

interface Item {
  id: string;
  title: string;
  description: string;
  image: string;
  currentPrice: number;
  startingPrice: number;
  type: 'auction' | 'buy-it-now';
}

export default function DailyDeals() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    checkAuth();
    fetchDeals();
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

  const fetchDeals = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/items');
      const data = await response.json();
      // Show items with discounts (current price lower than starting price) or Buy It Now items
      const deals = data.filter((item: Item) => 
        item.type === 'buy-it-now' || item.currentPrice < item.startingPrice * 1.1
      );
      setItems(deals.slice(0, 12)); // Show top 12 deals
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Daily Deals</h1>
          <p className="text-gray-600 text-lg">Discover amazing deals on popular items</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <SaveButton itemId={item.id} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{item.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-2xl font-bold text-ebay-red">${item.currentPrice}</p>
                  {item.currentPrice < item.startingPrice && (
                    <p className="text-sm text-gray-500 line-through">${item.startingPrice}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(item.id);
                  }}
                  className="w-full bg-ebay-blue text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Add to Cart
                </button>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}







