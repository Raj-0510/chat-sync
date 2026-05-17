import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import { useSocketContext } from '../context/SocketContext';
import {
  IoNotificationsOutline,
  IoLogOutOutline,
  IoShieldCheckmarkOutline,
  IoPersonCircleOutline,
  IoRadioOutline,
  IoChatbubblesOutline,
} from 'react-icons/io5';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    isConnected,
  } = useSocketContext();
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);
  const location = useLocation();

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setShowPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close panel on route change
  useEffect(() => {
    setShowPanel(false);
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/dashboard" className="navbar-brand">
          <IoChatbubblesOutline className="brand-icon" style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }} />
          <span className="brand-text">ChatSync</span>
        </Link>
      </div>

      <div className="navbar-right">
        {/* Connection status indicator */}
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <IoRadioOutline />
          <span>{isConnected ? 'Live' : 'Offline'}</span>
        </div>

        {/* Admin link */}
        {isAdmin && (
          <Link
            to="/admin"
            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            <IoShieldCheckmarkOutline />
            <span>Admin</span>
          </Link>
        )}

        <Link
          to="/chat"
          className={`nav-link ${location.pathname === '/chat' ? 'active' : ''}`}
        >
          <IoChatbubblesOutline />
          <span>Chat</span>
        </Link>

        {/* Notification bell */}
        <button
          ref={bellRef}
          className="notification-bell"
          onClick={() => setShowPanel(!showPanel)}
          id="notification-bell"
        >
          <IoNotificationsOutline />
          {unreadCount > 0 && (
            <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        {/* User info */}
        <div className="user-info">
          <IoPersonCircleOutline className="user-avatar" />
          <span className="user-name">{user?.name}</span>
          {isAdmin && <span className="admin-badge">Admin</span>}
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={logout} title="Sign out">
          <IoLogOutOutline />
        </button>

        {/* Notification Panel Dropdown */}
        {showPanel && (
          <div ref={panelRef} className="notification-panel-wrapper">
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loading}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClose={() => setShowPanel(false)}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
