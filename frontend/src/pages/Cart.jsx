import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const { cartItems, cartLoading, cartError, cartCount, cartSubtotal, fetchCart } = useCart();
  const navigate = useNavigate();

  if (cartLoading) {
    return (
      <div className="cart-page-container">
        <div className="cart-header">
          <h1>My Cart</h1>
        </div>
        <div className="state-container loading-state">
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="cart-page-container">
        <div className="cart-header">
          <h1>My Cart</h1>
        </div>
        <div className="state-container error-state">
          <h3>Something went wrong.</h3>
          <p>{cartError}</p>
          <button onClick={fetchCart} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="cart-header">
          <h1>My Cart</h1>
        </div>
        <div className="state-container empty-state empty-cart-box">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="browse-products-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-header">
        <h1>My Cart</h1>
        <p className="cart-count-subtitle">
          {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="cart-layout-grid">
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <CartItem key={item.product?._id || item._id} item={item} />
          ))}
        </div>

        <div className="cart-order-summary-card">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Total Items</span>
            <strong>{cartCount}</strong>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>₹{cartSubtotal.toLocaleString('en-IN')}</strong>
          </div>
          <div className="summary-row shipping-row">
            <span>Shipping</span>
            <span className="free-shipping-badge">FREE</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-row total-row">
            <span>Estimated Total</span>
            <span className="total-amount">₹{cartSubtotal.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="checkout-btn"
          >
            Proceed to Checkout &rarr;
          </button>

          <Link to="/products" className="continue-shopping-link">
            &larr; Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
