const express = require('express');
const router = express.Router();
const {
  getAvailability,
  createBooking,
  getMyBookings,
  rescheduleBooking,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.get('/availability', protect, getAvailability);
router.post('/', protect, createBooking);
router.get('/me', protect, getMyBookings);
router.patch('/:id', protect, rescheduleBooking);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;