const express = require('express');
const router = express.Router();
const { scanQRCode, getEventAttendance, verifyTicketPublic } = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public — anyone can look up ticket details (read-only, does NOT mark attendance)
router.post('/verify-public', verifyTicketPublic);

// Volunteer and Admin can scan QR (marks attendance)
router.post('/scan', protect, authorize('volunteer', 'faculty', 'admin'), scanQRCode);
router.get('/event/:id', protect, authorize('faculty', 'admin', 'volunteer'), getEventAttendance);

module.exports = router;

