const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');
const Comment = require('../models/comment.model.js');

const calculateSlaDeadline = (priority) => {
  const now = new Date();
  let hoursToAdd = 48;

  switch (priority) {
    case 'low':
      hoursToAdd = 72;
      break;
    case 'high':
      hoursToAdd = 24;
      break;
    case 'urgent':
      hoursToAdd = 8;
      break;
  }
  return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
};

const createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          message: 'Title and description are required',
        },
      });
    }

    const slaDeadline = calculateSlaDeadline(priority);

    const ticket = new Ticket({
      title,
      description,
      priority: priority || 'medium',
      createdBy: req.user.id,
      slaDeadline,
      timeline: [
        {
          actor: req.user.id,
          action: 'Ticket created',
        },
      ],
    });

    const savedTicket = await ticket.save();

    res.status(201).json(savedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Internal Server Error' },
    });
  }
};

const getTickets = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const searchTerm = req.query.search || '';

    let query = {};

    if (req.user.role === 'user') {
      query.createdBy = req.user.id;
    }

    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i');
      query.$or = [{ title: regex }, { description: regex }];
    }

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email');

    const totalCount = await Ticket.countDocuments(query);

    const next_offset =
      offset + tickets.length < totalCount ? offset + tickets.length : null;

    res.status(200).json({
      items: tickets,
      next_offset,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Internal Server Error' },
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username email',
        },
      });

    if (!ticket) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Ticket not found' },
      });
    }

    if (
      req.user.role === 'user' &&
      ticket.createdBy._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to view this ticket',
        },
      });
    }

    res.status(200).json(ticket);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'Invalid ticket ID format' },
      });
    }
    console.error(error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Internal Server Error' },
    });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { status, assignedTo, priority, version } = req.body;

    if (version === undefined) {
      return res.status(400).json({
        error: {
          code: 'VERSION_REQUIRED',
          message: 'Ticket version is required for updates.',
        },
      });
    }

    const currentTicket = await Ticket.findById(req.params.id);
    if (!currentTicket) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    }

    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, version: version },
      {
        $set: { status, assignedTo, priority },
      },
      { new: true }
    )
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email');

    if (!updatedTicket) {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message:
            'Ticket has been modified by someone else. Please refresh and try again.',
        },
      });
    }

    const timelineEvents = [];
    if (status && currentTicket.status !== status) {
      timelineEvents.push({
        actor: req.user.id,
        action: `Status changed from '${currentTicket.status}' to '${status}'`,
      });
    }
    if (assignedTo && currentTicket.assignedTo?.toString() !== assignedTo) {
      const agent = await User.findById(assignedTo).select('username');
      timelineEvents.push({
        actor: req.user.id,
        action: `Assigned to ${agent.username}`,
      });
    }
    if (priority && currentTicket.priority !== priority) {
      timelineEvents.push({
        actor: req.user.id,
        action: `Priority changed from '${currentTicket.priority}' to '${priority}'`,
      });
    }

    if (timelineEvents.length > 0) {
      updatedTicket.timeline.push(...timelineEvents);
      await updatedTicket.save();
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Internal Server Error' },
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const ticketId = req.params.id;

    if (!text) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          message: 'Comment text is required',
        },
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    }

    const isCreator = ticket.createdBy.toString() === req.user.id.toString();
    const isAgentOrAdmin = ['agent', 'admin'].includes(req.user.role);

    if (!isCreator && !isAgentOrAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to comment on this ticket',
        },
      });
    }

    const comment = new Comment({
      text,
      author: req.user.id,
      ticket: ticketId,
    });
    const savedComment = await comment.save();

    ticket.comments.push(savedComment._id);
    ticket.timeline.push({
      actor: req.user.id,
      action: 'Commented',
    });
    await ticket.save();

    const populatedComment = await savedComment.populate(
      'author',
      'username email'
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Internal Server Error' },
    });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment,
};
