import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import {
  IoNotificationsOutline,
  IoMailUnreadOutline,
  IoCheckmarkDoneOutline,
  IoFlashOutline,
  IoChatbubblesOutline,
  IoPersonCircleOutline,
} from 'react-icons/io5';


const Dashboard = () => {
  const { user } = useAuth();
  const {
    socket,
    isConnected,
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useSocketContext();

  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const res = await api.get('/api/chat/recent');
        setRecentChats(res.data.data.recentChats);
      } catch (err) {
        console.error('Failed to fetch recent chats:', err);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchRecentChats();

    if (!socket) return;
    const handleNewMessage = () => {
      fetchRecentChats();
    };
    socket.on('new-message', handleNewMessage);
    socket.on('message-sent', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-sent', handleNewMessage);
    };
  }, [socket]);


  return (
    <div className="dashboard-page">
      <Navbar
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        isConnected={isConnected}
      />

      <main className="dashboard-main">
        <div className="dashboard-welcome">
          <h1>
            Welcome back, <span className="highlight">{user?.name}</span> 👋
          </h1>
          <p>Here&apos;s what&apos;s happening today</p>
        </div>

        <div className="portfolio-note" style={{ background: 'rgba(253, 203, 110, 0.1)', color: 'var(--accent-payment)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid rgba(253, 203, 110, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Note:</strong> This is for freelancing portfolio purposes. All features listed shouldn't be taken seriously.</p>
        </div>

        {/* Stats cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <IoNotificationsOutline />
            </div>
            <div className="stat-info">
              <h3>{notifications.length}</h3>
              <p>Total Notifications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon unread">
              <IoMailUnreadOutline />
            </div>
            <div className="stat-info">
              <h3>{unreadCount}</h3>
              <p>Unread</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon read">
              <IoCheckmarkDoneOutline />
            </div>
            <div className="stat-info">
              <h3>{notifications.length - unreadCount}</h3>
              <p>Read</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon live">
              <IoFlashOutline />
            </div>
            <div className="stat-info">
              <h3>{isConnected ? 'Active' : 'Offline'}</h3>
              <p>Connection</p>
            </div>
          </div>
        </div>

        {/* Recent Chats */}
        <div className="recent-section">
          <h2>Recent Chats</h2>
          {loadingChats ? (
            <div className="loading-container">
              <span className="spinner" />
            </div>
          ) : recentChats.length === 0 ? (
            <div className="empty-state">
              <IoChatbubblesOutline size={64} />
              <h3>No recent chats</h3>
              <p>Start a conversation with someone!</p>
            </div>
          ) : (
            <div className="recent-list">
              {recentChats.map((chat) => (
                <div
                  key={chat.user._id}
                  className="recent-item"
                  onClick={() => navigate('/chat', { state: { selectedUserId: chat.user._id } })}
                  style={{ cursor: 'pointer', padding: '1rem', display: 'flex', alignItems: 'center' }}
                >
                  <IoPersonCircleOutline className="user-avatar" size={40} style={{ color: '#a78bfa', marginRight: '1rem', flexShrink: 0 }} />
                  <div className="recent-content" style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <p style={{ fontWeight: '600', color: '#f8fafc', margin: 0 }}>{chat.user.name}</p>
                      <span className="recent-time" style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                        {new Date(chat.lastMessage.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {chat.lastMessage.senderId === user?._id ? 'You: ' : ''}{chat.lastMessage.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
