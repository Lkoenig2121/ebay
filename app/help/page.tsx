'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function HelpContact() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Help & Contact</h1>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">How do I place a bid?</h3>
                <p className="text-gray-600">
                  Navigate to any auction item and enter your bid amount. Make sure your bid is higher than the current price.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">How does Buy It Now work?</h3>
                <p className="text-gray-600">
                  Buy It Now items can be purchased immediately at the listed price. Click "Buy It Now" to complete your purchase.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I add items to my cart?</h3>
                <p className="text-gray-600">
                  Yes! Click "Add to Cart" on any item to save it for later. View your cart by clicking the cart icon in the navigation bar.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-gray-600">support@ebayclone.com</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-gray-600">1-800-EBAY-HELP (1-800-322-9435)</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Hours</h3>
                <p className="text-gray-600">Monday - Friday: 8 AM - 8 PM EST</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}








