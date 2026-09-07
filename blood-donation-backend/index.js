const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const axios = require('axios');
const FormData = require('form-data');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// MongoDB Connection
let db;
const client = new MongoClient(process.env.MONGODB_URI);
const DB_NAME = process.env.DB_NAME || 'blood_donation';

async function connectDB() {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`Connected to MongoDB database: ${DB_NAME}`);
    
    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('donation_requests').createIndex({ createdAt: -1 });
    await db.collection('blood_banks').createIndex({ location: '2dsphere' });
    
    // Initialize collections with default data
    await initializeCollections();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function initializeCollections() {
  // Create blood banks collection with default data if empty
  const bloodBanksCount = await db.collection('blood_banks').countDocuments();
  if (bloodBanksCount === 0) {
    await db.collection('blood_banks').insertMany([
      {
        name: 'City Blood Bank',
        address: '123 Main St, City',
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        bloodGroups: {
          'A+': 10, 'A-': 5, 'B+': 8, 'B-': 3,
          'AB+': 6, 'AB-': 2, 'O+': 15, 'O-': 7
        },
        contact: '+1234567890',
        email: 'citybank@blood.com',
        workingHours: '9:00 AM - 6:00 PM',
        createdAt: new Date()
      }
    ]);
    console.log('Default blood bank created');
  }
}

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId) 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Multer configuration for memory storage (no local file storage)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed'));
    }
  }
});

// Image upload to imgbb helper function
async function uploadToImgbb(imageBuffer, filename) {
  try {
    const formData = new FormData();
    formData.append('image', imageBuffer.toString('base64'));
    formData.append('name', filename);
    formData.append('expiration', '600'); // 10 minutes (optional)

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    if (response.data && response.data.data) {
      return {
        success: true,
        url: response.data.data.url,
        thumb: response.data.data.thumb?.url || response.data.data.url,
        display_url: response.data.data.display_url || response.data.data.url,
        delete_url: response.data.data.delete_url
      };
    } else {
      throw new Error('Invalid response from imgbb');
    }
  } catch (error) {
    console.error('Imgbb upload error:', error.response?.data || error.message);
    throw new Error('Failed to upload image to imgbb');
  }
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, bloodGroup, age, address } = req.body;

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      name,
      email,
      password: hashedPassword,
      role: role || 'donor',
      phone,
      bloodGroup,
      age: parseInt(age),
      address,
      profileImage: null,
      isVerified: false,
      isActive: true,
      donationCount: 0,
      lastDonation: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(user);
    const newUser = await db.collection('users').findOne({ _id: result.insertedId });
    
    // Generate token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        bloodGroup: newUser.bloodGroup,
        profileImage: newUser.profileImage
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        profileImage: user.profileImage,
        donationCount: user.donationCount
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: req.userId },
      { projection: { password: 0 } }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Upload profile image to imgbb
app.post('/api/auth/upload-profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if imgbb API key is configured
    if (!process.env.IMGBB_API_KEY) {
      return res.status(500).json({ error: 'Image hosting service not configured' });
    }

    // Upload to imgbb
    const uploadResult = await uploadToImgbb(req.file.buffer, req.file.originalname);

    if (!uploadResult.success) {
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    // Update user profile with image URL
    await db.collection('users').updateOne(
      { _id: req.userId },
      { 
        $set: { 
          profileImage: uploadResult.url,
          updatedAt: new Date()
        } 
      }
    );

    res.json({ 
      success: true, 
      imageUrl: uploadResult.url,
      thumbUrl: uploadResult.thumb,
      message: 'Profile image updated successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

// ==================== DONATION REQUESTS ====================

// Create donation request
app.post('/api/donation-requests', auth, async (req, res) => {
  try {
    const { patientName, bloodGroup, quantity, hospital, location, contact, urgency, notes } = req.body;

    const request = {
      patientName,
      bloodGroup,
      quantity: parseInt(quantity),
      hospital,
      location: {
        type: 'Point',
        coordinates: location.coordinates || [72.8777, 19.0760]
      },
      contact,
      urgency: urgency || 'normal',
      notes,
      status: 'pending',
      createdBy: req.userId,
      donorId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('donation_requests').insertOne(request);
    const newRequest = await db.collection('donation_requests').findOne({ _id: result.insertedId });

    // Emit socket event
    io.emit('newDonationRequest', newRequest);

    res.status(201).json({
      success: true,
      request: newRequest
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create donation request' });
  }
});

// Get all donation requests with filters
app.get('/api/donation-requests', auth, async (req, res) => {
  try {
    const { bloodGroup, status, urgency } = req.query;
    const filter = {};

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;

    const requests = await db.collection('donation_requests')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Get donor details
    const requestsWithDetails = await Promise.all(requests.map(async (request) => {
      if (request.donorId) {
        const donor = await db.collection('users').findOne(
          { _id: new ObjectId(request.donorId) },
          { projection: { name: 1, email: 1, phone: 1, bloodGroup: 1, profileImage: 1 } }
        );
        request.donor = donor;
      }
      const creator = await db.collection('users').findOne(
        { _id: new ObjectId(request.createdBy) },
        { projection: { name: 1, email: 1, phone: 1, profileImage: 1 } }
      );
      request.creator = creator;
      return request;
    }));

    res.json(requestsWithDetails);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to get donation requests' });
  }
});

// Update donation request status (donate)
app.put('/api/donation-requests/:id/donate', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await db.collection('donation_requests').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update request
    const updateData = {
      status,
      donorId: req.userId,
      updatedAt: new Date()
    };

    if (status === 'completed') {
      // Update donor's donation count
      await db.collection('users').updateOne(
        { _id: req.userId },
        { 
          $inc: { donationCount: 1 },
          $set: { lastDonation: new Date() }
        }
      );
    }

    await db.collection('donation_requests').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedRequest = await db.collection('donation_requests').findOne({ 
      _id: new ObjectId(id) 
    });

    // Emit socket event
    io.emit('requestUpdated', updatedRequest);

    res.json({
      success: true,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Donate error:', error);
    res.status(500).json({ error: 'Failed to process donation' });
  }
});

// ==================== BLOOD BANK ====================

// Get blood banks
app.get('/api/blood-banks', auth, async (req, res) => {
  try {
    const bloodBanks = await db.collection('blood_banks')
      .find()
      .sort({ name: 1 })
      .toArray();
    res.json(bloodBanks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get blood banks' });
  }
});

// Search blood banks by location
app.get('/api/blood-banks/search', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const results = await db.collection('blood_banks').aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          maxDistance: radius * 1000,
          spherical: true
        }
      }
    ]).toArray();

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search blood banks' });
  }
});

// Update blood bank inventory
app.put('/api/blood-banks/:id/inventory', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodGroup, quantity } = req.body;

    const result = await db.collection('blood_banks').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { [`bloodGroups.${bloodGroup}`]: parseInt(quantity) },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Blood bank not found' });
    }

    const updatedBank = await db.collection('blood_banks').findOne({ 
      _id: new ObjectId(id) 
    });

    res.json({
      success: true,
      bloodBank: updatedBank
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

// ==================== CHAT / MESSAGES ====================

// Get messages between users
app.get('/api/messages/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId.toString();

    const messages = await db.collection('messages')
      .find({
        $or: [
          { from: currentUserId, to: userId },
          { from: userId, to: currentUserId }
        ]
      })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send message
app.post('/api/messages', auth, async (req, res) => {
  try {
    const { to, message } = req.body;

    const newMessage = {
      from: req.userId.toString(),
      to,
      message,
      read: false,
      createdAt: new Date()
    };

    const result = await db.collection('messages').insertOne(newMessage);
    const savedMessage = await db.collection('messages').findOne({ 
      _id: result.insertedId 
    });

    // Emit socket event for real-time messaging
    io.to(to).emit('newMessage', savedMessage);
    io.to(req.userId.toString()).emit('newMessage', savedMessage);

    res.status(201).json({
      success: true,
      message: savedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get user conversations
app.get('/api/conversations', auth, async (req, res) => {
  try {
    const userId = req.userId.toString();

    const conversations = await db.collection('messages').aggregate([
      {
        $match: {
          $or: [
            { from: userId },
            { to: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$from', userId] },
              '$to',
              '$from'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$to', userId] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          'user.name': 1,
          'user.email': 1,
          'user.profileImage': 1,
          lastMessage: 1,
          unreadCount: 1
        }
      }
    ]).toArray();

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Mark messages as read
app.put('/api/messages/read/:fromUserId', auth, async (req, res) => {
  try {
    const { fromUserId } = req.params;
    const userId = req.userId.toString();

    await db.collection('messages').updateMany(
      {
        from: fromUserId,
        to: userId,
        read: false
      },
      {
        $set: { read: true }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// ==================== STATISTICS ====================

// Get dashboard statistics
app.get('/api/statistics', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    let stats = {};

    // Total donors
    const totalDonors = await db.collection('users').countDocuments({ role: 'donor' });
    stats.totalDonors = totalDonors;

    // Total requests
    const totalRequests = await db.collection('donation_requests').countDocuments();
    stats.totalRequests = totalRequests;

    // Pending requests
    const pendingRequests = await db.collection('donation_requests').countDocuments({ 
      status: 'pending' 
    });
    stats.pendingRequests = pendingRequests;

    // Completed donations
    const completedDonations = await db.collection('donation_requests').countDocuments({ 
      status: 'completed' 
    });
    stats.completedDonations = completedDonations;

    // Blood group distribution
    const bloodGroupDistribution = await db.collection('users').aggregate([
      { $match: { role: 'donor' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
    ]).toArray();
    stats.bloodGroupDistribution = bloodGroupDistribution;

    // Recent donations
    stats.recentDonations = await db.collection('donation_requests')
      .find({ status: 'completed' })
      .sort({ updatedAt: -1 })
      .limit(5)
      .toArray();

    if (userRole === 'admin') {
      // Admin specific stats
      stats.totalBloodBanks = await db.collection('blood_banks').countDocuments();
      stats.totalUsers = await db.collection('users').countDocuments();
    }

    res.json(stats);
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// ==================== SOCKET.IO ====================

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join user's room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle typing status
  socket.on('typing', ({ to, isTyping }) => {
    io.to(to).emit('userTyping', { from: socket.id, isTyping });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong',
    message: err.message 
  });
});

// ==================== ROOT ROUTE ====================

// Root route - API health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Blood Donation API is running',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        uploadProfile: 'POST /api/auth/upload-profile'
      },
      donation: {
        create: 'POST /api/donation-requests',
        getAll: 'GET /api/donation-requests',
        donate: 'PUT /api/donation-requests/:id/donate'
      },
      bloodBank: {
        getAll: 'GET /api/blood-banks',
        search: 'GET /api/blood-banks/search',
        updateInventory: 'PUT /api/blood-banks/:id/inventory'
      },
      messages: {
        get: 'GET /api/messages/:userId',
        send: 'POST /api/messages',
        conversations: 'GET /api/conversations',
        markRead: 'PUT /api/messages/read/:fromUserId'
      },
      statistics: 'GET /api/statistics'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check route (simple)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database: ${DB_NAME}`);
    console.log(`Image hosting: ${process.env.IMGBB_API_KEY ? 'Configured' : 'Not configured'}`);
  });
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});