'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';

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

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All Categories';
  
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const { addToCart, isLoading: cartLoading } = useCart();

  const categories = ['All Categories', 'Electronics', 'Collectibles', 'Home & Garden', 'Clothing, Shoes & Accessories', 'Toys', 'Motors'];

  useEffect(() => {
    checkAuth();
    fetchItems();
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    performSearch();
  }, [query, selectedCategory, items]);

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    // Update URL without page reload
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', newCategory);
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

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
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = () => {
    if (!query.trim()) {
      setFilteredItems([]);
      return;
    }

    let results = items;

    // Filter by category if not "All Categories"
    if (selectedCategory !== 'All Categories') {
      results = results.filter(item => item.category === selectedCategory);
    }

    // Search in title and description (case-insensitive)
    const searchTerm = query.toLowerCase();
    results = results.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm)
    );

    setFilteredItems(results);
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
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Search Results</h1>
              {query && (
                <p className="text-gray-600">
                  {filteredItems.length > 0 
                    ? `Found ${filteredItems.length} result${filteredItems.length !== 1 ? 's' : ''} for "${query}"`
                    : `No results found for "${query}"`
                  }
                  {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}
                </p>
              )}
            </div>
            {query && (
              <div className="flex items-center gap-2">
                <label htmlFor="category-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Filter by:
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ebay-blue focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {!query && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Enter a search term to find items</p>
          </div>
        )}

        {query && filteredItems.length === 0 && (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg mb-2">No items found</p>
            <p className="text-gray-400">Try different keywords or browse all items</p>
            <Link
              href="/"
              className="inline-block mt-4 bg-ebay-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse All Items
            </Link>
          </div>
        )}

        {filteredItems.length > 0 && (
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
        )}
      </main>
    </div>
  );
}

