const express = require('express');
const router = express.Router();
const {
  getStations,
  getStationsByCity,
  getStation,
  createStation,
  updateStation,
  deleteStation,
  deactivateStation,
  reactivateStation,
  getMyStations,
} = require('../controllers/stationController');
const { protect, authorize } = require('../middleware/auth');

// ==================== PUBLIC ROUTES ====================
router.get('/', getStations);
router.get('/city/:city', getStationsByCity);
router.get('/:id', getStation);

// ==================== PROTECTED ROUTES ====================

// Get stations owned by current user
router.get('/my-stations', protect, authorize('station_owner', 'admin'), getMyStations);

// Create station (owner or admin only)
router.post('/', protect, authorize('station_owner', 'admin'), createStation);

// Update station (owner or admin)
router.put('/:id', protect, updateStation);

// Delete station (owner or admin)
router.delete('/:id', protect, deleteStation);

// Soft delete (deactivate) station (owner or admin)
router.patch('/:id/deactivate', protect, deactivateStation);

// Reactivate station (owner or admin)
router.patch('/:id/reactivate', protect, reactivateStation);

module.exports = router;