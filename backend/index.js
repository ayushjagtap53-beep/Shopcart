const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");
const customerRoutes = require("./routes/customer.routes.js");
const productRoutes = require("./routes/product.routes.js");
const wishlistRoutes = require("./routes/wishlist.routes.js");
const cartRoutes = require("./routes/cart.routes.js");
const orderRoutes = require("./routes/order.routes.js");
const seedData = require("./seedProducts.js");

// Load environment variables
dotenv.config();

// Connect to MongoDB and seed initial products
connectDB().then(() => {
  seedData();
});

const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ShopKart Customer & Product Catalog API Service",
    status: "Active",
    timestamp: new Date()
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[ShopKart Backend] Server running on http://localhost:${PORT}`);
});
