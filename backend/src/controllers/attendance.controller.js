const Attendance = require('../models/Attendance');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const AuditLog = require('../models/AuditLog');

// @desc    Scan QR Code and mark attendance
// @route   POST /api/attendance/scan
// @access  Volunteer / Faculty / Admin
exports.scanQRCode = async (req, res, next) => {
  try {
    const { qrData, ticketCode, method, notes } = req.body;

    let targetTicketCode = ticketCode;

    if (qrData) {
      try {
        const parsed = typeof qrData === 'object' ? qrData : JSON.parse(qrData);
        targetTicketCode = parsed.ticketCode || targetTicketCode;
      } catch (e) {
        // Raw string might be the ticket code
        targetTicketCode = qrData;
      }
    }

    if (!targetTicketCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR payload. Ticket code not detected.',
      });
    }

    const registration = await Registration.findOne({ ticketCode: targetTicketCode })
      .populate('user', 'name email department year phone')
      .populate('event', 'title startDate endDate venue category status');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Ticket! No matching registration found for TIHS records.',
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This registration ticket has been CANCELLED.',
      });
    }

    if (registration.status === 'waitlisted') {
      return res.status(400).json({
        success: false,
        message: 'Student is currently WAITLISTED. Seat not confirmed yet.',
      });
    }

    // Check anti-duplicate scan
    const existingAttendance = await Attendance.findOne({
      registration: registration._id,
    }).populate('scannedBy', 'name role');

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        message: `⚠️ ALREADY SCANNED! Entry was already marked on ${new Date(existingAttendance.scannedAt).toLocaleTimeString('en-IN')} by ${existingAttendance.scannedBy?.name || 'Volunteer'}.`,
        attendance: existingAttendance,
        student: registration.user,
        event: registration.event,
      });
    }

    // Mark attendance
    const attendance = await Attendance.create({
      registration: registration._id,
      user: registration.user._id,
      event: registration.event._id,
      scannedBy: req.user._id,
      method: method || 'qr_scan',
      notes: notes || 'Verified entrance at gate',
    });

    registration.status = 'attended';
    await registration.save();

    const totalAttended = await Attendance.countDocuments({ event: registration.event._id });

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'ATTENDANCE_SCANNED',
      details: `Scanned entry for ${registration.user.name} (${targetTicketCode}) in "${registration.event.title}"`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `✅ Verified! Welcome, ${registration.user.name}.`,
      student: registration.user,
      event: registration.event,
      attendance,
      totalAttended,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public ticket lookup — verify QR data without marking attendance
// @route   POST /api/attendance/verify-public
// @access  Public (no auth required)
exports.verifyTicketPublic = async (req, res, next) => {
  try {
    const { qrData, ticketCode } = req.body;

    let targetTicketCode = ticketCode;
    if (qrData) {
      try {
        const parsed = typeof qrData === 'object' ? qrData : JSON.parse(qrData);
        targetTicketCode = parsed.ticketCode || targetTicketCode;
      } catch {
        targetTicketCode = qrData;
      }
    }

    if (!targetTicketCode) {
      return res.status(400).json({ success: false, message: 'No ticket code provided.' });
    }

    const registration = await Registration.findOne({ ticketCode: targetTicketCode })
      .populate('user', 'name email department year')
      .populate('event', 'title startDate venue category status banner');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found. This QR code does not match any TIHS registration.',
      });
    }

    const alreadyAttended = await Attendance.findOne({ registration: registration._id });

    return res.status(200).json({
      success: true,
      ticket: {
        ticketCode: registration.ticketCode,
        status: registration.status,
        paymentStatus: registration.paymentStatus,
      },
      student: {
        name: registration.user?.name,
        email: registration.user?.email,
        department: registration.user?.department,
        year: registration.user?.year,
      },
      event: {
        title: registration.event?.title,
        startDate: registration.event?.startDate,
        venue: registration.event?.venue,
        category: registration.event?.category,
        banner: registration.event?.banner,
      },
      checkedIn: !!alreadyAttended,
      checkedInAt: alreadyAttended?.scannedAt || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records and stats for an event
// @route   GET /api/attendance/event/:id
// @access  Volunteer / Faculty / Admin
exports.getEventAttendance = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    const attendances = await Attendance.find({ event: eventId })
      .populate('user', 'name email department year phone')
      .populate('scannedBy', 'name email role')
      .populate('registration', 'ticketCode paymentStatus')
      .sort({ scannedAt: -1 });

    const totalRegistrations = await Registration.countDocuments({
      event: eventId,
      status: { $in: ['registered', 'attended'] },
    });

    res.status(200).json({
      success: true,
      count: attendances.length,
      totalRegistrations,
      turnoutRate: totalRegistrations > 0 ? Math.round((attendances.length / totalRegistrations) * 100) : 0,
      data: attendances,
    });
  } catch (error) {
    next(error);
  }
};
