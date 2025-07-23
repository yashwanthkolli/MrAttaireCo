import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import API from '../utils/api';
import { AuthContext } from './AuthContext';

const CART_STORAGE_KEY = 'guest_cart';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuestCart, setIsGuestCart] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [merging, setMerging] = useState(false);

  // Get guest cart from localStorage
  const getGuestCart = () => {
    const guestCart = localStorage.getItem(CART_STORAGE_KEY);
    return guestCart ? JSON.parse(guestCart) : { items: [] };
  };

  // Calculate total items from cart
  const calculateTotalItems = (cartData) => {
    if (!cartData?.items) return 0;
    return cartData.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Save guest cart to localStorage
  const saveGuestCart = (cartData) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  };

  // Clear guest cart
  const clearGuestCart = () => {
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  // Merge guest cart with user cart when logging in
  const mergeGuestCartWithUser = async () => {
    const guestCart = getGuestCart();
    if (guestCart.items.length === 0) return;

    setMerging(true);

    try {
      // Add each guest cart item to user cart
      for (const item of guestCart.items) {
        await API.post('/cart', {
          productId: item.product._id,
          color: item.variant.color,
          size: item.variant.size,
          quantity: item.quantity
        });
      }
      clearGuestCart();
    } catch (err) {
      console.error('Failed to merge guest cart:', err);
    } finally {
      setMerging(false)
    }
  };

  // Fetch user cart from API
  const fetchUserCart = async () => {
    try {
      const { data } = await API.get('/cart');
      setCart(data.data.cart);
      setTotalItems(calculateTotalItems(data.data.cart));
      setIsGuestCart(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart');
      setCart(null);
    }
  };

  // Initialize cart with total items calculation
  const initializeCart = async () => {
    setLoading(true);
    
    try {
      if (user) {
        // User is logged in - fetch from server
        if (!merging) {
          await mergeGuestCartWithUser();
        }
        
        fetchUserCart();
      } else {
        // User is guest - load from localStorage
        const guestCart = getGuestCart();
        setCart(guestCart);
        setTotalItems(calculateTotalItems(guestCart));
        setIsGuestCart(true);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart');
      setCart(null);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Update cart and recalculate total items
  const updateCartState = (newCart) => {
    setCart(newCart);
    setTotalItems(calculateTotalItems(newCart));
  };

  // Add item to cart (works for both guest and logged-in users)
  const addToCart = async (product, color, size, quantity = 1) => {
    try {
      let newCart;
      if (user) {
        // User is logged in - add to server cart
        const { data } = await API.post('/cart', {
          productId: product._id,
          color,
          size,
          quantity
        });
        newCart = data.data.cart;
      } else {
        // User is guest - add to local storage
        const guestCart = getGuestCart();
        
        // Check if item already exists
        const existingItemIndex = guestCart.items.findIndex(
          item => item.product._id === product._id && 
                  item.variant.color === color && 
                  item.variant.size === size
        );

        if (existingItemIndex >= 0) {
          // Update quantity if exists
          guestCart.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          guestCart.items.push({
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              discountedPrice: product.discountedPrice,
              images: product.images
            },
            variant: { color, size },
            quantity,
            priceAtAddition: product.price,
            discountedPriceAtAddition: product.discountedPrice || undefined,
            _id: Date.now().toString() // Temporary ID for guest items
          });
        }

        saveGuestCart(guestCart);
        newCart = guestCart;
      }
      updateCartState(newCart);
      return { success: true, cart: newCart };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add to cart';
      return { success: false, message: errorMsg };
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      let newCart;
      if (user) {
        const { data } = await API.put(`/cart/${itemId}`, { quantity });
        newCart = data.data.cart;
      } else {
        const guestCart = getGuestCart();
        const itemIndex = guestCart.items.findIndex(item => item._id === itemId);
        
        if (itemIndex === -1) {
          return { success: false, message: 'Item not found in cart' };
        }

        guestCart.items[itemIndex].quantity = quantity;
        saveGuestCart(guestCart);
        newCart = guestCart;
      }
      updateCartState(newCart);
      return { success: true, cart: newCart };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update cart item';
      return { success: false, message: errorMsg };
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      let newCart;
      if (user) {
        const { data } = await API.delete(`/cart/${itemId}`);
        newCart = data.data.cart;
      } else {
        const guestCart = getGuestCart();
        const initialLength = guestCart.items.length;
        
        guestCart.items = guestCart.items.filter(item => item._id !== itemId);
        
        if (guestCart.items.length === initialLength) {
          return { success: false, message: 'Item not found in cart' };
        }

        saveGuestCart(guestCart);
        newCart = guestCart;
      }
      updateCartState(newCart);
      return { success: true, cart: newCart };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to remove item';
      return { success: false, message: errorMsg };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      let newCart;
      if (user) {
        const { data } = await API.delete('/cart');
        newCart = data.data.cart;
      } else {
        clearGuestCart();
        newCart = {};
      }
      updateCartState(newCart);
      return { success: true, cart: newCart };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to clear cart';
      return { success: false, message: errorMsg };
    }
  };

  // Validate Cart
  const validateCart = async () => {
    try {
      const res = await API.get('/cart/validate');
      return res.data;
    } catch (err) {
      return { success: false, error: err.response.data }
    }
  }

  // Initialize cart on mount and user change
  useEffect(() => {
    initializeCart();
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        isGuestCart,
        totalItems,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart: initializeCart,
        validateCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};