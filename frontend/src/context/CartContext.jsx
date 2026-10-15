import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setCartLoading(true);
    setCartError('');

    try {
      const response = await API.get('/cart');
      if (response.data && response.data.success) {
        setCartItems(response.data.cart || []);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCartError("We couldn't load your cart. Please try again.");
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const addToCart = async (productId) => {
    setCartError('');
    try {
      const response = await API.post(`/cart/${productId}`);
      if (response.data && response.data.cart) {
        setCartItems(response.data.cart);
      }
      return response.data;
    } catch (err) {
      console.error('Error adding to cart:', err);
      const msg = err.response?.data?.message || 'Failed to add product to cart.';
      setCartError(msg);
      throw err;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setCartError('');
    try {
      const response = await API.patch(`/cart/${productId}`, { quantity });
      if (response.data && response.data.cart) {
        setCartItems(response.data.cart);
      }
      return response.data;
    } catch (err) {
      console.error('Error updating quantity:', err);
      const msg = err.response?.data?.message || 'Failed to update quantity.';
      setCartError(msg);
      throw err;
    }
  };

  const removeFromCart = async (productId) => {
    setCartError('');
    try {
      const response = await API.delete(`/cart/${productId}`);
      if (response.data && response.data.cart) {
        setCartItems(response.data.cart);
      }
      return response.data;
    } catch (err) {
      console.error('Error removing from cart:', err);
      const msg = err.response?.data?.message || 'Failed to remove product.';
      setCartError(msg);
      throw err;
    }
  };

  const clearCartState = () => {
    setCartItems([]);
  };

  // Derived values
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  const cartSubtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    const qty = item.quantity || 0;
    return acc + price * qty;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        cartCount,
        cartSubtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState
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

export default CartContext;
