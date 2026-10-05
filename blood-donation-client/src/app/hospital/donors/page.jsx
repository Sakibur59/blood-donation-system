'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import {
  FaSearch, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaCheckCircle, FaTint, FaTimes, FaHeart, FaSpinner,
  FaComments, FaPaperPlane
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function FindDonorsContent() {
  const { user } = useAuth();
  const { socket } = useSocket();
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (chatUser && msg.from === chatUser.id) {
        setMessages(prev => [...prev, msg]);
      }
    };
    const handleTyping = ({ from, isTyping }) => {
      if (chatUser && from === chatUser.id) setIsTyping(isTyping);
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
      const res = await axios.get(`${API_URL}/donors`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      setDonors(res.data.donors || []);
    } catch (error) {
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

  const handleStartChat = async (donor) => {
    try {
      const storedToken = localStorage.getItem('token');
      setIsModalOpen(false);

      await axios.post(
        `${API_URL}/conversations/start`,
        { userId: donor._id },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      setChatUser({
        id: donor._id,
        name: donor.name,
        role: donor.role,
        profileImage: donor.profileImage,
        bloodGroup: donor.bloodGroup,
      });
      setIsChatOpen(true);
      await loadMessages(donor._id);
    } catch (error) {
      toast.error('Failed to start chat');
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
      await axios.put(
        `${API_URL}/messages/read/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
    } catch (error) {
      console.error(error);
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
        { to: chatUser.id, message: newMessage.trim() },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      setMessages(prev => [...prev, res.data.message]);
      setNewMessage('');
      socket?.emit('typing', { to: chatUser.id, isTyping: false });
    } catch (error) {
      toast.error('Failed to send');
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🩸 Find Blood Donors</h1>
          <p className="text-gray-600 text-sm">Search and connect with donors instantly</p>
        </div>

        {/* Filters */}
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

          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 font-medium mr-2">Quick filter:</span>
            <button
              onClick={() => setSelectedBloodGroup('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedBloodGroup ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
              }`}
            >
              All
            </button>
            {bloodGroups.map(group => (
              <button
                key={group}
                onClick={() => setSelectedBloodGroup(group)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                  selectedBloodGroup === group ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                }`}
              >
                {group}
              </button>
            ))}
            {(searchTerm || selectedBloodGroup) && (
              <button
                onClick={clearFilters}
                className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <FaTimes className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-blue-600">{filteredDonors.length}</span> donors found
            </p>
            <button
              onClick={fetchDonors}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin" /> : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Donors Grid */}
        {loading ? (
          <div className="card text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="card text-center py-16">
            <FaSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {donors.length === 0 ? 'No donors available' : 'No donors found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {donors.length === 0 ? 'Donors will appear here once registered' : 'Try different filters'}
            </p>
            {donors.length > 0 && (
              <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
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
                className="card hover:border-blue-300 group"
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
                          <FaCheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </h3>
                      <p className="text-xs text-gray-500">Age: {donor.age || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FaMapMarkerAlt className="w-3.5 h-3.5 text-blue-500" />
                    <span className="truncate">{donor.address || 'Address not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FaPhone className="w-3.5 h-3.5 text-blue-500" />
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
                    <button
                      onClick={() => handleStartChat(donor)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                      title="Message"
                    >
                      <FaComments className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleContact(donor)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
              <div className={`w-16 h-16 rounded-full ${getBloodGroupColor(selectedDonor.bloodGroup)} flex items-center justify-center text-white font-bold text-xl`}>
                {selectedDonor.bloodGroup}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  {selectedDonor.name}
                  {selectedDonor.isVerified && <FaCheckCircle className="w-4 h-4 text-green-500" />}
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
                  className="flex items-center space-x-3 p-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-300 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <FaPhone className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
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
                  className="flex items-center space-x-3 p-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-300 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <FaEnvelope className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800 break-all">{selectedDonor.email}</p>
                  </div>
                </a>
              )}
            </div>

            {currentUserId !== selectedDonor._id?.toString() && (
              <button
                onClick={() => handleStartChat(selectedDonor)}
                className="w-full btn-secondary py-3"
              >
                <FaComments className="w-4 h-4" />
                Send Message
              </button>
            )}

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Please be respectful when contacting donors.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && chatUser && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {chatUser.profileImage ? (
                    <img src={chatUser.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold">{chatUser.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{chatUser.name}</p>
                  <p className="text-xs text-blue-100">{isTyping ? '✍️ Typing...' : 'Active now'}</p>
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

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {loadingMessages ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <FaComments className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Start a conversation</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.from === currentUserId;
                  return (
                    <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                      }`}>
                        <p className="break-words">{msg.message}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

            <form onSubmit={sendMessage} className="p-3 border-t flex space-x-2 bg-white">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 text-sm border rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors"
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
    </DashboardLayout>
  );
}

export default function HospitalFindDonors() {
  return (
    <RoleGuard allowedRole="hospital">
      <FindDonorsContent />
    </RoleGuard>
  );
}