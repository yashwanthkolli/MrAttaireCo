import React, { createContext, useContext, useEffect, useState } from 'react';

const WISHLIST_STORAGE_KEY = 'wishlist';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    setWishlist(storedWishlist ? JSON.parse(storedWishlist) : []);
    setLoading(false);
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, loading]);

  // Add product to wishlist
  const addToWishlist = (product) => {
    setWishlist(prev => {
      // Check if product already exists
      const exists = prev.some(item => item._id === product._id);
      if (exists) return prev;
      
      // Store only essential product data
      const { _id, name, price, discountedPrice, images, slug, description } = product;
      return [...prev, { _id, name, price, discountedPrice, images, slug, description }];
    });
  };

  // Remove product from wishlist
  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item._id !== productId));
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  // Toggle product in wishlist
  const toggleWishlist = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
        wishlistCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};