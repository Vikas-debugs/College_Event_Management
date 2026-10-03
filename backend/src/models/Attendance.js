const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
      unique: true, // Anti-duplicate scan: exactly one entry per registration
      index: true,
    },
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
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    method: {
      type: String,
      enum: ['qr_scan', 'manual_override'],
      default: 'qr_scan',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const bindModel = require('./modelFactory');
module.exports = bindModel(mongoose.model('Attendance', attendanceSchema), 'attendances');
