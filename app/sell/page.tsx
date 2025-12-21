'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function Sell() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [listingType, setListingType] = useState<'auction' | 'buy-it-now'>('auction');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    startingPrice: '',
    category: 'Electronics',
    quantity: '',
    condition: 'New',
    auctionDurationHours: '24',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['Electronics', 'Collectibles', 'Home & Garden', 'Clothing, Shoes & Accessories', 'Toys', 'Motors'];
  const conditions = ['New', 'Used - Like New', 'Used - Excellent', 'Used - Very Good', 'Used - Good', 'Used - Acceptable'];

  useEffect(() => {
    checkAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        startingPrice: formData.startingPrice,
        category: formData.category,
        type: listingType,
      };

      if (listingType === 'auction') {
        payload.auctionDurationHours = formData.auctionDurationHours;
      } else {
        payload.quantity = formData.quantity;
        payload.condition = formData.condition;
      }

      const response = await fetch('http://localhost:3001/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          title: '',
          description: '',
          image: '',
          startingPrice: '',
          category: 'Electronics',
          quantity: '',
          condition: 'New',
          auctionDurationHours: '24',
        });
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to list item');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">List an Item for Sale</h1>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Item listed successfully! Redirecting to homepage...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          {/* Listing Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Listing Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setListingType('auction')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  listingType === 'auction'
                    ? 'bg-ebay-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Auction
              </button>
              <button
                type="button"
                onClick={() => setListingType('buy-it-now')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  listingType === 'buy-it-now'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Buy It Now
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Item Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebay-blue focus:border-transparent"
                placeholder="Enter item title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebay-blue focus:border-transparent"
                placeholder="Describe your item in detail"
              />
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebay-blue focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebay-blue focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Starting Price */}
            <div>
              <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                {listingType === 'auction' ? 'Starting Price' : 'Price'} *
              </label>
              <div className="flex">
                <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                  $
                </span>
                <input
                  type="number"
                  id="startingPrice"
                  value={formData.startingPrice}
                  onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-ebay-blue focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Auction Duration */}
            {listingType === 'auction' && (
              <div>
                <label htmlFor="auctionDurationHours" className="block text-sm font-medium text-gray-700 mb-2">
                  Auction Duration (hours) *
                </label>
                <select
                  id="auctionDurationHours"
                  value={formData.auctionDurationHours}
                  onChange={(e) => setFormData({ ...formData, auctionDurationHours: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebay-blue focus:border-transparent"
                >
                  <option value="12">12 hours</option>
                  <option value="24">24 hours (1 day)</option>
                  <option value="48">48 hours (2 days)</option>
                  <option value="72">72 hours (3 days)</option>
                  <option value="168">168 hours (7 days)</option>
                </select>
              </div>
            )}

            {/* Quantity (Buy It Now) */}
            {listingType === 'buy-it-now' && (
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebay-blue focus:border-transparent"
                  placeholder="1"
                />
              </div>
            )}

            {/* Condition (Buy It Now) */}
            {listingType === 'buy-it-now' && (
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ebay-blue focus:border-transparent"
                >
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ebay-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Listing Item...' : 'List Item'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

