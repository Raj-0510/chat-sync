import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosInstance';

/**
 * Custom hook for chat state management.
 * Fetches users, message history, and handles socket events for real-time messaging.
 *
 * @param {import('socket.io-client').Socket | null} socket
 * @param {string | null} selectedUserId
 */
const useChat = (socket, selectedUserId) => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { userId: boolean }

  // Fetch all users for the sidebar
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get('/api/auth/users');
      setUsers(res.data.data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Fetch messages for a selected conversation
  const fetchMessages = useCallback(async (userId) => {
    if (!userId) return;
    try {
      setLoadingMessages(true);
      const res = await api.get(`/api/chat/messages/${userId}`);
      setMessages(res.data.data.messages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Initial users fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    } else {
      setMessages([]);
    }
  }, [selectedUserId, fetchMessages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // If message is from/to the currently selected user, add it to the state
      if (
        message.senderId === selectedUserId ||
        message.receiverId === selectedUserId
      ) {
        setMessages((prev) => [...prev, message]);
      }
      
      // Update users list to show new message or reorder (bonus)
    };

    const handleMessageSent = (message) => {
      // Add the message we just sent to the list if it matches selecting user
      if (message.receiverId === selectedUserId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTyping = ({ userId, isTyping }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-sent', handleMessageSent);
    socket.on('user-typing', handleTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-sent', handleMessageSent);
      socket.off('user-typing', handleTyping);
    };
  }, [socket, selectedUserId]);

  const sendMessage = useCallback((receiverId, content) => {
    if (!socket || !content.trim()) return;
    socket.emit('private-message', { receiverId, content });
  }, [socket]);

  const sendTyping = useCallback((receiverId, isTyping) => {
    if (!socket) return;
    socket.emit('typing', { receiverId, isTyping });
  }, [socket]);

  return {
    users,
    messages,
    loadingUsers,
    loadingMessages,
    typingUsers,
    sendMessage,
    sendTyping,
    refetchUsers: fetchUsers,
  };
};

export default useChat;
