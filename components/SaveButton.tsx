'use client';

import { useState, useEffect } from 'react';

interface SaveButtonProps {
  itemId: string;
  className?: string;
  onToggle?: () => void; // Callback when save state changes
}

export default function SaveButton({ itemId, className = '', onToggle }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSavedStatus();
  }, [itemId]);

  const checkSavedStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/saved/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ itemId }),
      });
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      // Silently fail - user might not be logged in
    }
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    try {
      const endpoint = isSaved ? 'remove' : 'add';
      const response = await fetch(`http://localhost:3001/api/saved/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        if (onToggle) {
          onToggle();
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      className={`p-2 rounded-full transition-colors ${
        isSaved
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-white text-gray-600 hover:bg-gray-100'
      } ${className}`}
      title={isSaved ? 'Remove from saved' : 'Save item'}
      disabled={loading}
    >
      <svg
        className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`}
        fill={isSaved ? 'currentColor' : 'none'}
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
    </button>
  );
}

