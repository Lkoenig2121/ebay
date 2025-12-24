'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function BrandOutlet() {
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
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Brand Outlet</h1>
          <p className="text-gray-600 text-lg mb-8">
            Shop authentic brand items at outlet prices
          </p>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-500">
              Brand outlet items coming soon! Check back for exclusive deals from top brands.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}







