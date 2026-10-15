import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await API.get('/orders');
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError("Unable to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="orders-page-container">
        <div className="orders-header">
          <h1>My Orders</h1>
        </div>
        <div className="state-container loading-state">
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page-container">
        <div className="orders-header">
          <h1>My Orders</h1>
        </div>
        <div className="state-container error-state">
          <h3>Something went wrong.</h3>
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="orders-page-container">
        <div className="orders-header">
          <h1>My Orders</h1>
        </div>
        <div className="state-container empty-state empty-orders-box">
          <div className="empty-orders-icon">📦</div>
          <h2>You have not placed any orders yet</h2>
          <p>Start shopping to see your orders here.</p>
          <Link to="/products" className="browse-products-btn">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p className="orders-count-subtitle">
          Showing {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </p>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return (
            <div key={order._id} className="order-history-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id-title">Order #{order._id}</span>
                  <span className="order-date-label"> • Placed on {formattedDate}</span>
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

              <div className="order-history-items-summary">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item-mini-row">
                    <span className="mini-item-name">{item.name}</span>
                    <span className="mini-item-qty">× {item.quantity}</span>
                    <span className="mini-item-price">
                      ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-history-footer">
                <div className="order-history-total">
                  <span>Total Amount:</span>
                  <strong>₹{order.totalAmount ? order.totalAmount.toLocaleString('en-IN') : '0'}</strong>
                </div>

                <Link to={`/orders/${order._id}`} className="view-order-details-btn">
                  View Details &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
