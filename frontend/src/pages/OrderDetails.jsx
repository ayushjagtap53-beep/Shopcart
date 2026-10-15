import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await API.get(`/orders/${id}`);
      if (response.data && response.data.order) {
        setOrder(response.data.order);
      } else {
        setError('Order not found.');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      if (err.response && err.response.status === 403) {
        setError("Access denied. You don't have permission to view this order.");
      } else if (err.response && err.response.status === 404) {
        setError('Order not found.');
      } else {
        setError('Unable to load order details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="order-details-container">
        <div className="state-container loading-state">
          <p>Loading order confirmation details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-container">
        <div className="state-container error-state">
          <h3>{error || 'Order not found'}</h3>
          <Link to="/orders" className="browse-products-btn" style={{ marginTop: '1rem' }}>
            &larr; View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="order-details-container">
      <div className="order-success-banner">
        <div className="success-icon">✅</div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for shopping with ShopKart. Your order has been confirmed.</p>
      </div>

      <div className="order-info-card">
        <div className="order-card-header">
          <div>
            <span className="order-id-title">Order #{order._id}</span>
            <p className="order-date-subtitle">Placed on {formattedDate}</p>
          </div>
          <div className="order-badges">
            <span className={`status-badge ${order.status.toLowerCase()}`}>
              {order.status}
            </span>
            <span className={`payment-badge ${order.paymentStatus.toLowerCase()}`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        <div className="order-card-body">
          <div className="order-section">
            <h3>Shipping Address</h3>
            <p className="address-name"><strong>{order.shippingAddress?.fullName}</strong></p>
            <p>{order.shippingAddress?.addressLine1}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            <p><strong>Phone:</strong> {order.shippingAddress?.phone}</p>
          </div>

          <div className="order-section">
            <h3>Ordered Items ({order.items?.length || 0})</h3>
            <div className="ordered-items-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="ordered-item-row">
                  <div className="ordered-item-image">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=Item';
                      }}
                    />
                  </div>
                  <div className="ordered-item-details">
                    <h4>{item.name}</h4>
                    <p>
                      ₹{item.price ? item.price.toLocaleString('en-IN') : '0'} × {item.quantity}
                    </p>
                  </div>
                  <div className="ordered-item-subtotal">
                    ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-divider" />

          <div className="order-total-summary">
            <div className="summary-row total-row">
              <span>Total Amount Paid</span>
              <span className="total-amount">₹{order.totalAmount ? order.totalAmount.toLocaleString('en-IN') : '0'}</span>
            </div>
          </div>
        </div>

        <div className="order-card-footer">
          <Link to="/orders" className="secondary-action-btn">
            View My Orders
          </Link>
          <Link to="/products" className="primary-action-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
