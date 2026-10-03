const express = require('express');
const router = express.Router();
const { createFeedback, getEventFeedback } = require('../controllers/feedback.controller');
const { protect } = require('../middleware/auth');

router.post('/', protect, createFeedback);
router.get('/event/:id', getEventFeedback);

module.exports = router;
