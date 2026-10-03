const Registration = require('../models/Registration');
const Event = require('../models/Event');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { generateQRCode } = require('../services/qrService');
const emailService = require('../services/emailService');

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Protected (Student/Faculty/User)
exports.registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { team, customResponses, paymentId, paymentStatus } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Registrations are currently not open for this event.',
      });
    }

    // Check duplicate active registration
    const existingRegistration = await Registration.findOne({
      user: req.user._id,
      event: event._id,
      status: { $in: ['registered', 'waitlisted', 'attended'] },
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event.',
        registration: existingRegistration,
      });
    }

    // Count existing active registrations to determine capacity vs waitlist
    const activeCount = await Registration.countDocuments({
      event: event._id,
      status: { $in: ['registered', 'attended'] },
    });

    const isWaitlisted = activeCount >= event.capacity;
    const ticketCode = `TIHS-${event.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Generate QR payload — JSON with embedded verify URL
    // When scanned by volunteer scanner → reads ticketCode field
    // When scanned by phone camera → browser opens /verify-ticket?t=<code>
    const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
    const verifyUrl = `${appBaseUrl}/verify-ticket?t=${encodeURIComponent(ticketCode)}`;

    const qrPayload = JSON.stringify({
      ticketCode,
      userId: String(req.user._id),
      eventId: String(event._id),
      userName: req.user.name,
      eventTitle: event.title,
      verifyUrl,
    });

    const qrCodeDataUrl = await generateQRCode(qrPayload);

    const registration = await Registration.create({
      user: req.user._id,
      event: event._id,
      ticketCode,
      team: team || { isTeam: false, members: [] },
      customResponses: customResponses || {},
      paymentStatus: event.fee > 0 ? (paymentStatus || 'pending') : 'free',
      payment: paymentId || undefined,
      qrCode: qrCodeDataUrl,
      status: isWaitlisted ? 'waitlisted' : 'registered',
    });

    // Send confirmation email (non-blocking safety)
    try {
      await emailService.sendRegistrationConfirmation(
        req.user,
        event,
        qrCodeDataUrl,
        ticketCode,
        isWaitlisted ? 'Waitlisted' : event.fee > 0 ? 'Paid' : 'Confirmed Free'
      );
    } catch (emailErr) {
      console.error('[registration.controller] Confirmation email warning:', emailErr.message);
    }

    // In-app Notification
    await Notification.create({
      user: req.user._id,
      title: isWaitlisted ? 'Event Waitlisted' : 'Registration Confirmed!',
      message: isWaitlisted
        ? `You are on the waitlist for "${event.title}". We'll notify you if a slot frees up.`
        : `Your pass for "${event.title}" is confirmed! Ticket Code: ${ticketCode}`,
      type: 'event',
      link: `/student/dashboard`,
    });

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: isWaitlisted ? 'EVENT_WAITLISTED' : 'EVENT_REGISTERED',
      details: `Registered for "${event.title}" with ticket ${ticketCode}`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: isWaitlisted
        ? 'Event capacity reached. You have been added to the priority waitlist!'
        : 'Registration successful! Digital QR ticket generated.',
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user registrations
// @route   GET /api/registrations/me
// @access  Protected
exports.getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('event')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a registration
// @route   DELETE /api/registrations/:id
// @access  Protected
exports.cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('event');
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (req.user.role !== 'admin' && registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this registration' });
    }

    registration.status = 'cancelled';
    registration.cancellationReason = req.body.reason || 'User cancelled registration';
    await registration.save();

    // Check if any waitlisted user can be promoted
    const waitlistedReg = await Registration.findOne({
      event: registration.event._id,
      status: 'waitlisted',
    }).sort({ createdAt: 1 }).populate('user', 'name email');

    if (waitlistedReg) {
      waitlistedReg.status = 'registered';
      await waitlistedReg.save();

      await Notification.create({
        user: waitlistedReg.user._id,
        title: 'Spot Confirmed from Waitlist!',
        message: `Great news! A slot opened up and your registration for "${registration.event.title}" is now confirmed!`,
        type: 'event',
        link: '/student/dashboard',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration successfully cancelled',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations for an event
// @route   GET /api/registrations/event/:id
// @access  Faculty / Admin
exports.getEventRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
      .populate('user', 'name email department year phone')
      .populate('payment')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};
