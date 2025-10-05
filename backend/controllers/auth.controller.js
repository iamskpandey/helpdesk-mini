const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: { code: 'FIELD_REQUIRED', message: 'All fields are required' },
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email or username already exists.',
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    const savedUser = await user.save();

    res.status(201).json({
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Internal Server Error' },
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          message: 'Email and password are required',
        },
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      });
    }

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    res.status(200).json({
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Internal Server Error' },
    });
  }
};

module.exports = {
  register,
  login,
};
