const Message = require('../models/Message');

/**
 * GET /api/chat/messages/:otherUserId
 * Get chat history between the current user and another user.
 */
exports.getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: { messages },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching message history.',
    });
  }
};

/**
 * POST /api/chat/read/:senderId
 * Mark messages from a specific sender as read.
 */
exports.markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user.id;

    await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read.',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error marking messages as read.',
    });
  }
};

/**
 * GET /api/chat/recent
 * Get recent chats for the current user.
 */
exports.getRecentChats = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const mongoose = require('mongoose');

    const recentChats = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(currentUserId) },
            { receiverId: new mongoose.Types.ObjectId(currentUserId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', new mongoose.Types.ObjectId(currentUserId)] },
              '$receiverId',
              '$senderId',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
      {
        $project: {
          _id: '$user._id',
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            role: '$user.role',
          },
          lastMessage: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: { recentChats },
    });
  } catch (err) {
    console.error('Error fetching recent chats:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recent chats.',
    });
  }
};
