const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment,
} = require('../controllers/ticket.controller.js');
const { protect, authorize } = require('../middleware/auth.middleware.js');
const rateLimiter = require('../middleware/rateLimit.middleware.js');

router
  .route('/')
  .post(protect, rateLimiter, createTicket)
  .get(protect, getTickets);

router
  .route('/:id')
  .get(protect, getTicketById)
  .patch(protect, authorize('agent', 'admin'), updateTicket);

router.route('/:id/comments').post(protect, rateLimiter, addComment);

module.exports = router;
