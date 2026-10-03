const express = require('express');
const router = express.Router();
const {
  getMyCertificates,
  getCertificateById,
  downloadCertificate,
  bulkGenerateCertificates,
} = require('../controllers/certificate.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/me', protect, getMyCertificates);
router.get('/:id', getCertificateById);
router.get('/:id/download', downloadCertificate);
router.post('/bulk-generate/:eventId', protect, authorize('admin'), bulkGenerateCertificates);

module.exports = router;
