const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
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
    certificateId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    certUrl: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple certificates for the same user on the same event
certificateSchema.index({ user: 1, event: 1 }, { unique: true });

const bindModel = require('./modelFactory');
module.exports = bindModel(mongoose.model('Certificate', certificateSchema), 'certificates');
