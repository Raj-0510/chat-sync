import {
  IoCartOutline,
  IoCardOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoEllipseOutline,
  IoTimeOutline,
  IoChatbubblesOutline,
} from 'react-icons/io5';


const typeConfig = {
  order: {
    icon: <IoCartOutline />,
    label: 'Order',
    className: 'type-order',
  },
  payment: {
    icon: <IoCardOutline />,
    label: 'Payment',
    className: 'type-payment',
  },
  alert: {
    icon: <IoWarningOutline />,
    label: 'Alert',
    className: 'type-alert',
  },
  message: {
    icon: <IoChatbubblesOutline />,
    label: 'Message',
    className: 'type-alert', // Fallback to alert styling since message styling doesn't exist
  },
};


const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const { message, type, isRead, createdAt } = notification;
  const config = typeConfig[type] || typeConfig.alert;

  return (
    <div
      className={`notification-item ${isRead ? 'read' : 'unread'}`}
      onClick={() => !isRead && onMarkAsRead(notification._id, type)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !isRead && onMarkAsRead(notification._id, type)}
    >

      <div className={`notification-type-badge ${config.className}`}>
        {config.icon}
      </div>

      <div className="notification-content">
        <p className="notification-message">{message}</p>
        <div className="notification-meta">
          <span className={`notification-type-label ${config.className}`}>
            {config.label}
          </span>
          <span className="notification-time">
            <IoTimeOutline /> {formatTime(createdAt)}
          </span>
        </div>
      </div>

      <div className="notification-status">
        {isRead ? (
          <IoCheckmarkCircle className="status-read" />
        ) : (
          <IoEllipseOutline className="status-unread" />
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
