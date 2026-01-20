import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        guideRequestStatus: user.guideRequestStatus,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    },
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide all fields' });
    }

    const emailNormalized = String(email).toLowerCase().trim();
    const userExists = await User.findOne({ email: emailNormalized });
    if (userExists) {
      return res.status(409).json({ status: 'error', message: 'Email already in use' });
    }

    // Validate role if provided, else default to 'basic'
    const userRole = (role && ['basic', 'guide'].includes(role)) ? role : 'basic';

    const user = await User.create({
      name,
      email: emailNormalized,
      passwordHash: password,
      role: userRole
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    if (error?.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'Email already in use' });
    }
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    const emailNormalized = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized });

    if (user && (await user.matchPassword(password))) {
      user.lastLoginAt = Date.now();
      await user.save();

      sendTokenResponse(user, 200, res);
      return;
    }
    return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ status: 'error', message: 'Not authorized' });
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          guideRequestStatus: user.guideRequestStatus,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const requestGuideRole = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    if (user.role === 'guide' || user.role === 'admin') {
        return res.status(400).json({ status: 'error', message: 'You are already a guide or admin.' });
    }

    if (user.guideRequestStatus === 'pending') {
        return res.status(400).json({ status: 'error', message: 'Request already pending.' });
    }

    user.guideRequestStatus = 'pending';
    await user.save();

    return res.status(200).json({ status: 'success', message: 'Guide role requested successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};
