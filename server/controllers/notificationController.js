const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * POST /api/notifications
 * Admin only — Create a notification for a specific user or broadcast to all.
 *
 * Body: { userId?: string, message: string, type: 'order'|'payment'|'alert', broadcast?: boolean }
 * - If broadcast is true, sends to ALL users
 * - If broadcast is false/missing, sends to the specified userId
 */
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type, broadcast } = req.body;

    // Validate required fields
    if (!message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide message and type.',
      });
    }

    // Validate type enum
    const validTypes = ['order', 'payment', 'alert'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type must be one of: ${validTypes.join(', ')}`,
      });
    }

    const io = req.app.get('io');

    // Broadcast to all users
    if (broadcast) {
      const users = await User.find({}, '_id');
      const notifications = await Notification.insertMany(
        users.map((user) => ({
          userId: user._id,
          message,
          type,
        }))
      );

      // Emit to each user's specific room so they receive their unique notification _id
      notifications.forEach(notification => {
        io.to(`user-${notification.userId}`).emit('new-notification', notification.toJSON());
      });

      return res.status(201).json({
        success: true,
        data: {
          count: notifications.length,
          message: `Notification broadcast to ${notifications.length} users.`,
        },
      });
    }

    // Send to specific user
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId or set broadcast to true.',
      });
    }

    // Verify target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found.',
      });
    }

    const notification = await Notification.create({
      userId,
      message,
      type,
    });

    // Emit to specific user's room
    io.to(`user-${userId}`).emit('new-notification', notification.toJSON());

    res.status(201).json({
      success: true,
      data: { notification: notification.toJSON() },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating notification.',
    });
  }
};

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user.
 * Sorted by newest first. Supports pagination via ?page=1&limit=20
 */
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId: req.user.id }),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications.',
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a specific notification as read. User must own the notification.
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    // Verify ownership
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this notification.',
      });
    }

    notification.isRead = true;
    await notification.save();

    // Emit read status update to user
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('notification-read', {
      notificationId: notification._id,
    });

    res.status(200).json({
      success: true,
      data: { notification: notification.toJSON() },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error updating notification.',
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark ALL notifications as read for the authenticated user.
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    // Emit to user's socket
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('all-notifications-read');

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount} notifications marked as read.`,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error updating notifications.',
    });
  }
};
