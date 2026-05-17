import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import api from '../api/axiosInstance';
import {
  IoSendOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCartOutline,
  IoCardOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';

const typeOptions = [
  { value: 'order', label: 'Order', icon: <IoCartOutline /> },
  { value: 'payment', label: 'Payment', icon: <IoCardOutline /> },
  { value: 'alert', label: 'Alert', icon: <IoWarningOutline /> },
];

const Admin = () => {
  const { user } = useAuth();
  const {
    isConnected,
    notifications,
    unreadCount,
    loading: loadingNotifications,
    markAsRead,
    markAllAsRead,
  } = useSocketContext();
  const [message, setMessage] = useState('');
  const [type, setType] = useState('alert');
  const [targetEmail, setTargetEmail] = useState('');
  const [broadcast, setBroadcast] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!message.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a notification message.' });
      return;
    }

    if (!broadcast && !targetEmail.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a target user email or enable broadcast.' });
      return;
    }

    setSending(true);

    try {
      let payload = { message: message.trim(), type, broadcast };

      // If sending to specific user, resolve email to userId first
      if (!broadcast) {
        // We need the userId — call a lookup or let backend handle it
        // For simplicity, we'll send email and let frontend resolve
        // Actually, let's look up the user first
        const usersRes = await api.get(`/api/auth/lookup?email=${encodeURIComponent(targetEmail.trim())}`);
        if (!usersRes.data.success) {
          setFeedback({ type: 'error', text: 'User not found with that email.' });
          setSending(false);
          return;
        }
        payload.userId = usersRes.data.data.userId;
        payload.broadcast = false;
      }

      const res = await api.post('/api/notifications', payload);

      setFeedback({
        type: 'success',
        text: broadcast
          ? `Broadcast sent to ${res.data.data.count} users!`
          : 'Notification sent successfully!',
      });

      // Reset form
      setMessage('');
      setTargetEmail('');
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send notification.',
      });
    } finally {
      setSending(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="admin-denied">
          <IoWarningOutline size={48} />
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-wrapper">
      <Navbar
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loadingNotifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        isConnected={isConnected}
      />
      <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h2>
            <IoSendOutline /> Send Notification
          </h2>
          <p>Send notifications to specific users or broadcast to everyone.</p>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          {feedback && (
            <div className={`admin-feedback ${feedback.type}`}>
              {feedback.type === 'success' ? (
                <IoCheckmarkCircleOutline />
              ) : (
                <IoWarningOutline />
              )}
              {feedback.text}
            </div>
          )}

          {/* Target selection */}
          <div className="target-toggle">
            <button
              type="button"
              className={`toggle-btn ${!broadcast ? 'active' : ''}`}
              onClick={() => setBroadcast(false)}
            >
              <IoPersonOutline /> Specific User
            </button>
            <button
              type="button"
              className={`toggle-btn ${broadcast ? 'active' : ''}`}
              onClick={() => setBroadcast(true)}
            >
              <IoPeopleOutline /> Broadcast All
            </button>
          </div>

          {/* Email input (only for specific user) */}
          {!broadcast && (
            <div className="input-group">
              <IoMailOutline className="input-icon" />
              <input
                id="admin-target-email"
                type="email"
                placeholder="Target user email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
              />
            </div>
          )}

          {/* Notification type */}
          <div className="type-selector">
            <label>Notification Type</label>
            <div className="type-options">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`type-btn ${type === opt.value ? 'active' : ''} type-${opt.value}`}
                  onClick={() => setType(opt.value)}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="input-group textarea-group">
            <textarea
              id="admin-message"
              placeholder="Notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <span className="char-count">{message.length}/500</span>
          </div>

          <button
            id="admin-send"
            type="submit"
            className="auth-btn send-btn"
            disabled={sending}
          >
            {sending ? (
              <span className="spinner" />
            ) : (
              <>
                <IoSendOutline /> Send Notification
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  </div>
);
};


export default Admin;
