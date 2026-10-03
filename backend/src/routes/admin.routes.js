const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserRole,
  toggleBlockUser,
  getAuditLogs,
  updateUser,
  deleteUser,
} = require('../controllers/admin.controller');
const { getAnalytics } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/toggle-block', toggleBlockUser);
router.get('/audit-logs', getAuditLogs);
router.get('/analytics', getAnalytics);

module.exports = router;

