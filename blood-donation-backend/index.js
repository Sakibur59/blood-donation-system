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
  // Create default admin if not exists
  const adminExists = await db.collection('users').findOne({ email: 'admin@blood.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.collection('users').insertOne({
      name: 'System Admin',
      email: 'admin@blood.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      bloodGroup: 'O+',
      age: 30,
      address: 'Admin Office',
      profileImage: null,
      isVerified: true,
      isActive: true,
      donationCount: 0,
      lastDonation: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Default admin created: admin@blood.com / admin123');
  }

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
      },
      {
        name: 'District Blood Bank',
        address: '456 Park Ave, District',
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        bloodGroups: {
          'A+': 8, 'A-': 3, 'B+': 6, 'B-': 2,
          'AB+': 4, 'AB-': 1, 'O+': 12, 'O-': 5
        },
        contact: '+0987654321',
        email: 'districtbank@blood.com',
        workingHours: '8:00 AM - 8:00 PM',
        createdAt: new Date()
      }
    ]);
    console.log('Default blood banks created');
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
    req.userRole = user.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Required role: ' + roles.join(', '),
        yourRole: req.user.role
      });
    }
    next();
  };
};

// Multer configuration for memory storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000,
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

// ==================== ROOT ROUTE ====================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🩸 Blood Donation API is running',
    version: '1.0.0',
    roles: {
      admin: 'Full system control',
      donor: 'Can donate blood',
      hospital: 'Can request blood'
    },
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        uploadProfile: 'POST /api/auth/upload-profile',
        users: 'GET /api/auth/users (Admin only)'
      },
      donor: {
        donate: 'POST /api/donor/donate',
        myDonations: 'GET /api/donor/my-donations',
        donationHistory: 'GET /api/donor/history'
      },
      hospital: {
        requestBlood: 'POST /api/hospital/request',
        myRequests: 'GET /api/hospital/my-requests',
        updateRequest: 'PUT /api/hospital/request/:id'
      },
      admin: {
        users: 'GET /api/admin/users',
        updateUser: 'PUT /api/admin/users/:id',
        deleteUser: 'DELETE /api/admin/users/:id',
        bloodBanks: 'GET /api/admin/blood-banks',
        createBloodBank: 'POST /api/admin/blood-banks',
        updateBloodBank: 'PUT /api/admin/blood-banks/:id',
        deleteBloodBank: 'DELETE /api/admin/blood-banks/:id',
        allRequests: 'GET /api/admin/requests',
        statistics: 'GET /api/admin/statistics'
      },
      bloodBank: {
        getAll: 'GET /api/blood-banks',
        search: 'GET /api/blood-banks/search'
      },
      messages: {
        get: 'GET /api/messages/:userId',
        send: 'POST /api/messages',
        conversations: 'GET /api/conversations',
        markRead: 'PUT /api/messages/read/:fromUserId'
      }
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, bloodGroup, age, address } = req.body;

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

// Upload profile image
app.post('/api/auth/upload-profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!process.env.IMGBB_API_KEY) {
      return res.status(500).json({ error: 'Image hosting service not configured' });
    }

    const uploadResult = await uploadToImgbb(req.file.buffer, req.file.originalname);

    if (!uploadResult.success) {
      return res.status(500).json({ error: 'Failed to upload image' });
    }

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

// ==================== DONOR ROUTES (Blood Give) ====================

// Donor donates blood
app.post('/api/donor/donate', auth, authorize('donor'), async (req, res) => {
  try {
    const { bloodBankId, bloodGroup, quantity, notes } = req.body;

    // Check if blood bank exists
    const bloodBank = await db.collection('blood_banks').findOne({ 
      _id: new ObjectId(bloodBankId) 
    });
    if (!bloodBank) {
      return res.status(404).json({ error: 'Blood bank not found' });
    }

    // Check if donor can donate (age, last donation, etc.)
    const donor = await db.collection('users').findOne({ _id: req.userId });
    const today = new Date();
    const lastDonation = donor.lastDonation ? new Date(donor.lastDonation) : null;
    
    if (lastDonation) {
      const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
      if (daysSinceLastDonation < 90) {
        return res.status(400).json({ 
          error: `You can donate again after ${90 - daysSinceLastDonation} days`,
          daysLeft: 90 - daysSinceLastDonation
        });
      }
    }

    // Create donation record
    const donation = {
      donorId: req.userId,
      donorName: donor.name,
      donorBloodGroup: donor.bloodGroup,
      bloodBankId: new ObjectId(bloodBankId),
      bloodBankName: bloodBank.name,
      bloodGroup: bloodGroup || donor.bloodGroup,
      quantity: parseInt(quantity) || 1,
      notes: notes || '',
      status: 'completed',
      donationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('donations').insertOne(donation);

    // Update blood bank inventory
    const currentStock = bloodBank.bloodGroups[donation.bloodGroup] || 0;
    await db.collection('blood_banks').updateOne(
      { _id: new ObjectId(bloodBankId) },
      { 
        $set: { 
          [`bloodGroups.${donation.bloodGroup}`]: currentStock + donation.quantity,
          updatedAt: new Date()
        } 
      }
    );

    // Update donor's donation count
    await db.collection('users').updateOne(
      { _id: req.userId },
      { 
        $inc: { donationCount: 1 },
        $set: { lastDonation: new Date() }
      }
    );

    const newDonation = await db.collection('donations').findOne({ _id: result.insertedId });

    // Emit socket event
    io.emit('newDonation', newDonation);

    res.status(201).json({
      success: true,
      message: 'Thank you for donating blood! You saved a life today ❤️',
      donation: newDonation
    });
  } catch (error) {
    console.error('Donation error:', error);
    res.status(500).json({ error: 'Failed to process donation' });
  }
});

// Get donor's donation history
app.get('/api/donor/my-donations', auth, authorize('donor'), async (req, res) => {
  try {
    const donations = await db.collection('donations')
      .find({ donorId: req.userId })
      .sort({ donationDate: -1 })
      .toArray();
    
    res.json({
      success: true,
      totalDonations: donations.length,
      donations
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Failed to get donations' });
  }
});

// Get donor's donation statistics
app.get('/api/donor/stats', auth, authorize('donor'), async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ _id: req.userId });
    const donations = await db.collection('donations')
      .find({ donorId: req.userId })
      .toArray();

    const bloodGroups = {};
    donations.forEach(d => {
      bloodGroups[d.bloodGroup] = (bloodGroups[d.bloodGroup] || 0) + 1;
    });

    res.json({
      success: true,
      totalDonations: donations.length,
      lastDonation: user.lastDonation,
      bloodGroups,
      nextEligibleDate: user.lastDonation ? 
        new Date(new Date(user.lastDonation).getTime() + 90 * 24 * 60 * 60 * 1000) : 
        null
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// ==================== HOSPITAL ROUTES (Blood Take/Request) ====================

// Hospital requests blood
app.post('/api/hospital/request', auth, authorize('hospital'), async (req, res) => {
  try {
    const { 
      patientName, 
      bloodGroup, 
      quantity, 
      hospital, 
      contact, 
      urgency, 
      notes,
      requiredDate 
    } = req.body;

    const request = {
      hospitalId: req.userId,
      hospitalName: req.user.name,
      patientName,
      bloodGroup,
      quantity: parseInt(quantity),
      hospital: hospital || req.user.name,
      contact: contact || req.user.phone,
      urgency: urgency || 'normal',
      requiredDate: requiredDate ? new Date(requiredDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: notes || '',
      status: 'pending', // pending, processing, fulfilled, cancelled
      donorId: null,
      fulfilledBy: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('blood_requests').insertOne(request);
    const newRequest = await db.collection('blood_requests').findOne({ _id: result.insertedId });

    // Emit socket event
    io.emit('newBloodRequest', newRequest);

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      request: newRequest
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create blood request' });
  }
});

// Get hospital's own requests
app.get('/api/hospital/my-requests', auth, authorize('hospital'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { hospitalId: req.userId };
    if (status) filter.status = status;

    const requests = await db.collection('blood_requests')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Get donor details if fulfilled
    const requestsWithDetails = await Promise.all(requests.map(async (request) => {
      if (request.donorId) {
        const donor = await db.collection('users').findOne(
          { _id: new ObjectId(request.donorId) },
          { projection: { name: 1, email: 1, phone: 1, bloodGroup: 1, profileImage: 1 } }
        );
        request.donor = donor;
      }
      return request;
    }));

    res.json({
      success: true,
      requests: requestsWithDetails
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Hospital updates request status
app.put('/api/hospital/request/:id', auth, authorize('hospital'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const request = await db.collection('blood_requests').findOne({ 
      _id: new ObjectId(id),
      hospitalId: req.userId
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or unauthorized' });
    }

    const updateData = {
      status,
      notes: notes || request.notes,
      updatedAt: new Date()
    };

    await db.collection('blood_requests').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedRequest = await db.collection('blood_requests').findOne({ 
      _id: new ObjectId(id) 
    });

    io.emit('requestUpdated', updatedRequest);

    res.json({
      success: true,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Donor fulfills a blood request
app.put('/api/hospital/request/:id/fulfill', auth, authorize('donor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.body;

    const request = await db.collection('blood_requests').findOne({ 
      _id: new ObjectId(id),
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or already fulfilled' });
    }

    // Check if donor has enough blood in their blood bank
    if (bloodBankId) {
      const bloodBank = await db.collection('blood_banks').findOne({ 
        _id: new ObjectId(bloodBankId) 
      });
      if (!bloodBank) {
        return res.status(404).json({ error: 'Blood bank not found' });
      }

      const currentStock = bloodBank.bloodGroups[request.bloodGroup] || 0;
      if (currentStock < request.quantity) {
        return res.status(400).json({ 
          error: 'Insufficient blood stock',
          available: currentStock,
          required: request.quantity
        });
      }

      // Deduct from blood bank
      await db.collection('blood_banks').updateOne(
        { _id: new ObjectId(bloodBankId) },
        { 
          $set: { 
            [`bloodGroups.${request.bloodGroup}`]: currentStock - request.quantity,
            updatedAt: new Date()
          } 
        }
      );
    }

    // Update request
    await db.collection('blood_requests').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'fulfilled',
          donorId: req.userId,
          fulfilledBy: req.userId,
          fulfilledAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Update donor's donation count
    await db.collection('users').updateOne(
      { _id: req.userId },
      { 
        $inc: { donationCount: 1 },
        $set: { lastDonation: new Date() }
      }
    );

    const updatedRequest = await db.collection('blood_requests').findOne({ 
      _id: new ObjectId(id) 
    });

    io.emit('requestFulfilled', updatedRequest);

    res.json({
      success: true,
      message: 'Blood request fulfilled successfully! You saved a life ❤️',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Fulfill request error:', error);
    res.status(500).json({ error: 'Failed to fulfill request' });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all users (Admin only)
app.get('/api/admin/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await db.collection('users')
      .find(filter, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      total: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user (Admin only)
app.put('/api/admin/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, bloodGroup, age, address, isActive, isVerified } = req.body;

    const updateData = {
      name,
      email,
      role,
      phone,
      bloodGroup,
      age: parseInt(age),
      address,
      isActive,
      isVerified,
      updatedAt: new Date()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (Admin only)
app.delete('/api/admin/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.collection('users').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all blood banks (Admin only)
app.get('/api/admin/blood-banks', auth, authorize('admin'), async (req, res) => {
  try {
    const bloodBanks = await db.collection('blood_banks')
      .find()
      .sort({ name: 1 })
      .toArray();

    res.json({
      success: true,
      bloodBanks
    });
  } catch (error) {
    console.error('Get blood banks error:', error);
    res.status(500).json({ error: 'Failed to get blood banks' });
  }
});

// Create blood bank (Admin only)
app.post('/api/admin/blood-banks', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, address, latitude, longitude, bloodGroups, contact, email, workingHours } = req.body;

    const newBloodBank = {
      name,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude) || 72.8777, parseFloat(latitude) || 19.0760]
      },
      bloodGroups: bloodGroups || {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
        'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
      },
      contact,
      email,
      workingHours: workingHours || '9:00 AM - 6:00 PM',
      createdAt: new Date()
    };

    const result = await db.collection('blood_banks').insertOne(newBloodBank);
    const createdBank = await db.collection('blood_banks').findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      bloodBank: createdBank
    });
  } catch (error) {
    console.error('Create blood bank error:', error);
    res.status(500).json({ error: 'Failed to create blood bank' });
  }
});

// Update blood bank (Admin only)
app.put('/api/admin/blood-banks/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, bloodGroups, contact, email, workingHours } = req.body;

    const updateData = {
      name,
      address,
      bloodGroups,
      contact,
      email,
      workingHours,
      updatedAt: new Date()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const result = await db.collection('blood_banks').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Blood bank not found' });
    }

    const updatedBank = await db.collection('blood_banks').findOne({ _id: new ObjectId(id) });

    res.json({
      success: true,
      bloodBank: updatedBank
    });
  } catch (error) {
    console.error('Update blood bank error:', error);
    res.status(500).json({ error: 'Failed to update blood bank' });
  }
});

// Delete blood bank (Admin only)
app.delete('/api/admin/blood-banks/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.collection('blood_banks').deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Blood bank not found' });
    }

    res.json({
      success: true,
      message: 'Blood bank deleted successfully'
    });
  } catch (error) {
    console.error('Delete blood bank error:', error);
    res.status(500).json({ error: 'Failed to delete blood bank' });
  }
});

// Get all blood requests (Admin only)
app.get('/api/admin/requests', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, bloodGroup, urgency } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (urgency) filter.urgency = urgency;

    const requests = await db.collection('blood_requests')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Get donor and hospital details
    const requestsWithDetails = await Promise.all(requests.map(async (request) => {
      if (request.donorId) {
        const donor = await db.collection('users').findOne(
          { _id: new ObjectId(request.donorId) },
          { projection: { name: 1, email: 1, phone: 1, bloodGroup: 1 } }
        );
        request.donor = donor;
      }
      const hospital = await db.collection('users').findOne(
        { _id: new ObjectId(request.hospitalId) },
        { projection: { name: 1, email: 1, phone: 1 } }
      );
      request.hospital = hospital;
      return request;
    }));

    res.json({
      success: true,
      total: requestsWithDetails.length,
      requests: requestsWithDetails
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Get all donations (Admin only)
app.get('/api/admin/donations', auth, authorize('admin'), async (req, res) => {
  try {
    const donations = await db.collection('donations')
      .find()
      .sort({ donationDate: -1 })
      .toArray();

    // Get donor details
    const donationsWithDetails = await Promise.all(donations.map(async (donation) => {
      const donor = await db.collection('users').findOne(
        { _id: new ObjectId(donation.donorId) },
        { projection: { name: 1, email: 1, phone: 1, bloodGroup: 1 } }
      );
      donation.donor = donor;
      return donation;
    }));

    res.json({
      success: true,
      total: donationsWithDetails.length,
      donations: donationsWithDetails
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Failed to get donations' });
  }
});

// Admin statistics
app.get('/api/admin/statistics', auth, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await db.collection('users').countDocuments();
    const totalDonors = await db.collection('users').countDocuments({ role: 'donor' });
    const totalHospitals = await db.collection('users').countDocuments({ role: 'hospital' });
    const totalBloodBanks = await db.collection('blood_banks').countDocuments();
    const totalRequests = await db.collection('blood_requests').countDocuments();
    const pendingRequests = await db.collection('blood_requests').countDocuments({ status: 'pending' });
    const fulfilledRequests = await db.collection('blood_requests').countDocuments({ status: 'fulfilled' });
    const totalDonations = await db.collection('donations').countDocuments();

    // Blood group distribution
    const bloodGroupDistribution = await db.collection('users').aggregate([
      { $match: { role: 'donor' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
    ]).toArray();

    // Monthly donations
    const monthlyDonations = await db.collection('donations').aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]).toArray();

    // Recent activities
    const recentActivities = await db.collection('donations')
      .find()
      .sort({ donationDate: -1 })
      .limit(10)
      .toArray();

    res.json({
      success: true,
      statistics: {
        users: {
          total: totalUsers,
          donors: totalDonors,
          hospitals: totalHospitals
        },
        bloodBanks: totalBloodBanks,
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          fulfilled: fulfilledRequests
        },
        donations: totalDonations,
        bloodGroupDistribution,
        monthlyDonations,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Admin statistics error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// ==================== BLOOD BANK PUBLIC ROUTES ====================

// Get blood banks (Public - all authenticated users)
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

// ==================== MESSAGES/CHAT ROUTES ====================

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
          'user.role': 1,
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

// ==================== SOCKET.IO ====================

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

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

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🩸 Blood Donation API Server`);
    console.log(`📍 Running on: http://localhost:${PORT}`);
    console.log(`📊 Database: ${DB_NAME}`);
    console.log(`📸 Image hosting: ${process.env.IMGBB_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`\n👤 Default Admin: admin@blood.com / admin123`);
    console.log(`📋 API Documentation: http://localhost:${PORT}\n`);
  });
});

process.on('SIGINT', async () => {
  await client.close();
  console.log('\nMongoDB connection closed');
  process.exit(0);
});