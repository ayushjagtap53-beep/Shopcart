import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import RazorpayModal from '../components/RazorpayModal';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, cartSubtotal, clearCartState } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [serverError, setServerError] = useState('');

  // Razorpay Modal State
  const [activeOrderData, setActiveOrderData] = useState(null);
  const orderDataRef = useRef(null);
  const [isRzpModalOpen, setIsRzpModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must contain exactly 10 digits.';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line is required.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required.';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain exactly 6 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifySuccess = async (verifyPayload) => {
    try {
      const targetOrderId =
        verifyPayload?.shopKartOrderId ||
        activeOrderData?.shopKartOrderId ||
        orderDataRef.current?.shopKartOrderId;

      if (!targetOrderId) {
        throw new Error('Order reference could not be determined.');
      }

      const verifyRes = await API.post('/orders/verify-payment', {
        shopKartOrderId: targetOrderId,
        razorpay_order_id: verifyPayload.razorpay_order_id,
        razorpay_payment_id: verifyPayload.razorpay_payment_id,
        razorpay_signature: verifyPayload.razorpay_signature
      });

      if (verifyRes.data && verifyRes.data.success) {
        setIsRzpModalOpen(false);
        clearCartState();
        navigate(`/orders/${targetOrderId}`);
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setServerError(
        err.response?.data?.message || err.message || 'Payment verification failed.'
      );
      setIsRzpModalOpen(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyFailure = (errDetail) => {
    setIsRzpModalOpen(false);
    setServerError(`Payment Failed: ${errDetail?.description || errDetail?.message || 'Transaction could not be completed.'}`);
    setProcessing(false);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // 1. Create ShopKart & Razorpay payment order on backend
      const response = await API.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim()
        }
      });

      const orderData = response.data;
      if (!orderData || !orderData.success) {
        throw new Error(orderData?.message || 'Failed to create payment order');
      }

      orderDataRef.current = orderData;
      setActiveOrderData(orderData);

      // 2. If real Razorpay key is present and script loads, open official popup
      if (orderData.isRealRzpOrder) {
        const scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded && typeof window.Razorpay !== 'undefined') {
          const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency || 'INR',
            name: 'ShopKart',
            description: 'ShopKart Order Payment',
            order_id: orderData.razorpayOrderId,
            handler: async function (rzpResponse) {
              await handleVerifySuccess({
                ...rzpResponse,
                shopKartOrderId: orderData.shopKartOrderId
              });
            },
            prefill: {
              name: formData.fullName,
              contact: formData.phone
            },
            theme: {
              color: '#4f46e5'
            },
            modal: {
              ondismiss: function () {
                setProcessing(false);
              }
            }
          };

          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.on('payment.failed', function (resp) {
            console.error('Payment failed notice:', resp.error);
            handleVerifyFailure({ description: resp.error?.description });
          });
          razorpayInstance.open();
          return;
        }
      }

      // 3. Open Interactive Razorpay Portal Modal
      setIsRzpModalOpen(true);
      setProcessing(false);
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || err.message || 'Something went wrong during checkout.';
      setServerError(msg);
      setProcessing(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-page-container">
        <div className="state-container empty-state">
          <h2>Your cart is empty</h2>
          <p>Please add products to your cart before checking out.</p>
          <Link to="/products" className="browse-products-btn" style={{ marginTop: '1rem' }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p>Complete your shipping details to place your order with Razorpay</p>
      </div>

      {serverError && (
        <div className="state-container error-state" style={{ marginBottom: '1.5rem' }}>
          <p>{serverError}</p>
          {serverError.toLowerCase().includes('unauthorized') || serverError.toLowerCase().includes('log in') ? (
            <Link
              to="/login"
              className="browse-products-btn"
              style={{ marginTop: '0.85rem', display: 'inline-block' }}
            >
              Go to Login Page &rarr;
            </Link>
          ) : null}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="checkout-grid">
        <div className="checkout-form-section">
          <h2>Shipping Address</h2>

          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="e.g. Aarav Sharma"
              className={errors.fullName ? 'input-error' : ''}
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number (10 Digits) *</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g. 9876543210"
              maxLength="10"
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="addressLine1">Address Line *</label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              placeholder="House/Flat No., Building, Street Name"
              className={errors.addressLine1 ? 'input-error' : ''}
            />
            {errors.addressLine1 && <span className="field-error">{errors.addressLine1}</span>}
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g. Bengaluru"
                className={errors.city ? 'input-error' : ''}
              />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>

            <div className="form-group half-width">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="e.g. Karnataka"
                className={errors.state ? 'input-error' : ''}
              />
              {errors.state && <span className="field-error">{errors.state}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Pincode (6 Digits) *</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="e.g. 560001"
              maxLength="6"
              className={errors.pincode ? 'input-error' : ''}
            />
            {errors.pincode && <span className="field-error">{errors.pincode}</span>}
          </div>
        </div>

        <div className="checkout-summary-section">
          <h2>Order Summary</h2>
          <div className="checkout-items-preview">
            {cartItems.map((item) => (
              <div key={item.product?._id || item._id} className="checkout-item-row">
                <div className="checkout-item-info">
                  <span className="checkout-item-name">{item.product?.name}</span>
                  <span className="checkout-item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="checkout-item-price">
                  ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Items Subtotal</span>
            <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Charge</span>
            <span className="free-shipping-badge">FREE</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-row total-row">
            <span>Total Payable</span>
            <span className="total-amount">₹{cartSubtotal.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="place-order-btn"
          >
            {processing ? '⏳ Opening Razorpay...' : '💳 Pay with Razorpay'}
          </button>
        </div>
      </form>

      {/* Interactive Razorpay Test Modal */}
      <RazorpayModal
        isOpen={isRzpModalOpen}
        onClose={() => {
          setIsRzpModalOpen(false);
          setProcessing(false);
        }}
        orderData={activeOrderData}
        shippingAddress={formData}
        onSuccess={handleVerifySuccess}
        onFailure={handleVerifyFailure}
      />
    </div>
  );
};

export default Checkout;
