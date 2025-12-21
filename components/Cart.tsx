'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const router = useRouter();
  const { cart, removeFromCart, refreshCart, isLoading } = useCart();

  useEffect(() => {
    if (isOpen) {
      refreshCart();
    }
  }, [isOpen]);

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

  const totalPrice = cart.reduce((sum, item) => sum + item.currentPrice, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : cart.length === 0 ? (
              <div className="text-center py-8">
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded"
                      onClick={() => {
                        router.push(`/items/${item.id}`);
                        onClose();
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-sm mb-1 line-clamp-2 cursor-pointer hover:text-ebay-blue"
                        onClick={() => {
                          router.push(`/items/${item.id}`);
                          onClose();
                        }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-ebay-red font-bold text-lg">
                        ${item.currentPrice}
                      </p>
                      {item.endTime && formatTimeRemaining(item.endTime) && (
                        <p className="text-xs text-gray-500">
                          {formatTimeRemaining(item.endTime)} remaining
                        </p>
                      )}
                      {!item.endTime && item.quantity !== undefined && (
                        <p className="text-xs text-gray-500">
                          {item.quantity} available
                        </p>
                      )}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-ebay-red">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => {
                  router.push('/checkout');
                  onClose();
                }}
                className="w-full bg-ebay-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

