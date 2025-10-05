const { client } = require('../config/redisClient');

const RATE_LIMIT_WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 5;

const rateLimiter = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  try {
    const userId = req.user.id;
    const key = `rate-limit:${userId}`;

    const requestCount = await client.incr(key);

    if (requestCount === 1) {
      await client.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }

    if (requestCount > MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT',
          message: 'Too many requests. Please try again later.',
        },
      });
    }

    next();
  } catch (error) {
    console.error('Error in rate limiter:', error);

    next();
  }
};

module.exports = rateLimiter;
