const jwt = require("jsonwebtoken");

const generateToken = (res, customerId) => {
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET || "shopkart_secret_jwt_key_2026",
    { expiresIn: "1d" }
  );

  // Store JWT inside HttpOnly cookie
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  return token;
};

module.exports = generateToken;
