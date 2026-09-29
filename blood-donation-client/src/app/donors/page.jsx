'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useRouter } from 'next/navigation';
import { GiBlood } from 'react-icons/gi';
import { 
  FaSearch, FaMapMarkerAlt, FaPhone, FaEnvelope, 
  FaCheckCircle, FaTint, FaTimes, FaHeart, FaSpinner,
  FaComments, FaPaperPlane, FaArrowLeft
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function FindDonorsPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const currentUserId = (user?.id || user?._id)?.toString();

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    filterDonors();
  }, [searchTerm, selectedBloodGroup, donors]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Socket listeners for chat
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (chatUser && message.from === chatUser.id) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleTyping = ({ from, isTyping }) => {
      if (chatUser && from === chatUser.id) {
        setIsTyping(isTyping);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
    };
  }, [socket, chatUser]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setDonors([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_URL}/donors`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      
      setDonors(res.data.donors || []);
    } catch (error) {
      console.error('Fetch donors error:', error.response?.data || error.message);
      toast.error('Failed to load donors');
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDonors = () => {
    let filtered = [...donors];

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBloodGroup) {
      filtered = filtered.filter(d => d.bloodGroup === selectedBloodGroup);
    }

    setFilteredDonors(filtered);
  };

  const handleContact = (donor) => {
    setSelectedDonor(donor);
    setIsModalOpen(true);
  };

  // ✅ Start chat with donor
  const handleStartChat = async (donor) => {
    try {
      const storedToken = localStorage.getItem('token');
      
      // Close contact modal
      setIsModalOpen(false);
      
      // Verify conversation can be started
      const res = await axios.post(
        `${API_URL}/conversations/start`,
        { userId: donor._id },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      // Open chat window
      setChatUser({
        id: donor._id,
        name: donor.name,
        email: donor.email,
        role: donor.role,
        profileImage: donor.profileImage,
        bloodGroup: donor.bloodGroup
      });
      setIsChatOpen(true);
      
      // Load existing messages
      await loadMessages(donor._id);
    } catch (error) {
      console.error('Start chat error:', error);
      toast.error(error.response?.data?.error || 'Failed to start chat');
    }
  };

  const loadMessages = async (userId) => {
    try {
      setLoadingMessages(true);
      const storedToken = localStorage.getItem('token');
      
      const res = await axios.get(`${API_URL}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      
      setMessages(res.data || []);
      
      // Mark as read
      await axios.put(
        `${API_URL}/messages/read/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatUser || sendingMessage) return;

    try {
      setSendingMessage(true);
      const storedToken = localStorage.getItem('token');
      
      const res = await axios.post(
        `${API_URL}/messages`,
        {
          to: chatUser.id,
          message: newMessage.trim()
        },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      setMessages(prev => [...prev, res.data.message]);
      setNewMessage('');

      if (socket) {
        socket.emit('typing', { to: chatUser.id, isTyping: false });
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket && chatUser) {
      socket.emit('typing', { 
        to: chatUser.id, 
        isTyping: e.target.value.length > 0 
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBloodGroup('');
  };

  const getBloodGroupColor = (group) => {
    const colors = {
      'O+': 'bg-red-500', 'O-': 'bg-red-600',
      'A+': 'bg-blue-500', 'A-': 'bg-blue-600',
      'B+': 'bg-green-500', 'B-': 'bg-green-600',
      'AB+': 'bg-purple-500', 'AB-': 'bg-purple-600',
    };
    return colors[group] || 'bg-gray-500';
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <GiBlood className="w-96 h-96" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <FaTint className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Blood Donors
          </h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            Search from our verified donors and connect instantly in emergencies
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8">
        <div className="container-custom">
          <div className="card">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
              </div>

              <div className="relative">
                <select
                  value={selectedBloodGroup}
                  onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  className="select-field"
                >
                  <option value="">All Blood Groups</option>
                  {bloodGroups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium mr-2">Quick filter:</span>
              <button
                onClick={() => setSelectedBloodGroup('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedBloodGroup
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                }`}
              >
                All
              </button>
              {bloodGroups.map(group => (
                <button
                  key={group}
                  onClick={() => setSelectedBloodGroup(group)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    selectedBloodGroup === group
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                  }`}
                >
                  {group}
                </button>
              ))}
              {(searchTerm || selectedBloodGroup) && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                  <FaTimes className="w-3 h-3" />
                  Clear filters
                </button>
              )}
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-red-600">{filteredDonors.length}</span> donors found
              </p>
              <button
                onClick={fetchDonors}
                disabled={loading}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin" /> : '🔄 Refresh'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Donors Grid */}
      <section className="py-8 pb-20">
        <div className="container-custom">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <GiBlood className="w-12 h-12 text-red-600 blood-drop-animation mx-auto mb-4" />
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading donors...</p>
              </div>
            </div>
          ) : filteredDonors.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="w-10 h-10 text-red-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {donors.length === 0 ? 'No donors available' : 'No donors found'}
              </h3>
              <p className="text-gray-500 mb-4">
                {donors.length === 0 
                  ? 'Donors will appear here once registered' 
                  : 'Try adjusting your filters or search term'
                }
              </p>
              {donors.length > 0 && (
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonors.map((donor, index) => (
                <motion.div
                  key={donor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="card hover:border-red-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-14 h-14 rounded-full ${getBloodGroupColor(donor.bloodGroup)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                          {donor.name}
                          {donor.isVerified && (
                            <FaCheckCircle className="w-4 h-4 text-green-500" title="Verified" />
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">Age: {donor.age || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="w-3.5 h-3.5 text-red-500" />
                      <span className="truncate">{donor.address || 'Address not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FaPhone className="w-3.5 h-3.5 text-red-500" />
                      <span>{donor.phone || 'Phone not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-2 text-xs">
                      <FaHeart className="w-3 h-3 text-red-500" />
                      <span className="text-gray-600">
                        <span className="font-bold">{donor.donationCount || 0}</span> donations
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {/* Chat button on card */}
                      <button
                        onClick={() => handleStartChat(donor)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                        title="Send Message"
                      >
                        <FaComments className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleContact(donor)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDonor(null);
        }}
        title="Contact Donor"
      >
        {selectedDonor && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-xl">
              <div className={`w-16 h-16 rounded-full ${getBloodGroupColor(selectedDonor.bloodGroup)} flex items-center justify-center text-white font-bold text-xl`}>
                {selectedDonor.bloodGroup}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  {selectedDonor.name}
                  {selectedDonor.isVerified && (
                    <FaCheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedDonor.age} years • {selectedDonor.donationCount || 0} donations
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedDonor.phone && (
                <a
                  href={`tel:${selectedDonor.phone}`}
                  className="flex items-center space-x-3 p-4 bg-white border-2 border-red-100 rounded-xl hover:border-red-300 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                    <FaPhone className="w-4 h-4 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Call</p>
                    <p className="font-semibold text-gray-800">{selectedDonor.phone}</p>
                  </div>
                </a>
              )}

              {selectedDonor.email && (
                <a
                  href={`mailto:${selectedDonor.email}`}
                  className="flex items-center space-x-3 p-4 bg-white border-2 border-red-100 rounded-xl hover:border-red-300 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                    <FaEnvelope className="w-4 h-4 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800 break-all">{selectedDonor.email}</p>
                  </div>
                </a>
              )}

              {selectedDonor.address && (
                <div className="flex items-center space-x-3 p-4 bg-white border-2 border-red-100 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <FaMapMarkerAlt className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-semibold text-gray-800">{selectedDonor.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ Send Message Button */}
            {currentUserId !== selectedDonor._id?.toString() && (
              <button
                onClick={() => handleStartChat(selectedDonor)}
                className="w-full btn-primary py-3"
              >
                <FaComments className="w-4 h-4" />
                Send Message
              </button>
            )}

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Please be respectful when contacting donors. Only reach out if you genuinely need blood.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ✅ Chat Window */}
      <AnimatePresence>
        {isChatOpen && chatUser && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {chatUser.profileImage ? (
                    <img src={chatUser.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold">
                      {chatUser.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{chatUser.name}</p>
                  <p className="text-xs text-red-100">
                    {isTyping ? '✍️ Typing...' : 'Active now'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsChatOpen(false);
                  setChatUser(null);
                  setMessages([]);
                }}
                className="p-1 hover:bg-white/20 rounded"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {loadingMessages ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <FaComments className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    Start a conversation with {chatUser.name}
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.from === currentUserId;
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
                })
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
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
            <form onSubmit={sendMessage} className="p-3 border-t flex space-x-2 bg-white">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 text-sm border rounded-full focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-red-700 transition-colors"
              >
                {sendingMessage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FaPaperPlane className="w-4 h-4" />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}