const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

const protect = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access denied. Token missing."
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "shopkart_secret_jwt_key_2026"
    );

    // Find customer excluding password
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        sameSite: "lax"
      });
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Customer account not found. Please log in again."
      });
    }

    // Attach customer object to req.user
    req.user = customer;
    next();
  } catch (error) {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "lax"
    });
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token. Please log in again."
    });
  }
};

module.exports = { protect };
