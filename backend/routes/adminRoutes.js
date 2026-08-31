const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getStats, updateUserRole } = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.get('/stats', getStats);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;