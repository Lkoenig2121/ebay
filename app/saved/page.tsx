'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Saved() {
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Saved Items</h1>
        
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
      </main>
    </div>
  );
}







