'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
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

interface Bid {
  id: string;
  itemId: string;
  userId: string;
  username: string;
  amount: number;
  timestamp: string;
}

export default function ItemDetail() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  
  const [item, setItem] = useState<Item | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<any>(null);
  const [buying, setBuying] = useState(false);
  const { addToCart, isLoading: cartLoading, refreshCart } = useCart();

  useEffect(() => {
    checkAuth();
    fetchItem();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [itemId]);

  useEffect(() => {
    // Only fetch bids and setup socket for auction items
    if (item && item.type === 'auction' && !socket) {
      fetchBids();
      const newSocket = setupSocket();
      setSocket(newSocket);
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [item]);

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

  const setupSocket = () => {
    const newSocket = io('http://localhost:3001');

    newSocket.on('connect', () => {
      newSocket.emit('joinItem', itemId);
    });

    newSocket.on('newBid', (data: { itemId: string; bid: Bid; item: Item }) => {
      if (data.itemId === itemId) {
        setItem(data.item);
        setBids((prev) => [data.bid, ...prev]);
      }
    });

    return newSocket;
  };

  const handleBuyItNow = async () => {
    if (!item) return;

    setBuying(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/items/${itemId}/buy-it-now`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        await fetchItem(); // Refresh item to update quantity
        await refreshCart(); // Refresh cart
        alert('Item purchased successfully and added to cart!');
      } else {
        const data = await response.json();
        setError(data.error || 'Purchase failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  const fetchItem = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/items/${itemId}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/items/${itemId}/bids`);
      if (response.ok) {
        const data = await response.json();
        setBids(data);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !bidAmount) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= item.currentPrice) {
      setError(`Bid must be higher than $${item.currentPrice}`);
      return;
    }

    setBidding(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/items/${itemId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        setBidAmount('');
        await fetchItem();
        await fetchBids();
      } else {
        const data = await response.json();
        setError(data.error || 'Bid failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setBidding(false);
    }
  };

  const formatTimeRemaining = (endTime: string | null) => {
    if (!endTime) return null;
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Auction Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Item not found</div>
      </div>
    );
  }

  const timeRemaining = formatTimeRemaining(item.endTime);
  const isEnded = item.endTime ? new Date(item.endTime) <= new Date() : false;
  const isAuction = item.type === 'auction';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Item Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-96 object-cover"
              />
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
                <p className="text-gray-700 mb-4">{item.description}</p>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    Seller: <span className="font-semibold">{item.sellerName}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bidding Section - Only for Auctions */}
            {isAuction && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-2xl font-bold mb-4">Place a Bid</h2>
                {isEnded ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    This auction has ended.
                  </div>
                ) : (
                  <form onSubmit={handleBid} className="space-y-4">
                    <div>
                      <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Bid (Minimum: ${item.currentPrice + 1})
                      </label>
                      <div className="flex space-x-2">
                        <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                          $
                        </span>
                        <input
                          id="bidAmount"
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min={item.currentPrice + 1}
                          step="0.01"
                          required
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-ebay-blue focus:border-transparent"
                          placeholder={`${item.currentPrice + 1}`}
                        />
                      </div>
                    </div>
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={bidding}
                      className="w-full bg-ebay-red text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bidding ? 'Placing Bid...' : 'Place Bid'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="text-4xl font-bold text-ebay-red">${item.currentPrice}</p>
                {isAuction && (
                  <p className="text-sm text-gray-500 mt-1">Starting: ${item.startingPrice}</p>
                )}
                {!isAuction && item.condition && (
                  <p className="text-sm text-gray-500 mt-1">{item.condition}</p>
                )}
              </div>
              {isAuction && timeRemaining && (
                <div className="border-t pt-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
                  <p className={`text-xl font-bold ${isEnded ? 'text-red-600' : 'text-green-600'}`}>
                    {timeRemaining}
                  </p>
                </div>
              )}
              {!isAuction && item.quantity !== undefined && (
                <div className="border-t pt-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Quantity Available</p>
                  <p className="text-xl font-bold text-gray-800">
                    {item.quantity > 0 ? `${item.quantity} available` : 'Out of stock'}
                  </p>
                </div>
              )}
              {isAuction ? (
                <button
                  onClick={() => addToCart(item.id)}
                  disabled={cartLoading || isEnded}
                  className="w-full bg-ebay-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleBuyItNow}
                    disabled={buying || cartLoading || (item.quantity !== undefined && item.quantity <= 0)}
                    className="w-full bg-ebay-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                  >
                    {buying ? 'Processing...' : 'Buy It Now'}
                  </button>
                  <button
                    onClick={() => addToCart(item.id)}
                    disabled={cartLoading || (item.quantity !== undefined && item.quantity <= 0)}
                    className="w-full bg-white border-2 border-ebay-blue text-ebay-blue py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cartLoading ? 'Adding...' : 'Add to Cart'}
                  </button>
                </>
              )}
            </div>

            {/* Recent Bids - Only for Auctions */}
            {isAuction && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Recent Bids</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bids.length === 0 ? (
                    <p className="text-gray-500 text-sm">No bids yet. Be the first to bid!</p>
                  ) : (
                    bids.map((bid) => (
                      <div
                        key={bid.id}
                        className="border-b pb-3 last:border-b-0 animate-pulse"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-ebay-red">${bid.amount}</p>
                            <p className="text-sm text-gray-600">{bid.username}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(bid.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

