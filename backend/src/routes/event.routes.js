const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
  bulkImportEvents,
} = require('../controllers/event.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

const { registerForEvent } = require('../controllers/registration.controller');

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post('/:id/register', protect, registerForEvent);
router.post('/', protect, authorize('faculty', 'admin'), upload.single('banner'), createEvent);
router.put('/:id', protect, authorize('faculty', 'admin'), upload.single('banner'), updateEvent);
router.delete('/:id', protect, authorize('faculty', 'admin'), deleteEvent);

router.patch('/:id/approve', protect, authorize('admin'), approveEvent);
router.patch('/:id/reject', protect, authorize('admin'), rejectEvent);
router.post('/bulk-import', protect, authorize('admin'), bulkImportEvents);

module.exports = router;
