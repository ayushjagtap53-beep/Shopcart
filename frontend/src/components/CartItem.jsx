import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [itemError, setItemError] = useState('');

  const product = item.product || {};
  const quantity = item.quantity || 1;

  const handleDecrease = async () => {
    if (quantity <= 1 || updating) return;
    setUpdating(true);
    setItemError('');
    try {
      await updateQuantity(product._id, quantity - 1);
    } catch (err) {
      setItemError(err.response?.data?.message || 'Failed to decrease quantity');
    } finally {
      setUpdating(false);
    }
  };

  const handleIncrease = async () => {
    if (quantity >= product.stock || updating) return;
    setUpdating(true);
    setItemError('');
    try {
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      setItemError(err.response?.data?.message || 'Failed to increase quantity');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    setItemError('');
    try {
      await removeFromCart(product._id);
    } catch (err) {
      setItemError(err.response?.data?.message || 'Failed to remove item');
      setRemoving(false);
    }
  };

  const itemTotal = (product.price || 0) * quantity;

  return (
    <div className="cart-item-row">
      <div className="cart-item-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150x150?text=Product';
          }}
        />
      </div>

      <div className="cart-item-details">
        <span className="product-category-badge">{product.category}</span>
        <h3 className="cart-item-name">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>
        <p className="cart-item-price">₹{product.price ? product.price.toLocaleString('en-IN') : '0'} each</p>

        <div className="cart-item-stock-info">
          {product.stock > 0 ? (
            <span className="in-stock">{product.stock} units available</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>

        {itemError && <p className="cart-item-error">{itemError}</p>}

        <div className="cart-item-controls">
          <div className="quantity-control-box">
            <button
              onClick={handleDecrease}
              disabled={quantity <= 1 || updating || removing}
              className="qty-btn minus-btn"
              title="Decrease Quantity"
            >
              -
            </button>

            <span className="qty-value">{updating ? '...' : quantity}</span>

            <button
              onClick={handleIncrease}
              disabled={quantity >= product.stock || updating || removing}
              className="qty-btn plus-btn"
              title="Increase Quantity"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={removing || updating}
            className="cart-remove-btn"
          >
            {removing ? '⏳ Removing...' : 'Remove'}
          </button>
        </div>
      </div>

      <div className="cart-item-total">
        <span className="subtotal-label">Subtotal</span>
        <span className="subtotal-amount">₹{itemTotal.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

export default CartItem;
