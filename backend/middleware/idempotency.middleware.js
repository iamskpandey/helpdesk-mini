const { client } = require('../config/redisClient');

const idempotencyHandler = async (req, res, next) => {
  if (req.method !== 'POST') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    return next();
  }

  const redisKey = `idempotency:${idempotencyKey}`;

  try {
    const cachedResponse = await client.get(redisKey);

    if (cachedResponse) {
      const parsedResponse = JSON.parse(cachedResponse);
      return res.status(parsedResponse.statusCode).json(parsedResponse.body);
    }

    const originalJson = res.json;
    const originalSend = res.send;

    res.send = res.json = (body) => {
      const responseToCache = {
        statusCode: res.statusCode,
        body: body,
      };

      client.set(redisKey, JSON.stringify(responseToCache), {
        EX: 24 * 60 * 60,
      });

      res.send = originalSend;
      res.json = originalJson;
      return res.json(body);
    };

    next();
  } catch (error) {
    console.error('Idempotency middleware error:', error);
    next();
  }
};

module.exports = idempotencyHandler;
