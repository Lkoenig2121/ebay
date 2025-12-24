'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
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

export default function Saved() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [savedItems, setSavedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSavedItems();
    }
  }, [user]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedItems = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/saved', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSavedItems(data);
      }
    } catch (error) {
      console.error('Error fetching saved items:', error);
    }
  };

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Saved Items</h1>
        
        {savedItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-gray-600 text-lg mb-4">You haven't saved any items yet</p>
            <p className="text-gray-500 mb-6">
              Save items you're interested in by clicking the heart icon on any listing
            </p>
            <Link
              href="/"
              className="inline-block bg-ebay-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {savedItems.map((item) => {
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
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}







