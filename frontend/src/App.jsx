import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import API from './services/api';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';

function App() {
  const [user, setUser] = useState(null);
  const [userWishlist, setUserWishlist] = useState([]);
  const [loadingSession, setLoadingSession] = useState(true);

  const fetchCustomerProfile = async () => {
    try {
      const response = await API.get('/customers/me');
      if (response.data && response.data._id) {
        setUser(response.data);
        const wishlistData = response.data.wishlist || [];
        setUserWishlist(
          wishlistData.map((item) => (typeof item === 'object' ? item._id : item))
        );
      } else {
        setUser(null);
        setUserWishlist([]);
      }
    } catch (error) {
      setUser(null);
      setUserWishlist([]);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    fetchCustomerProfile();

    const handleUnauthorized = () => {
      setUser(null);
      setUserWishlist([]);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const handleWishlistToggle = (productId, isWishlisted) => {
    setUserWishlist((prevList) => {
      const stringId = productId.toString();
      if (isWishlisted) {
        if (!prevList.includes(stringId)) {
          return [...prevList, stringId];
        }
        return prevList;
      } else {
        return prevList.filter((id) => id.toString() !== stringId);
      }
    });
  };

  const handleWishlistChangeFromPage = (updatedIds) => {
    setUserWishlist(updatedIds.map((id) => id.toString()));
  };

  return (
    <CartProvider user={user}>
      <Router>
        <div className="app-container">
          <Navbar
            user={user}
            setUser={setUser}
            wishlistCount={userWishlist.length}
          />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/register" element={<Register user={user} />} />
              <Route
                path="/login"
                element={
                  <Login
                    user={user}
                    fetchCustomerProfile={fetchCustomerProfile}
                  />
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute user={user} loading={loadingSession}>
                    <Home user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <Products
                    user={user}
                    userWishlist={userWishlist}
                    onWishlistToggle={handleWishlistToggle}
                  />
                }
              />
              <Route
                path="/products/:id"
                element={
                  <ProductDetails
                    user={user}
                    userWishlist={userWishlist}
                    onWishlistToggle={handleWishlistToggle}
                  />
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute user={user} loading={loadingSession}>
                    <Wishlist
                      user={user}
                      onWishlistChange={handleWishlistChangeFromPage}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute user={user} loading={loadingSession}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute user={user} loading={loadingSession}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute user={user} loading={loadingSession}>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute user={user} loading={loadingSession}>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
