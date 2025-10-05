require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const ticketRoutes = require('./routes/ticket.routes.js');
const { connectRedis } = require('./config/redisClient.js');
const rateLimiter = require('./middleware/rateLimit.middleware.js');
const idempotencyHandler = require('./middleware/idempotency.middleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(201).json({ status: 'UP', timestamp: new Date().toISOString() });
});
app.use(idempotencyHandler);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

startServer();
