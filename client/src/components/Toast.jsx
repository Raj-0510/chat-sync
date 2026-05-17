import { useState, useEffect } from 'react';
import { IoCloseOutline, IoCartOutline, IoCardOutline, IoWarningOutline, IoChatbubblesOutline } from 'react-icons/io5';
import './Toast.css';

const typeConfig = {
  order: { icon: <IoCartOutline />, label: 'Order', className: 'toast-order' },
  payment: { icon: <IoCardOutline />, label: 'Payment', className: 'toast-payment' },
  alert: { icon: <IoWarningOutline />, label: 'Alert', className: 'toast-alert' },
  message: { icon: <IoChatbubblesOutline />, label: 'Message', className: 'toast-message' },
};

const Toast = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification._id || notification.id);
    }, 5000); // auto-close after 5s

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const config = typeConfig[notification.type] || typeConfig.alert;

  return (
    <div className={`toast-container slide-in ${config.className}`}>
      <div className="toast-icon">
        {config.icon}
      </div>
      <div className="toast-content">
        <h4>New {config.label}</h4>
        <p>{notification.message}</p>
      </div>
      <button className="toast-close" onClick={() => onClose(notification._id || notification.id)}>
        <IoCloseOutline />
      </button>
    </div>
  );
};

export default Toast;
