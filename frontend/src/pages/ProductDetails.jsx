import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = ({ user, userWishlist = [], onWishlistToggle }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState('');
  const [cartError, setCartError] = useState('');

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState('');

  const cartItem = cartItems.find(
    (item) => (item.product?._id || item.product) === id
  );
  const currentCartQty = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    const isSaved = (userWishlist || []).some((item) => {
      const itemId = typeof item === 'object' ? item._id : item;
      return itemId === id;
    });
    setIsWishlisted(isSaved);
  }, [id, userWishlist]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await API.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (err.response && err.response.status === 404) {
          setError('Product not found.');
        } else if (err.response && err.response.status === 400) {
          setError('Invalid product ID format.');
        } else {
          setError('Something went wrong while loading product details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (addingToCart) return;

    if (product.stock <= 0) {
      setCartError('Product is out of stock.');
      return;
    }

    if (currentCartQty >= product.stock) {
      setCartError(`Stock limit of ${product.stock} units reached.`);
      return;
    }

    setAddingToCart(true);
    setCartError('');
    setCartSuccess('');

    try {
      await addToCart(product._id);
      setCartSuccess('Added to Cart!');
      setTimeout(() => setCartSuccess(''), 2500);
    } catch (err) {
      setCartError(err.response?.data?.message || 'Failed to add item to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (wishlistSaving) return;

    setWishlistSaving(true);
    setWishlistError('');

    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${id}`);
        setIsWishlisted(false);
        if (onWishlistToggle) onWishlistToggle(id, false);
      } else {
        await API.post(`/wishlist/${id}`);
        setIsWishlisted(true);
        if (onWishlistToggle) onWishlistToggle(id, true);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      if (err.response && err.response.status === 409) {
        setIsWishlisted(true);
        if (onWishlistToggle) onWishlistToggle(id, true);
      } else {
        setWishlistError('Unable to update wishlist. Try again.');
      }
    } finally {
      setWishlistSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="product-details-container">
        <div className="state-container loading-state">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-container">
        <div className="state-container error-state">
          <p>{error || 'Product not found.'}</p>
          <Link to="/products" className="back-link-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
            &larr; Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      <Link to="/products" className="back-link-btn">
        &larr; Back to Products
      </Link>

      <div className="product-details-card">
        <div className="product-details-image-section">
          <img
            src={product.image}
            alt={product.name}
            className="large-product-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x400?text=Product+Image';
            }}
          />
        </div>

        <div className="product-details-info-section">
          <span className="product-category-badge">{product.category}</span>
          <h1 className="product-details-title">{product.name}</h1>
          <p className="product-details-price">₹{product.price.toLocaleString('en-IN')}</p>

          <div className="product-details-stock">
            <strong>Availability: </strong>
            {product.stock > 0 ? (
              <span className="in-stock">{product.stock} units in stock</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>

          <p className="product-details-description">{product.description}</p>

          {cartError && <p className="card-error-text">{cartError}</p>}
          {cartSuccess && <p className="card-success-text">{cartSuccess}</p>}
          {wishlistError && <p className="card-error-text">{wishlistError}</p>}

          <div className="details-actions-group">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || addingToCart || currentCartQty >= product.stock}
              className="add-to-cart-btn"
            >
              {addingToCart
                ? '⏳ Adding to Cart...'
                : currentCartQty > 0
                ? `Add Another (${currentCartQty} in cart)`
                : product.stock > 0
                ? 'Add to Cart'
                : 'Out of Stock'}
            </button>

            <button
              onClick={handleWishlistToggle}
              disabled={wishlistSaving}
              className={`details-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
            >
              {wishlistSaving
                ? '⏳ Saving...'
                : isWishlisted
                ? '♥ Remove from Wishlist'
                : '♡ Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
