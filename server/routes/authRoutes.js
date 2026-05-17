const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.get('/me', verifyToken, authController.getMe);
router.get('/lookup', verifyToken, authController.lookupUser);
router.get('/users', verifyToken, authController.getUsers);

module.exports = router;
