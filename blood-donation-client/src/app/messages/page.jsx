'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import DashboardLayout from '../components/DashboardLayout';
import { FaSearch, FaUser, FaPaperPlane, FaCircle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function MessagesPage() {
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUserId = user?.id || user?._id;

  // Fetch conversations on mount
  useEffect(() => {
    if (user && token) {
      fetchConversations();
    }
  }, [user, token]);

  // Fetch messages when user selected
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.userId);
    }
  }, [selectedUser]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (selectedUser && message.from === selectedUser.userId) {
        setMessages(prev => [...prev, message]);
        markAsRead(selectedUser.userId);
      } else if (message.from !== currentUserId?.toString()) {
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
  }, [socket, selectedUser, currentUserId]);

  // Filter conversations by search
  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredConversations(
        conversations.filter(c =>
          c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchTerm, conversations]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data || []);
    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data || []);
      markAsRead(userId);
    } catch (error) {
      console.error('Fetch messages error:', error);
      toast.error('Failed to load messages');
    }
  };

  const markAsRead = async (userId) => {
    try {
      await axios.put(`${API_URL}/messages/read/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConversations();
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sending) return;

    try {
      setSending(true);
      const res = await axios.post(`${API_URL}/messages`, {
        to: selectedUser.userId,
        message: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, res.data.message]);
      setNewMessage('');

      if (socket) {
        socket.emit('typing', { to: selectedUser.userId, isTyping: false });
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedUser) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', { to: selectedUser.userId, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit('typing', { to: selectedUser.userId, isTyping: false });
    }, 2000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)] flex bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Conversations Sidebar */}
        <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r flex-col`}>
          <div className="p-4 border-b bg-gradient-to-r from-red-600 to-red-700 text-white">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold">Messages</h2>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}></span>
                <span className="text-xs">{isConnected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
          </div>

          <div className="p-3 border-b">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FaUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">No conversations</p>
                <p className="text-xs text-gray-400 mt-1">
                  Start a chat from user profiles
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.userId}
                  onClick={() => setSelectedUser(conv)}
                  className={`p-4 hover:bg-red-50 cursor-pointer border-b transition-colors ${
                    selectedUser?.userId === conv.userId
                      ? 'bg-red-50 border-l-4 border-l-red-600'
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {conv.user?.profileImage ? (
                        <img
                          src={conv.user.profileImage}
                          alt={conv.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-red-600 text-lg">
                          {conv.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {conv.user?.name}
                        </p>
                        {conv.lastMessage?.createdAt && (
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 truncate">
                          {conv.lastMessage?.message || 'No messages yet'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 ml-2">
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-red-500 capitalize mt-0.5">
                        {conv.user?.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedUser ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden text-gray-500 hover:text-gray-700 p-1"
                >
                  <FaArrowLeft />
                </button>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center overflow-hidden">
                  {selectedUser.user?.profileImage ? (
                    <img
                      src={selectedUser.user.profileImage}
                      alt={selectedUser.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-red-600">
                      {selectedUser.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {selectedUser.user?.name}
                  </p>
                  <div className="flex items-center space-x-1">
                    <FaCircle className="w-2 h-2 text-green-500" />
                    <p className="text-xs text-gray-500">
                      {isTyping ? '✍️ Typing...' : 'Active now'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">
                    No messages yet. Say hi! 👋
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.from === currentUserId?.toString();
                  return (
                    <div
                      key={i}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                          isMine
                            ? 'bg-red-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="break-words text-sm">{msg.message}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isMine ? 'text-red-100' : 'text-gray-400'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 border rounded-full focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-red-700 transition-colors"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FaPaperPlane className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500 bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <FaPaperPlane className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Your Messages
              </h3>
              <p className="text-sm text-gray-500">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}