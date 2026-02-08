/**
 * Authentication Routes
 * Handles user registration and login
 */

const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===== Configuration =====
const JWT_SECRET = "your_jwt_secret_key_change_this_in_production";
const JWT_EXPIRE = "7d";

// ===== Helper Functions =====

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

/**
 * Send error response
 */
const sendError = (res, message, statusCode = 400) => {
  console.error("❌ Auth Error:", message);
  res.status(statusCode).json({ error: message });
};

/**
 * Send success response with user data and token
 */
const sendSuccess = (res, user, token, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  });
};

// ===== Routes =====

/**
 * POST /auth/register
 * Register a new user
 * Body: { username, email, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("📥 POST /auth/register - Registering user:", { username, email });

    // Validate input
    if (!username || !email || !password) {
      return sendError(res, "Please provide username, email, and password", 400);
    }

    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return sendError(res, "Email already registered", 400);
      }
      return sendError(res, "Username already taken", 400);
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    console.log("💾 Saving user to database...");
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log(`✓ User registered: ${username}`);
    sendSuccess(res, user, token, 201);
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    console.error("Stack:", error.stack);
    sendError(res, error.message || "Registration failed", 500);
  }
});

/**
 * POST /auth/login
 * Login user
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return sendError(res, "Please provide email and password", 400);
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    // Generate token
    const token = generateToken(user._id);

    console.log(`✓ User logged in: ${user.username}`);
    sendSuccess(res, user, token);
  } catch (error) {
    console.error("Login error:", error.message);
    sendError(res, error.message, 500);
  }
});

/**
 * GET /auth/me
 * Get current user (protected route)
 * Headers: Authorization: Bearer <token>
 */
router.get("/me", async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return sendError(res, "No token provided", 401);
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    sendError(res, "Invalid token", 401);
  }
});

module.exports = router;
