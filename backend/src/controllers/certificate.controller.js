const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { generateCertificatePDF } = require('../services/pdfService');
const emailService = require('../services/emailService');

// @desc    Get current user certificates
// @route   GET /api/certificates/me
// @access  Protected
exports.getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate('event')
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single certificate by ID
// @route   GET /api/certificates/:id
// @access  Public
exports.getCertificateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let cert;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      cert = await Certificate.findById(id).populate('user', 'name email department year profilePhoto').populate('event');
    } else {
      cert = await Certificate.findOne({ certificateId: id }).populate('user', 'name email department year profilePhoto').populate('event');
    }

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found or invalid' });
    }

    res.status(200).json({
      success: true,
      data: cert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download certificate PDF
// @route   GET /api/certificates/:id/download
// @access  Public
exports.downloadCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    let cert = await Certificate.findById(id).populate('user', 'name email department profilePhoto').populate('event');

    if (!cert) {
      cert = await Certificate.findOne({ certificateId: id }).populate('user', 'name email department profilePhoto').populate('event');
    }

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const pdfFile = path.join(__dirname, '..', '..', 'uploads', 'certificates', `${cert.certificateId}.pdf`);

    // If PDF doesn't exist on disk, regenerate it on the fly
    if (!fs.existsSync(pdfFile)) {
      await generateCertificatePDF({
        certificateId: cert.certificateId,
        studentName: cert.user?.name || 'TIHS Student',
        eventTitle: cert.event?.title || 'TIHS Event',
        category: cert.event?.category || 'Workshop',
        eventDate: cert.event?.startDate || new Date(),
        department: cert.user?.department || 'TIHS',
        profilePhoto: cert.user?.profilePhoto || null,
      });
    }

    res.download(pdfFile, `TIHS-Certificate-${cert.certificateId}.pdf`);
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk Generate Certificates for Event Attendees
// @route   POST /api/certificates/bulk-generate/:eventId
// @access  Admin
exports.bulkGenerateCertificates = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const attendances = await Attendance.find({ event: eventId }).populate('user', 'name email department profilePhoto');
    const generatedList = [];

    for (const record of attendances) {
      if (!record.user) continue;

      let cert = await Certificate.findOne({ user: record.user._id, event: event._id });
      if (!cert) {
        const certificateId = `TIHS-${event.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const hash = crypto.createHash('sha256').update(`${record.user._id}-${event._id}-${certificateId}`).digest('hex');

        const certResult = await generateCertificatePDF({
          certificateId,
          studentName: record.user.name,
          eventTitle: event.title,
          category: event.category,
          eventDate: event.startDate,
          department: record.user.department,
          profilePhoto: record.user.profilePhoto || null,
        });

        cert = await Certificate.create({
          user: record.user._id,
          event: event._id,
          certificateId,
          certUrl: certResult.relativeUrl,
          hash,
        });

        await emailService.sendCertificateEmail(
          record.user,
          event,
          `https://tihs.edu.in${certResult.relativeUrl}`,
          certificateId
        );
      }
      generatedList.push(cert);
    }

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'BULK_CERTIFICATES_GENERATED',
      details: `Generated ${generatedList.length} certificates for "${event.title}"`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Generated ${generatedList.length} participation certificates!`,
      data: generatedList,
    });
  } catch (error) {
    next(error);
  }
};
