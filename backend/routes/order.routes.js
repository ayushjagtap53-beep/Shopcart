const express = require("express");
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus
} = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");

// Protect all order endpoints
router.use(protect);

// POST create payment order
router.post("/create-payment-order", createPaymentOrder);

// POST verify payment signature
router.post("/verify-payment", verifyPayment);

// GET all orders for current user
router.get("/", getOrders);

// GET single order details
router.get("/:id", getOrderById);

// PATCH update status (Bonus challenge)
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
