const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  fieldType: { type: String, enum: ['text', 'number', 'select', 'checkbox'], default: 'text' },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
      maxlength: [150, 'Title cannot be more than 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please add an event description'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Cultural', 'Technical', 'Sports', 'Workshop', 'Fine Arts'],
    },
    department: {
      type: String,
      enum: ['All', 'BBA', 'BCA', 'B.Com', 'BFA', 'BAJMC', 'B.Ed', 'B.Sc'],
      default: 'All',
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide event start date & time'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide event end date & time'],
    },
    venue: {
      type: String,
      required: [true, 'Please provide the campus venue / auditorium'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify maximum capacity'],
      min: [1, 'Capacity must be at least 1'],
      default: 100,
    },
    fee: {
      type: Number,
      required: [true, 'Please specify fee amount (0 for Free)'],
      min: [0, 'Fee cannot be negative'],
      default: 0,
    },
    banner: {
      type: String,
      default: '/assets/images/campus-hero.webp',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    rules: {
      type: String,
      default: 'Standard TIHS campus event guidelines and ID card mandatory.',
    },
    prizes: {
      type: String,
      default: 'Certificates of Merit & Cash Prizes for Top 3 winners.',
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'published', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    rejectionReason: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    customFields: [customFieldSchema],
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for remaining capacity calculation or registration population
eventSchema.virtual('registrations', {
  ref: 'Registration',
  localField: '_id',
  foreignField: 'event',
  justOne: false,
});

const bindModel = require('./modelFactory');
module.exports = bindModel(mongoose.model('Event', eventSchema), 'events');
