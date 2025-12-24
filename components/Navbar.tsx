"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import Cart from "./Cart";

interface NavbarProps {
  user?: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { cartCount } = useCart();

  // Get user initials for avatar fallback
  const getUserInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get default avatar URL if user doesn't have one
  const getAvatarUrl = () => {
    if (user?.avatar) return user.avatar;
    if (user?.username) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.username
      )}&background=0064D0&color=fff&size=128`;
    }
    return "";
  };

  const handleLogout = async () => {
    await fetch("http://localhost:3001/api/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const category =
        (e.target as HTMLFormElement).querySelector("select")?.value ||
        "All Categories";
      router.push(
        `/search?q=${encodeURIComponent(
          searchQuery.trim()
        )}&category=${encodeURIComponent(category)}`
      );
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-gray-800 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  <span className="hidden sm:inline">Hi, {user.username}!</span>
                  <span className="sm:hidden">Hi!</span>
                  <Link
                    href="/profile"
                    className="hover:underline hidden sm:inline"
                  >
                    My eBay
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="hover:underline text-xs sm:text-sm"
                >
                  Hi! Sign in or register
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/deals" className="hover:underline hidden md:inline">
                Daily Deals
              </Link>
              <Link
                href="/brand-outlet"
                className="hover:underline hidden lg:inline"
              >
                Brand Outlet
              </Link>
              <Link
                href="/gift-cards"
                className="hover:underline hidden lg:inline"
              >
                Gift Cards
              </Link>
              <Link href="/help" className="hover:underline hidden md:inline">
                Help & Contact
              </Link>
              <Link href="/sell" className="hover:underline hidden sm:inline">
                Sell
              </Link>
              {user && (
                <>
                  <button
                    className="hover:underline hidden sm:inline text-xs sm:text-sm"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                  <button className="p-1 hover:bg-gray-700 rounded hidden sm:block">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="p-1 hover:bg-gray-700 rounded relative hidden sm:block"
                  >
                    <svg
                      className="w-5 h-5"
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
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-ebay-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Navigation Bar with Logo and Search */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Layout */}
          <div className="flex items-center justify-between h-16 sm:hidden">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-ebay-blue">eBay</span>
            </Link>

            {/* Right side - Cart and Profile */}
            {user && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded relative"
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
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-ebay-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>

                {/* Mobile Profile Avatar */}
                <Link href="/profile">
                  {user.avatar || user.username ? (
                    <img
                      src={getAvatarUrl()}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-ebay-blue text-white flex items-center justify-center font-semibold border-2 border-gray-300">
                      {getUserInitials(user.username)}
                    </div>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="sm:hidden pb-4 border-t">
              <form onSubmit={handleSearch} className="mt-4">
                <div className="flex flex-col space-y-2">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-ebay-blue">
                    <option>All Categories</option>
                    <option>Electronics</option>
                    <option>Collectibles</option>
                    <option>Home & Garden</option>
                    <option>Clothing, Shoes & Accessories</option>
                    <option>Toys</option>
                    <option>Motors</option>
                  </select>
                  <div className="flex">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for anything"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-ebay-blue"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-ebay-blue text-white rounded-r-lg hover:bg-blue-700 font-medium"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>
              {user && (
                <div className="mt-4 space-y-2">
                  <Link
                    href="/profile"
                    className="block py-2 text-gray-700 hover:text-ebay-blue"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/saved"
                    className="block py-2 text-gray-700 hover:text-ebay-blue"
                  >
                    Saved
                  </Link>
                  <Link
                    href="/deals"
                    className="block py-2 text-gray-700 hover:text-ebay-blue"
                  >
                    Daily Deals
                  </Link>
                  <Link
                    href="/help"
                    className="block py-2 text-gray-700 hover:text-ebay-blue"
                  >
                    Help & Contact
                  </Link>
                  <Link
                    href="/sell"
                    className="block py-2 text-gray-700 hover:text-ebay-blue"
                  >
                    Sell
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-gray-700 hover:text-ebay-blue"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between h-20 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <span className="text-2xl sm:text-3xl font-bold text-ebay-blue">
                eBay
              </span>
            </Link>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-2xl mx-4 lg:mx-8"
            >
              <div className="flex">
                <select className="px-3 lg:px-4 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-ebay-blue hidden md:block">
                  <option>All Categories</option>
                  <option>Electronics</option>
                  <option>Collectibles</option>
                  <option>Home & Garden</option>
                  <option>Clothing, Shoes & Accessories</option>
                  <option>Toys</option>
                  <option>Motors</option>
                </select>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for anything"
                  className="flex-1 px-4 py-2 border border-gray-300 md:border-t md:border-b md:border-l-0 rounded-l-lg md:rounded-none focus:outline-none focus:ring-2 focus:ring-ebay-blue"
                />
                <button
                  type="submit"
                  className="px-4 lg:px-6 py-2 bg-ebay-blue text-white rounded-r-lg hover:bg-blue-700 font-medium text-sm lg:text-base"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Right side icons */}
            <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
              {user && (
                <>
                  <Link
                    href="/saved"
                    className="text-sm text-gray-700 hover:text-ebay-blue hidden lg:block"
                  >
                    Saved
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-ebay-blue focus:ring-offset-2 rounded-full"
                    >
                      {user.avatar || user.username ? (
                        <img
                          src={getAvatarUrl()}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 hover:border-ebay-blue transition-colors"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-ebay-blue text-white flex items-center justify-center font-semibold border-2 border-gray-300 hover:border-ebay-blue transition-colors">
                          {getUserInitials(user.username)}
                        </div>
                      )}
                      <svg
                        className={`w-4 h-4 text-gray-600 transition-transform ${
                          isProfileDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                              {user.avatar || user.username ? (
                                <img
                                  src={getAvatarUrl()}
                                  alt={user.username}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-ebay-blue text-white flex items-center justify-center font-semibold">
                                  {getUserInitials(user.username)}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {user.username}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="py-2">
                            <Link
                              href="/profile"
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              My Profile
                            </Link>
                            <Link
                              href="/saved"
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Saved Items
                            </Link>
                            <Link
                              href="/sell"
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Sell
                            </Link>
                            <div className="border-t border-gray-200 my-2" />
                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                handleLogout();
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Sign out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      {user && (
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </>
  );
}
