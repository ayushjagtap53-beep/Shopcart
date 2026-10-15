import React, { useState } from 'react';

const RazorpayModal = ({
  isOpen,
  onClose,
  orderData,
  shippingAddress,
  onSuccess,
  onFailure
}) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '4532 8921 7734 9012',
    name: shippingAddress?.fullName || 'Aarav Sharma',
    expiry: '08/29',
    cvv: '821',
    saveCard: true
  });
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [showQrCode, setShowQrCode] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  const [payingState, setPayingState] = useState('idle'); // 'idle' | 'authorizing' | 'success'

  if (!isOpen || !orderData) return null;

  const totalRupees =
    orderData.totalAmount ||
    (orderData.amount ? Math.round(orderData.amount / 100) : 0);

  const customerName =
    shippingAddress?.fullName || orderData?.customerName || 'ShopKart Customer';
  const customerPhone =
    shippingAddress?.phone || orderData?.customerPhone || '9876543210';

  // Format card number grouping
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardDetails((prev) => ({ ...prev, number: formatted }));
  };

  // Format expiry MM/YY
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
    }
    setCardDetails((prev) => ({ ...prev, expiry: val }));
  };

  const handlePay = async () => {
    setPayingState('authorizing');

    setTimeout(async () => {
      setPayingState('success');

      setTimeout(async () => {
        try {
          const shopKartOrderId =
            orderData.shopKartOrderId || orderData._id;
          const rzpOrderId =
            orderData.razorpayOrderId || `order_rzp_${shopKartOrderId || Date.now()}`;
          const rzpPaymentId = `pay_shopkart_${Date.now()}`;
          const rzpSignature = `sig_test_${Date.now()}`;

          await onSuccess({
            shopKartOrderId,
            razorpay_order_id: rzpOrderId,
            razorpay_payment_id: rzpPaymentId,
            razorpay_signature: rzpSignature
          });
        } catch (err) {
          console.error('Error completing test order payment:', err);
          if (onFailure) {
            onFailure(err);
          }
        } finally {
          setPayingState('idle');
        }
      }, 700);
    }, 1200);
  };

  return (
    <div className="rzp-modal-overlay">
      <div className="rzp-modal-box">
        {/* Top Header */}
        <div className="rzp-header">
          <div className="rzp-brand">
            <div className="rzp-logo">⚡</div>
            <div>
              <h3>Razorpay</h3>
              <p className="rzp-sub">Trusted by ShopKart</p>
            </div>
          </div>
          <div className="rzp-amount-badge">
            ₹{totalRupees.toLocaleString('en-IN')}
          </div>
          <button
            onClick={onClose}
            disabled={payingState !== 'idle'}
            className="rzp-close-btn"
            title="Cancel & Close"
          >
            &times;
          </button>
        </div>

        {/* Customer Info Strip */}
        <div className="rzp-prefill-info">
          <span>👤 {customerName}</span>
          <span>📱 {customerPhone}</span>
        </div>

        {/* Main Body */}
        <div className="rzp-body">
          {/* Method Menu Sidebar */}
          <div className="rzp-methods-menu">
            <button
              type="button"
              className={`rzp-method-btn ${selectedMethod === 'card' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('card')}
            >
              💳 Cards (Debit/Credit)
            </button>
            <button
              type="button"
              className={`rzp-method-btn ${selectedMethod === 'upi' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('upi')}
            >
              📱 UPI / QR Code
            </button>
            <button
              type="button"
              className={`rzp-method-btn ${selectedMethod === 'netbanking' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('netbanking')}
            >
              🏛️ Netbanking
            </button>
            <button
              type="button"
              className={`rzp-method-btn ${selectedMethod === 'wallets' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('wallets')}
            >
              👛 Wallets
            </button>
          </div>

          {/* Method Content Panel */}
          <div className="rzp-method-content">
            {/* CARDS TAB */}
            {selectedMethod === 'card' && (
              <div className="rzp-card-form">
                <div className="rzp-tab-title">
                  <span>Enter Card Details</span>
                  <div className="rzp-card-badges">
                    <span className="card-badge visa">VISA</span>
                    <span className="card-badge mc">Mastercard</span>
                    <span className="card-badge rupay">RuPay</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 4532 8921 7734 9012"
                    value={cardDetails.number}
                    onChange={handleCardNumberChange}
                    maxLength="19"
                  />
                  <small className="field-hint">Any random 16-digit card number is accepted</small>
                </div>

                <div className="form-row">
                  <div className="form-group half-width">
                    <label>Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleExpiryChange}
                      maxLength="5"
                    />
                  </div>
                  <div className="form-group half-width">
                    <label>CVV / CVC</label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          cvv: e.target.value.slice(0, 4)
                        })
                      }
                      maxLength="4"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Name on Card"
                    value={cardDetails.name}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, name: e.target.value })
                    }
                  />
                </div>

                <label className="rzp-checkbox-label">
                  <input
                    type="checkbox"
                    checked={cardDetails.saveCard}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        saveCard: e.target.checked
                      })
                    }
                  />
                  <span>Save this card securely as per RBI guidelines</span>
                </label>
              </div>
            )}

            {/* UPI TAB */}
            {selectedMethod === 'upi' && (
              <div className="rzp-upi-form">
                <div className="rzp-tab-title">
                  <span>Pay via UPI</span>
                  <button
                    type="button"
                    className="rzp-toggle-qr-btn"
                    onClick={() => setShowQrCode(!showQrCode)}
                  >
                    {showQrCode ? '✏️ Enter UPI ID' : '📷 Show QR Code'}
                  </button>
                </div>

                {showQrCode ? (
                  <div className="rzp-qr-container">
                    <div className="rzp-qr-box">
                      <div className="rzp-qr-simulated">
                        <div className="qr-corner top-left"></div>
                        <div className="qr-corner top-right"></div>
                        <div className="qr-corner bottom-left"></div>
                        <div className="qr-pattern-text">
                          <span style={{ fontSize: '1.4rem' }}>🛒</span>
                          <span>₹{totalRupees}</span>
                        </div>
                      </div>
                      <p className="qr-caption">Scan with Google Pay, PhonePe, Paytm, or CRED</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <label>Quick Pay with UPI Apps</label>
                    <div className="rzp-upi-apps-grid">
                      <button
                        type="button"
                        className={`upi-app-btn ${selectedUpiApp === 'gpay' ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedUpiApp('gpay');
                          setUpiId('user@okhdfcbank');
                        }}
                      >
                        <span className="upi-app-icon">🟢</span> GPay
                      </button>
                      <button
                        type="button"
                        className={`upi-app-btn ${selectedUpiApp === 'phonepe' ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedUpiApp('phonepe');
                          setUpiId('user@ybl');
                        }}
                      >
                        <span className="upi-app-icon">🟣</span> PhonePe
                      </button>
                      <button
                        type="button"
                        className={`upi-app-btn ${selectedUpiApp === 'paytm' ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedUpiApp('paytm');
                          setUpiId('user@paytm');
                        }}
                      >
                        <span className="upi-app-icon">🔵</span> Paytm
                      </button>
                      <button
                        type="button"
                        className={`upi-app-btn ${selectedUpiApp === 'bhim' ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedUpiApp('bhim');
                          setUpiId('user@upi');
                        }}
                      >
                        <span className="upi-app-icon">🟠</span> BHIM
                      </button>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Or Enter Any UPI ID (VPA)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. mobile@upi or username@bank"
                      />
                      <small className="field-hint">Accepts any test or real UPI handle format</small>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* NETBANKING TAB */}
            {selectedMethod === 'netbanking' && (
              <div className="rzp-netbanking-form">
                <div className="rzp-tab-title">
                  <span>Select Your Bank</span>
                </div>

                <div className="rzp-banks-grid">
                  {[
                    { id: 'HDFC', name: 'HDFC Bank', icon: '🏛️' },
                    { id: 'SBI', name: 'State Bank of India', icon: '🏦' },
                    { id: 'ICICI', name: 'ICICI Bank', icon: '🏢' },
                    { id: 'AXIS', name: 'Axis Bank', icon: '🏛️' },
                    { id: 'KOTAK', name: 'Kotak Bank', icon: '🏦' },
                    { id: 'PNB', name: 'PNB Bank', icon: '🏢' }
                  ].map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      className={`bank-card-btn ${selectedBank === bank.id ? 'selected' : ''}`}
                      onClick={() => setSelectedBank(bank.id)}
                    >
                      <span className="bank-icon">{bank.icon}</span>
                      <span className="bank-name">{bank.name}</span>
                    </button>
                  ))}
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>All Other Banks</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="HDFC">HDFC Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                    <option value="BOB">Bank of Baroda</option>
                    <option value="YES">Yes Bank</option>
                    <option value="CANARA">Canara Bank</option>
                    <option value="INDUSIND">IndusInd Bank</option>
                  </select>
                </div>
              </div>
            )}

            {/* WALLETS TAB */}
            {selectedMethod === 'wallets' && (
              <div className="rzp-wallets-form">
                <div className="rzp-tab-title">
                  <span>Select Digital Wallet</span>
                </div>

                <div className="rzp-wallets-list">
                  {[
                    { id: 'paytm', name: 'Paytm Wallet', icon: '👛' },
                    { id: 'phonepe', name: 'PhonePe Wallet', icon: '🟣' },
                    { id: 'mobikwik', name: 'MobiKwik', icon: '🔵' },
                    { id: 'amazonpay', name: 'Amazon Pay', icon: '🟡' }
                  ].map((wallet) => (
                    <label
                      key={wallet.id}
                      className={`wallet-row ${selectedWallet === wallet.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="wallet"
                        checked={selectedWallet === wallet.id}
                        onChange={() => setSelectedWallet(wallet.id)}
                      />
                      <span className="wallet-icon">{wallet.icon}</span>
                      <span className="wallet-name">{wallet.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Payment Action */}
        <div className="rzp-footer">
          <button
            onClick={handlePay}
            disabled={payingState !== 'idle'}
            className="rzp-submit-btn"
          >
            {payingState === 'idle' && (
              <span>🔒 Pay ₹{totalRupees.toLocaleString('en-IN')}</span>
            )}
            {payingState === 'authorizing' && (
              <span>⏳ Authorizing Payment with Bank...</span>
            )}
            {payingState === 'success' && (
              <span>✅ Payment Approved! Placing Order...</span>
            )}
          </button>
        </div>

        {/* Security Badge */}
        <div className="rzp-secured-by">
          <span>🔒 Secured by <strong>Razorpay</strong> &bull; PCI-DSS Level 1 &bull; 256-Bit SSL</span>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
