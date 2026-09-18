'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FaComments, FaTimes, FaPaperPlane, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ChatWidget() {
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = 'http://localhost:5000/api';

  // Fetch conversations
  useEffect(() => {
    if (user && isOpen) {
      fetchConversations();
    }
  }, [user, isOpen]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // যদি selected user থেকে আসে
      if (selectedUser && message.from === selectedUser.userId) {
        setMessages(prev => [...prev, message]);
        markAsRead(selectedUser.userId);
      } else if (message.from !== user.id && message.from !== user._id) {
        // Unread count বাড়াও
        setUnreadCount(prev => prev + 1);
        toast.success('New message received!', { icon: '💬' });
      }
      fetchConversations();
    };

    const handleTyping = ({ from, isTyping }) => {
      if (selectedUser && from === selectedUser.userId) {
        setIsTyping(isTyping);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
    };
  }, [socket, selectedUser, user]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);

      const totalUnread = response.data.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      markAsRead(userId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (userId) => {
    try {
      await axios.put(`${API_URL}/messages/read/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConversations();
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await axios.post(`${API_URL}/messages`, {
        to: selectedUser.userId,
        message: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');

      if (socket) {
        socket.emit('typing', { to: selectedUser.userId, isTyping: false });
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTypingChange = (e) => {
    setNewMessage(e.target.value);
    if (socket && selectedUser) {
      socket.emit('typing', { 
        to: selectedUser.userId, 
        isTyping: e.target.value.length > 0 
      });
    }
  };

  const openChatWith = (conv) => {
    setSelectedUser(conv);
    fetchMessages(conv.userId);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white shadow-2xl hover:shadow-red-500/50 transition-all hover:scale-110 flex items-center justify-center"
      >
        {isOpen ? <FaTimes className="w-6 h-6" /> : <FaComments className="w-6 h-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {/* Connection indicator */}
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}></span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaComments className="w-5 h-5" />
                <span className="font-semibold">Messages</span>
                {isConnected && (
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                )}
              </div>
              {selectedUser && (
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-white hover:bg-white/20 p-1 rounded"
                >
                  ← Back
                </button>
              )}
            </div>

            {/* Body */}
            {!selectedUser ? (
              // Conversation List
              <>
                <div className="p-3 border-b">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <FaComments className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No conversations yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Start chatting from user profiles
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <div
                        key={conv.userId}
                        onClick={() => openChatWith(conv)}
                        className="p-3 hover:bg-red-50 cursor-pointer border-b transition-colors flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {conv.user?.profileImage ? (
                            <img src={conv.user.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-red-600">
                              {conv.user?.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {conv.user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conv.lastMessage?.message || 'No messages'}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              // Chat View
              <>
                {/* Chat Header */}
                <div className="p-3 border-b flex items-center space-x-3 bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center overflow-hidden">
                    {selectedUser.user?.profileImage ? (
                      <img src={selectedUser.user.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-red-600 text-sm">
                        {selectedUser.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selectedUser.user?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isTyping ? '✍️ Typing...' : 'Online'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                  {messages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">
                      No messages yet. Say hi! 👋
                    </p>
                  )}
                  {messages.map((msg, i) => {
                    const isMine = msg.from === (user.id || user._id).toString();
                    return (
                      <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-red-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                        }`}>
                          <p className="break-words">{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-red-100' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white px-4 py-2 rounded-2xl shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-3 border-t flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTypingChange}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-sm border rounded-full focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-red-700 transition-colors"
                  >
                    <FaPaperPlane className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}