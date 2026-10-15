const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth.middleware");

// Protect all cart endpoints
router.use(protect);

// GET user cart
router.get("/", getCart);

// POST add product to cart
router.post("/:productId", addToCart);

// PATCH update item quantity
router.patch("/:productId", updateCartQuantity);

// DELETE remove item from cart
router.delete("/:productId", removeFromCart);

module.exports = router;
