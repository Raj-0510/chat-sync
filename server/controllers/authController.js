const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT token with user ID and role.
 * Expires in 7 days.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * POST /api/auth/signup
 * Register a new user account.
 */
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during signup.',
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticate a user and return JWT.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user by email (need to select password explicitly if using select: false)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user's profile.
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
};

/**
 * GET /api/auth/lookup?email=user@example.com
 * Admin utility — resolve an email to a userId.
 */
exports.lookupUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email query parameter is required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email.',
      });
    }

    res.status(200).json({
      success: true,
      data: { userId: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
};

/**
 * GET /api/auth/users
 * Get list of all registered users except the current user.
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email role createdAt')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching users.',
    });
  }
};
