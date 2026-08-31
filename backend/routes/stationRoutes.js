const express = require('express');
const router = express.Router();
const {
  getStations,
  getStation,
  getStationsByCity,
  createStation,
  updateStation,
  deleteStation,
} = require('../controllers/stationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getStations);
router.get('/city/:city', getStationsByCity);
router.get('/:id', getStation);
router.post('/', protect, authorize('station_owner', 'admin'), createStation);
router.put('/:id', protect, updateStation);
router.delete('/:id', protect, deleteStation);

module.exports = router;