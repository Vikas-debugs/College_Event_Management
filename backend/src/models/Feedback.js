const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide feedback comments'],
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// One feedback per user per event
feedbackSchema.index({ user: 1, event: 1 }, { unique: true });

const bindModel = require('./modelFactory');
module.exports = bindModel(mongoose.model('Feedback', feedbackSchema), 'feedbacks');
