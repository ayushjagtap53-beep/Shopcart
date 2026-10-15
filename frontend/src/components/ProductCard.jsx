import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({
  product,
  isWishlisted: initialWishlisted = false,
  userLoggedIn = false,
  onWishlistToggle
}) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();

  const cartItem = cartItems.find(
    (item) => (item.product?._id || item.product) === product._id
  );
  const currentCartQty = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userLoggedIn) {
      navigate('/login');
      return;
    }

    if (savingWishlist) return;

    setSavingWishlist(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${product._id}`);
        setIsWishlisted(false);
        if (onWishlistToggle) onWishlistToggle(product._id, false);
      } else {
        await API.post(`/wishlist/${product._id}`);
        setIsWishlisted(true);
        if (onWishlistToggle) onWishlistToggle(product._id, true);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      if (err.response && err.response.status === 409) {
        setIsWishlisted(true);
        if (onWishlistToggle) onWishlistToggle(product._id, true);
      } else {
        setError('Unable to save product. Please try again.');
      }
    } finally {
      setSavingWishlist(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userLoggedIn) {
      navigate('/login');
      return;
    }

    if (addingCart) return;

    if (product.stock <= 0) {
      setError('Product is out of stock.');
      return;
    }

    if (currentCartQty >= product.stock) {
      setError(`Stock limit of ${product.stock} units reached.`);
      return;
    }

    setAddingCart(true);
    setError('');
    setSuccessMsg('');

    try {
      await addToCart(product._id);
      setSuccessMsg('Added to Cart!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      console.error('Add to cart error:', err);
      setError(err.response?.data?.message || 'Failed to add item to cart.');
    } finally {
      setAddingCart(false);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
          }}
        />
        <span className="product-category-badge">{product.category}</span>

        {/* Corner Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          disabled={savingWishlist}
          className={`card-heart-badge ${isWishlisted ? 'active' : ''}`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {savingWishlist ? '⏳' : isWishlisted ? '♥' : '♡'}
        </button>
      </div>

      <div className="product-card-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₹{product.price ? product.price.toLocaleString('en-IN') : '0'}</p>

        <div className="product-stock-status">
          {product.stock > 0 ? (
            <span className="in-stock">{product.stock} units left</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>

        {error && <p className="card-error-text">{error}</p>}
        {successMsg && <p className="card-success-text">{successMsg}</p>}

        <div className="card-actions">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || addingCart || currentCartQty >= product.stock}
            className="add-to-cart-primary-btn"
          >
            {addingCart
              ? '⏳ Adding...'
              : currentCartQty > 0
              ? `🛒 Add Another (${currentCartQty} in cart)`
              : product.stock > 0
              ? '🛒 Add to Cart'
              : 'Out of Stock'}
          </button>

          <div className="card-secondary-actions">
            <Link to={`/products/${product._id}`} className="view-details-btn">
              View Details
            </Link>
            <button
              onClick={handleWishlistClick}
              disabled={savingWishlist}
              className={`wishlist-action-btn ${isWishlisted ? 'wishlisted' : ''}`}
            >
              {savingWishlist ? '⏳' : isWishlisted ? '♥ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
