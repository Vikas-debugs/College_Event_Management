const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations,
} = require('../controllers/registration.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/:id/register', protect, registerForEvent);
router.post('/:id', protect, registerForEvent);
router.get('/me', protect, getMyRegistrations);
router.delete('/:id', protect, cancelRegistration);
router.get('/event/:id', protect, authorize('faculty', 'admin'), getEventRegistrations);

module.exports = router;
