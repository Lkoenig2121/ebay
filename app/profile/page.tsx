'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Order {
  id: string;
  items: {
    itemId: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  tax: number;
  finalTotal: number;
  status: string;
  createdAt: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface Bid {
  id: string;
  itemId: string;
  amount: number;
  timestamp: string;
  item: {
    id: string;
    title: string;
    image: string;
    currentPrice: number;
    endTime: string | null;
    type: 'auction' | 'buy-it-now';
  } | null;
}

interface WonAuction {
  item: {
    id: string;
    title: string;
    image: string;
    currentPrice: number;
  };
  winningBid: {
    amount: number;
    timestamp: string;
  };
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales' | 'bids' | 'won'>('purchases');
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user, activeTab]);

  // Refresh data when page becomes visible (user might have made a purchase in another tab)
  useEffect(() => {
    if (!user) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProfileData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, activeTab]);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setAvatarUrl(userData.avatar || '');
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (username: string) => {
    return username
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = () => {
    if (user?.avatar) return user.avatar;
    if (user?.username) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=0064D0&color=fff&size=128`;
    }
    return '';
  };

  const handleUpdateAvatar = async () => {
    if (!avatarUrl.trim()) {
      alert('Please enter an avatar URL');
      return;
    }

    setUpdatingAvatar(true);
    try {
      const response = await fetch('http://localhost:3001/api/profile/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ avatar: avatarUrl.trim() }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditingAvatar(false);
        // Refresh the page to update navbar
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update avatar');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar. Please try again.');
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      if (activeTab === 'purchases') {
        console.log('Fetching purchases for user:', user.id);
        const response = await fetch('http://localhost:3001/api/profile/purchases', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched purchases response:', data);
          console.log('Number of purchases:', data.length);
          setPurchases(data);
        } else {
          console.error('Failed to fetch purchases:', response.status, response.statusText);
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
        }
      } else if (activeTab === 'sales') {
        const response = await fetch('http://localhost:3001/api/profile/sales', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setSales(data);
        } else {
          console.error('Failed to fetch sales:', response.status, response.statusText);
        }
      } else if (activeTab === 'bids') {
        const response = await fetch('http://localhost:3001/api/profile/bids', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setBids(data);
        } else {
          console.error('Failed to fetch bids:', response.status, response.statusText);
        }
      } else if (activeTab === 'won') {
        const response = await fetch('http://localhost:3001/api/profile/won-auctions', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setWonAuctions(data);
        } else {
          console.error('Failed to fetch won auctions:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="relative">
                {user?.avatar || user?.username ? (
                  <img
                    src={getAvatarUrl()}
                    alt={user.username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-ebay-blue text-white flex items-center justify-center font-bold text-2xl border-4 border-gray-200">
                    {user?.username ? getUserInitials(user.username) : 'U'}
                  </div>
                )}
                <button
                  onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                  className="absolute bottom-0 right-0 bg-ebay-blue text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-lg"
                  title="Change avatar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-2">My eBay Profile</h1>
                <p className="text-gray-600">Welcome back, {user?.username}!</p>
                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Avatar Edit Form */}
          {isEditingAvatar && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Change Avatar</h3>
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebay-blue focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a URL to an image. You can use services like{' '}
                    <a href="https://ui-avatars.com" target="_blank" rel="noopener noreferrer" className="text-ebay-blue hover:underline">
                      UI Avatars
                    </a>{' '}
                    or upload to an image hosting service.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateAvatar}
                    disabled={updatingAvatar}
                    className="px-6 py-2 bg-ebay-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingAvatar ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingAvatar(false);
                      setAvatarUrl(user?.avatar || '');
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {avatarUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={avatarUrl}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML += '<p class="text-red-500 text-sm mt-2">Invalid image URL</p>';
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6 pt-4">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('purchases')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'purchases'
                      ? 'border-ebay-blue text-ebay-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Purchases ({purchases.length})
                </button>
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'sales'
                      ? 'border-ebay-blue text-ebay-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Sales ({sales.length})
                </button>
                <button
                  onClick={() => setActiveTab('bids')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'bids'
                      ? 'border-ebay-blue text-ebay-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Bids ({bids.length})
                </button>
                <button
                  onClick={() => setActiveTab('won')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'won'
                      ? 'border-ebay-blue text-ebay-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Won Auctions ({wonAuctions.length})
                </button>
              </nav>
            <button
              onClick={() => fetchProfileData()}
              className="px-4 py-2 text-sm text-gray-600 hover:text-ebay-blue hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
              title="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'purchases' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Purchase History</h2>
              {purchases.length === 0 ? (
                <div className="text-center py-12">
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg mb-4">You haven't made any purchases yet</p>
                  <Link
                    href="/"
                    className="inline-block bg-ebay-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {purchases.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-ebay-red">${order.finalTotal.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Total</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <Link href={`/items/${item.itemId}`}>
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                              />
                            </Link>
                            <div className="flex-1">
                              <Link href={`/items/${item.itemId}`}>
                                <h3 className="font-medium hover:text-ebay-blue cursor-pointer">{item.title}</h3>
                              </Link>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              <p className="text-ebay-red font-semibold">${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <strong>Shipping to:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Sales History</h2>
              {sales.length === 0 ? (
                <div className="text-center py-12">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg mb-4">You haven't sold any items yet</p>
                  <Link
                    href="/sell"
                    className="inline-block bg-ebay-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Start Selling
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {sales.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">Sold on {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ${order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">Total Revenue</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <Link href={`/items/${item.itemId}`}>
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                              />
                            </Link>
                            <div className="flex-1">
                              <Link href={`/items/${item.itemId}`}>
                                <h3 className="font-medium hover:text-ebay-blue cursor-pointer">{item.title}</h3>
                              </Link>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              <p className="text-green-600 font-semibold">${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bids' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Bids</h2>
              {bids.length === 0 ? (
                <div className="text-center py-12">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg mb-4">You haven't placed any bids yet</p>
                  <Link
                    href="/"
                    className="inline-block bg-ebay-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Browse Auctions
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div key={bid.id} className="border border-gray-200 rounded-lg p-4">
                      {bid.item ? (
                        <div className="flex gap-4">
                          <Link href={`/items/${bid.item.id}`}>
                            <img
                              src={bid.item.image}
                              alt={bid.item.title}
                              className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-80"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link href={`/items/${bid.item!.id}`}>
                              <h3 className="font-medium text-lg hover:text-ebay-blue cursor-pointer mb-2">
                                {bid.item.title}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                <strong>Your Bid:</strong> ${bid.amount.toFixed(2)}
                              </span>
                              <span>
                                <strong>Current Price:</strong> ${bid.item.currentPrice.toFixed(2)}
                              </span>
                              <span>
                                <strong>Bid Placed:</strong> {formatDate(bid.timestamp)}
                              </span>
                            </div>
                            {bid.item.type === 'auction' && bid.item.endTime && (
                              <div className="mt-2">
                                {new Date(bid.item.endTime) > new Date() ? (
                                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                    Active - Ends {formatDate(bid.item.endTime)}
                                  </span>
                                ) : (
                                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                                    Ended
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <p>Item no longer available</p>
                          <p className="text-sm">Bid: ${bid.amount.toFixed(2)} on {formatDate(bid.timestamp)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'won' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Won Auctions</h2>
              {wonAuctions.length === 0 ? (
                <div className="text-center py-12">
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
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg mb-4">You haven't won any auctions yet</p>
                  <Link
                    href="/"
                    className="inline-block bg-ebay-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Browse Auctions
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {wonAuctions.map((auction) => (
                    <div key={auction.item.id} className="border border-gray-200 rounded-lg p-6 bg-green-50">
                      <div className="flex gap-4">
                        <Link href={`/items/${auction.item.id}`}>
                          <img
                            src={auction.item.image}
                            alt={auction.item.title}
                            className="w-32 h-32 object-cover rounded cursor-pointer hover:opacity-80"
                          />
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link href={`/items/${auction.item.id}`}>
                                <h3 className="font-bold text-xl hover:text-ebay-blue cursor-pointer mb-2">
                                  {auction.item.title}
                                </h3>
                              </Link>
                              <p className="text-green-700 font-semibold text-lg mb-2">
                                🎉 Congratulations! You won this auction!
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                              Won
                            </span>
                          </div>
                          <div className="mt-4 space-y-2 text-sm">
                            <p>
                              <strong>Winning Bid:</strong> ${auction.winningBid.amount.toFixed(2)}
                            </p>
                            <p>
                              <strong>Won on:</strong> {formatDate(auction.winningBid.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

