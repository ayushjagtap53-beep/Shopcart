const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// @desc    Add product to cart or increment quantity
// @route   POST /cart/:productId
// @access  Protected
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    // 2. Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 3. Find current user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found"
      });
    }

    // 4. Check if item already exists in cart
    const itemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const currentQty = user.cart[itemIndex].quantity;
      if (currentQty + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Stock limit of ${product.stock} units reached.`
        });
      }
      user.cart[itemIndex].quantity += 1;
    } else {
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: "Product is out of stock"
        });
      }
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();

    // 5. Populate and return updated cart
    const populatedUser = await Customer.findById(user._id).populate({
      path: "cart.product",
      select: "name price category image stock description"
    });

    const validCart = (populatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: validCart
    });
  } catch (error) {
    console.error("addToCart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error adding product to cart",
      error: error.message
    });
  }
};

// @desc    Get current user's cart
// @route   GET /cart
// @access  Protected
const getCart = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price category image stock description"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found"
      });
    }

    const validCart = (user.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      cart: validCart
    });
  } catch (error) {
    console.error("getCart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching cart",
      error: error.message
    });
  }
};

// @desc    Update quantity of a cart item
// @route   PATCH /cart/:productId
// @access  Protected
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    // 2. Validate quantity number
    const qty = Number(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number of at least 1"
      });
    }

    // 3. Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 4. Validate stock
    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${qty}) exceeds available stock (${product.stock})`
      });
    }

    // 5. Find user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found"
      });
    }

    const cartItem = user.cart.find(
      (item) => item.product && item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart"
      });
    }

    cartItem.quantity = qty;
    await user.save();

    // 6. Populate and return
    const populatedUser = await Customer.findById(user._id).populate({
      path: "cart.product",
      select: "name price category image stock description"
    });

    const validCart = (populatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: validCart
    });
  } catch (error) {
    console.error("updateCartQuantity Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating cart quantity",
      error: error.message
    });
  }
};

// @desc    Remove product from cart
// @route   DELETE /cart/:productId
// @access  Protected
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    // 2. Find user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found"
      });
    }

    const exists = user.cart.some(
      (item) => item.product && item.product.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart"
      });
    }

    user.cart = user.cart.filter(
      (item) => item.product && item.product.toString() !== productId
    );

    await user.save();

    const populatedUser = await Customer.findById(user._id).populate({
      path: "cart.product",
      select: "name price category image stock description"
    });

    const validCart = (populatedUser.cart || []).filter(
      (item) => item.product !== null
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: validCart
    });
  } catch (error) {
    console.error("removeFromCart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error removing product from cart",
      error: error.message
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
};
