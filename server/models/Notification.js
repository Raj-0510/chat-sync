const mongoose = require('mongoose');

/**
 * Notification Schema
 * - userId: Target user for this notification (indexed)
 * - message: Notification text content
 * - type: Category — 'order', 'payment', or 'alert'
 * - isRead: Read status, used for unread badge count
 * - createdAt: Timestamp for ordering (newest first)
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: ['order', 'payment', 'alert'],
        message: 'Type must be one of: order, payment, alert',
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Compound index for fetching user's notifications sorted by newest
// Also covers unread count queries: { userId, isRead: false }
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Single-field index for sorting by date
notificationSchema.index({ createdAt: -1 });

// Strip __v from JSON
notificationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
