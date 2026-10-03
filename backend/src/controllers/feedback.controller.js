const Feedback = require('../models/Feedback');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const AuditLog = require('../models/AuditLog');

// @desc    Submit Feedback for an event
// @route   POST /api/feedback
// @access  Protected (Student/Attendee)
exports.createFeedback = async (req, res, next) => {
  try {
    const { eventId, rating, comment } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user was registered/attended
    const registration = await Registration.findOne({
      user: req.user._id,
      event: eventId,
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: 'Only registered students/attendees can submit feedback for this event.',
      });
    }

    // Check if feedback already submitted
    const existingFeedback = await Feedback.findOne({
      user: req.user._id,
      event: eventId,
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this event.',
      });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      event: eventId,
      rating: Number(rating),
      comment,
    });

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'FEEDBACK_SUBMITTED',
      details: `Submitted ${rating}-star feedback for "${event.title}"`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! It helps us improve TIHS events.',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Feedback for an event
// @route   GET /api/feedback/event/:id
// @access  Public / Faculty / Admin
exports.getEventFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.id })
      .populate('user', 'name department year')
      .sort({ createdAt: -1 });

    const total = feedbacks.length;
    const avgRating = total > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / total).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      count: total,
      averageRating: Number(avgRating),
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
