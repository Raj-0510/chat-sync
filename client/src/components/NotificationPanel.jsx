import NotificationItem from './NotificationItem';
import {
  IoCheckmarkDoneOutline,
  IoNotificationsOffOutline,
} from 'react-icons/io5';

const NotificationPanel = ({
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}) => {
  return (
    <div className="notification-panel">
      <div className="panel-header">
        <h3>
          Notifications
          {unreadCount > 0 && (
            <span className="panel-unread-count">{unreadCount}</span>
          )}
        </h3>
        <div className="panel-actions">
          {unreadCount > 0 && (
            <button
              className="mark-all-btn"
              onClick={onMarkAllAsRead}
              title="Mark all as read"
            >
              <IoCheckmarkDoneOutline /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="panel-body">
        {loading ? (
          <div className="panel-loading">
            <span className="spinner" />
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="panel-empty">
            <IoNotificationsOffOutline size={48} />
            <p>No notifications yet</p>
            <span>When you receive notifications, they&apos;ll appear here.</span>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
