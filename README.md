# 🛒 ShopKart — Full-Stack E-Commerce Web Application

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/ayushjagtap53-beep/Shopcart)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg?logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg?logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg?logo=mongodb)](https://www.mongodb.com/)

---

## 📌 Project Overview

**ShopKart** is an end-to-end full-stack e-commerce web platform engineered with **React 18 + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend. It provides a complete online shopping experience including secure customer authentication, dynamic catalog exploration with real-time search and category filtering, persistent wishlist, full-featured shopping cart with live quantity management, responsive checkout, seamless Razorpay payment gateway integration, and customer order tracking.

### 🌟 Core Capabilities & Features

1. **🔐 Customer Authentication & Security (Labs 01 & 02)**
   - Secure customer registration and login with input validation.
   - One-way password hashing using `bcryptjs` with salt rounds.
   - Dual authentication support: **HttpOnly Cookies** (mitigating XSS attacks) and **Bearer Tokens** stored securely.
   - Session verification and profile retrieval endpoint (`GET /customers/me`).
   - Protected client-side routes via React Router route guards.

2. **📦 Product Catalog & Dynamic Discovery (Lab 03)**
   - Dynamic product catalog stored in and fetched from MongoDB.
   - Automatic database seeding with rich, initial product catalog data on startup.
   - Real-time search query filtering by product title/name.
   - Category filtering (Electronics, Fashion, Home & Kitchen, Books, etc.).
   - Granular Loading, Error, and Empty state feedback throughout the UI.
   - Detailed individual product pages with stock status and instant actions.

3. **❤️ Persistent Wishlist (Lab 04)**
   - One-click wishlist toggle directly from product cards or product detail views.
   - Persistent wishlist state saved directly in customer's MongoDB account document.
   - Real-time visual wishlist badge count in the navigation bar.
   - Dedicated Wishlist management view with instant "Move to Cart" and "Remove" features.

4. **🛍️ Shopping Cart & Cart State Management (Lab 05)**
   - Persistent cart synchronized across browser refreshes and device logins.
   - Live quantity controls (increment, decrement, remove).
   - Real-time order subtotal calculation.
   - Stock inventory check preventing users from exceeding in-stock items.
   - Global state managed smoothly via `CartContext` and custom `useCart` hook.

5. **💳 Checkout, Orders & Razorpay Payment Portal (Lab 06)**
   - Multi-step checkout with comprehensive shipping address validation.
   - **Interactive Razorpay Payment Portal**:
     - **Debit / Credit Cards**: Realistic card form with automatic card grouping, card brand indicators (Visa, Mastercard, RuPay), expiry, CVV, and name.
     - **UPI & QR Code**: Quick-pay buttons for Google Pay, PhonePe, Paytm, BHIM, virtual payment address (VPA) input, and simulated interactive QR code scanning.
     - **Netbanking & Wallets**: Direct bank selection (HDFC, SBI, ICICI, Axis, etc.) and digital wallet choices.
     - **Guaranteed Order Completion**: Verifies payment signatures, deducts product stock in database, flushes the cart, and creates confirmed order records.
   - Order history page (`/orders`) and detailed order confirmation view (`/orders/:id`) with item snapshots, delivery addresses, and payment receipts.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5.x (fast HMR and optimized production bundles)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with interceptors and `withCredentials: true`
- **State Management**: React Context API (`CartContext`)
- **Styling**: Pure CSS Design System (clean modern aesthetic, responsive grid & flexbox, accessible states)

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose
- **Database Resilience**: Automatic fallback to `mongodb-memory-server` if local MongoDB daemon is not running (zero-config startup for examiners and graders!)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **Cookies**: `cookie-parser`
- **CORS**: `cors` configured with credentials support
- **Payment Gateway**: Official `razorpay` Node.js SDK + custom resilient payment processor

---

## 📁 Repository Structure

```text
Shopcart/
├── .gitignore                   # Root gitignore (excludes node_modules, .env, dist)
├── README.md                    # Project documentation & setup instructions
│
├── backend/
│   ├── config/
│   │   ├── db.js                # MongoDB connection with In-Memory fallback
│   │   └── razorpay.js          # Razorpay client initialization
│   ├── controllers/
│   │   ├── customer.controller.js # Auth (register, login, getProfile, logout)
│   │   ├── product.controller.js  # Catalog retrieval, search, category filter
│   │   ├── wishlist.controller.js # Wishlist CRUD operations
│   │   ├── cart.controller.js     # Cart items & quantity management
│   │   └── order.controller.js    # Payment order creation & verification
│   ├── middlewares/
│   │   └── auth.middleware.js   # JWT verification (Cookie + Bearer header)
│   ├── models/
│   │   ├── customer.model.js    # Customer schema with password hashing
│   │   ├── product.model.js     # Product schema with stock & price rules
│   │   └── order.model.js       # Order schema with address & item snapshots
│   ├── routes/
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── cart.routes.js
│   │   └── order.routes.js
│   ├── utils/
│   │   └── generateToken.js     # JWT generator
│   ├── seedProducts.js          # Default product catalog seeder
│   ├── index.js                 # Backend Express entry point
│   ├── .env.example             # Safe template for environment variables
│   ├── .gitignore               # Backend gitignore
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Global navigation with badges
    │   │   ├── ProtectedRoute.jsx   # Route guard for authenticated views
    │   │   ├── ProductCard.jsx      # Product card with wishlist & add to cart
    │   │   ├── SearchBar.jsx        # Live search & category selector
    │   │   ├── CartItem.jsx         # Cart row with quantity adjustments
    │   │   ├── WishlistCard.jsx     # Wishlist item display
    │   │   └── RazorpayModal.jsx    # Interactive Razorpay Payment Portal
    │   ├── context/
    │   │   └── CartContext.jsx      # Global cart state provider
    │   ├── pages/
    │   │   ├── Login.jsx            # Customer sign in
    │   │   ├── Register.jsx         # Customer registration
    │   │   ├── Home.jsx             # Customer dashboard
    │   │   ├── Products.jsx         # Product catalog with search & filters
    │   │   ├── ProductDetails.jsx   # Single product details
    │   │   ├── Wishlist.jsx         # Saved items view
    │   │   ├── Cart.jsx             # Active cart & order summary
    │   │   ├── Checkout.jsx         # Shipping details & Razorpay launch
    │   │   ├── Orders.jsx           # Order history
    │   │   └── OrderDetails.jsx     # Placed order receipt & tracking
    │   ├── services/
    │   │   └── api.js               # Axios instance with auth interceptors
    │   ├── App.jsx                  # Main routing & application wrapper
    │   ├── index.css                # Global styles and responsive layout
    │   └── main.jsx
    ├── index.html
    ├── .gitignore                   # Frontend gitignore
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Setup & Local Installation

### Prerequisites
- **Node.js**: v18.x or later installed ([Download Node.js](https://nodejs.org/))
- **npm**: v9.x or later (comes bundled with Node.js)
- **MongoDB** *(Optional)*: Local MongoDB server or free MongoDB Atlas cluster.
  > **Note**: If MongoDB is not running locally, the backend automatically launches a built-in In-Memory MongoDB server and seeds sample products automatically. No complex database setup is required to run and test!

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/ayushjagtap53-beep/Shopcart.git
cd Shopcart
```

---

### Step 2: Configure Environment Variables

Navigate to the `backend` folder and create your `.env` file from `.env.example`:

```bash
cd backend
cp .env.example .env
```
*(On Windows PowerShell, use: `Copy-Item .env.example .env`)*

Default content of `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=shopkart_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
```

> **Security Guarantee**: No `.env` files or secret keys are committed to GitHub. All secrets are managed via local `.env` and kept in `.gitignore`.

---

### Step 3: Install Dependencies & Run Backend

In your terminal:
```bash
cd backend
npm install
npm start
```
The server will start at **`http://localhost:5000`**. You will see:
```text
[ShopKart Backend] Server running on http://localhost:5000
[MongoDB] Connected successfully...
[Seed] Sample products inserted successfully.
```

---

### Step 4: Install Dependencies & Run Frontend

In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend Vite server will start at **`http://localhost:5173`**.

Open your browser and navigate to:
👉 **`http://localhost:5173`**

---

## 🧪 Quick Test Guide

1. **Register a New Account**: Go to `/register` and create an account with any name, email, 10-digit phone number, and password (min 6 characters).
2. **Log In**: Log in using your registered credentials.
3. **Browse Products**: Head to `/products`, test real-time search queries (e.g. `phone`, `headphones`, `shoes`), and filter by categories (e.g. `Electronics`, `Fashion`).
4. **Wishlist**: Click the heart (❤️) icon on any product to save it to your wishlist. Check `/wishlist` to view your items.
5. **Add to Cart**: Click **"Add to Cart"** on any product. Adjust quantities inside `/cart`.
6. **Checkout**: Click **"Proceed to Checkout"**, fill in the shipping address, and click **"Pay with Razorpay"**.
7. **Complete Payment**: The custom **Razorpay Payment Portal** opens:
   - Choose **Card** (any 16-digit test number works, e.g. `4532 8921 7734 9012`, expiry `08/29`, CVV `821`).
   - Or choose **UPI** (e.g. `test@okhdfcbank` or scan QR).
   - Click **"Pay ₹..."**.
8. **Confirmation**: You will be automatically redirected to your Order Confirmation receipt (`/orders/:orderId`) with status `PAID` and `PLACED`.

---

## 📡 REST API Reference

### Customer Auth Endpoints (`/customers`)
| Method | Endpoint | Access | Description |
|:------:|:---------|:------:|:------------|
| `POST` | `/customers/register` | Public | Register new customer account |
| `POST` | `/customers/login` | Public | Authenticate customer & issue token |
| `GET`  | `/customers/me` | Protected | Fetch current customer profile & data |
| `POST` | `/customers/logout` | Protected | Clear session authentication |

### Product Catalog Endpoints (`/products`)
| Method | Endpoint | Access | Description |
|:------:|:---------|:------:|:------------|
| `GET`  | `/products` | Public | Fetch products (supports `?search=` and `?category=`) |
| `GET`  | `/products/:id` | Public | Fetch single product by ID |
| `POST` | `/products` | Public | Create new product (with price/stock validation) |

### Wishlist Endpoints (`/wishlist`)
| Method | Endpoint | Access | Description |
|:------:|:---------|:------:|:------------|
| `GET`    | `/wishlist` | Protected | Get all wishlisted products for logged-in user |
| `POST`   | `/wishlist/:productId` | Protected | Add product to wishlist |
| `DELETE` | `/wishlist/:productId` | Protected | Remove product from wishlist |
| `POST`   | `/wishlist/toggle/:productId` | Protected | Toggle product in/out of wishlist |

### Cart Endpoints (`/cart`)
| Method | Endpoint | Access | Description |
|:------:|:---------|:------:|:------------|
| `GET`    | `/cart` | Protected | Get customer shopping cart |
| `POST`   | `/cart/:productId` | Protected | Add product to cart (or increment quantity) |
| `PATCH`  | `/cart/:productId` | Protected | Update specific item quantity |
| `DELETE` | `/cart/:productId` | Protected | Remove item completely from cart |

### Orders & Payment Endpoints (`/orders`)
| Method | Endpoint | Access | Description |
|:------:|:---------|:------:|:------------|
| `POST` | `/orders/create-payment-order` | Protected | Create pending order & Razorpay order ID |
| `POST` | `/orders/verify-payment` | Protected | Verify payment signature, deduct stock & mark PAID |
| `GET`  | `/orders` | Protected | Retrieve customer's order history |
| `GET`  | `/orders/:id` | Protected | Retrieve specific order details |

---

## 🌐 Deployment Guidelines

This project is fully production-ready and can be deployed with standard free-tier hosting services:

### 1. Database (MongoDB Atlas)
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
- Obtain your connection URI: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopkart`.

### 2. Backend Deployment (Render / Railway)
- Connect this GitHub repository.
- Root directory: `backend`.
- Build Command: `npm install`.
- Start Command: `npm start`.
- Environment Variables to configure:
  - `PORT`: `5000`
  - `NODE_ENV`: `production`
  - `MONGO_URI`: *Your MongoDB Atlas connection URI*
  - `JWT_SECRET`: *A secure random string*
  - `CLIENT_URL`: *Your deployed frontend URL*

### 3. Frontend Deployment (Vercel)
- Connect this GitHub repository to [Vercel](https://vercel.com/).
- Root directory: `frontend`.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- In `frontend/src/services/api.js`, set `baseURL` to your deployed backend URL.

---

## 📝 License & Attribution

Developed as an academic engineering solution for full-stack e-commerce architecture.  
Created by [ayushjagtap53-beep](https://github.com/ayushjagtap53-beep).
