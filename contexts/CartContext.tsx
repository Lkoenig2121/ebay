'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Item {
  id: string;
  title: string;
  description: string;
  image: string;
  startingPrice: number;
  currentPrice: number;
  endTime: string;
  sellerId: string;
  sellerName: string;
}

interface CartContextType {
  cart: Item[];
  cartCount: number;
  isLoading: boolean;
  addToCart: (itemId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Item[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cart', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        setCartCount(data.length);
      } else if (response.status === 401) {
        // User not logged in
        setCart([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cart/count', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.count);
      } else if (response.status === 401) {
        // User not logged in
        setCartCount(0);
      }
    } catch (error) {
      // User might not be logged in or network error
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  const addToCart = async (itemId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/cart/add/${itemId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        await refreshCart();
        await fetchCartCount();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        await refreshCart();
        await fetchCartCount();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/cart/clear', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        // Clear local state immediately
        setCart([]);
        setCartCount(0);
        // Refresh from server to ensure consistency
        await refreshCart();
        await fetchCartCount();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Even if there's an error, clear local state
      setCart([]);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isLoading,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

