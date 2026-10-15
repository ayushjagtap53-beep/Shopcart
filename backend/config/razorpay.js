const Razorpay = require("razorpay");

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart_2026";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "shopkart_razorpay_secret_2026";

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
  });
} catch (error) {
  console.warn("Razorpay initialization notice:", error.message);
}

module.exports = {
  razorpay: razorpayInstance,
  razorpayKeyId,
  razorpayKeySecret
};
