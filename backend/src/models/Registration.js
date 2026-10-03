const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    ticketCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    team: {
      isTeam: { type: Boolean, default: false },
      teamName: { type: String, trim: true },
      members: [
        {
          name: String,
          email: String,
          phone: String,
          rollNo: String,
        },
      ],
    },
    customResponses: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    paymentStatus: {
      type: String,
      enum: ['free', 'pending', 'paid', 'failed', 'refunded'],
      default: 'free',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    qrCode: {
      type: String, // Data URI base64 or secure validation string
    },
    status: {
      type: String,
      enum: ['registered', 'waitlisted', 'attended', 'cancelled'],
      default: 'registered',
      index: true,
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active registrations by the same user for the same event
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

const bindModel = require('./modelFactory');
module.exports = bindModel(mongoose.model('Registration', registrationSchema), 'registrations');
