const mongoose = require('mongoose');
const { Schema } = mongoose;

const timelineEventSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['new', 'in_progress', 'resolved', 'closed'],
      default: 'new',
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    timeline: [timelineEventSchema],
    slaDeadline: {
      type: Date,
    },
  },
  {
    timestamps: true,

    versionKey: 'version',
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
