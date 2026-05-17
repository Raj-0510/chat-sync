const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/recent', chatController.getRecentChats);
router.get('/messages/:otherUserId', chatController.getMessages);
router.patch('/read/:senderId', chatController.markAsRead);

module.exports = router;
