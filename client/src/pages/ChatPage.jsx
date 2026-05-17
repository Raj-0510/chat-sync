import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { useSocketContext } from '../context/SocketContext';
import useChat from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import {
  IoSendOutline,
  IoPersonCircleOutline,
  IoSearchOutline,
  IoChatbubblesOutline,
} from 'react-icons/io5';

const ChatPage = () => {
  const { user } = useAuth();
  const {
    socket,
    isConnected,
    notifications,
    unreadCount,
    loading: loadingNotifications,
    markAsRead,
    markAllAsRead,
  } = useSocketContext();

  const location = useLocation();
  const [selectedUserId, setSelectedUserId] = useState(location.state?.selectedUserId || null);

  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const {
    users,
    messages,
    loadingUsers,
    loadingMessages,
    typingUsers,
    sendMessage,
    sendTyping,
  } = useChat(socket, selectedUserId);

  const activeChatUser = users.find((u) => u._id === selectedUserId);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    sendMessage(selectedUserId, messageText.trim());
    setMessageText('');
    sendTyping(selectedUserId, false);
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    if (selectedUserId) {
      sendTyping(selectedUserId, e.target.value.length > 0);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-page">
      <Navbar
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loadingNotifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        isConnected={isConnected}
      />

      <main className="chat-container">
        {/* Sidebar: User List */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
            <div className="search-bar">
              <IoSearchOutline />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="user-list">
            {loadingUsers ? (
              <div className="sidebar-loading">
                <span className="spinner" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="no-users">No users found</p>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u._id}
                  className={`user-item ${selectedUserId === u._id ? 'active' : ''}`}
                  onClick={() => setSelectedUserId(u._id)}
                >
                  <IoPersonCircleOutline className="user-avatar" />
                  <div className="user-info">
                    <span className="user-name">{u.name}</span>
                    <span className="user-role">{u.role}</span>
                  </div>
                  {typingUsers[u._id] && <span className="typing-indicator">typing...</span>}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main: Chat Window */}
        <section className="chat-main">
          {selectedUserId ? (
            <>
              <div className="chat-header">
                <IoPersonCircleOutline className="user-avatar" />
                <div className="header-info">
                  <h3>{activeChatUser?.name}</h3>
                  <p>{activeChatUser?.role}</p>
                </div>
              </div>

              <div className="chat-messages">
                {loadingMessages ? (
                  <div className="messages-loading">
                    <span className="spinner" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="empty-chat">
                    <p>No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((m, index) => (
                    <div
                      key={m._id || index}
                      className={`message-wrapper ${
                        m.senderId === (user?._id || user?.id) ? 'sent' : 'received'
                      }`}
                    >
                      <div className="message-bubble">
                        <p>{m.content}</p>
                        <span className="message-time">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={handleInputChange}
                  onBlur={() => selectedUserId && sendTyping(selectedUserId, false)}
                />
                <button type="submit" disabled={!messageText.trim()}>
                  <IoSendOutline />
                </button>
              </form>
            </>
          ) : (
            <div className="chat-placeholder">
              <IoChatbubblesOutline size={80} />
              <h2>Your Conversations</h2>
              <p>Select a user from the sidebar to start chatting.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ChatPage;
