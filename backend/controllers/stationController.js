const Station = require('../models/Station');
const Booking = require('../models/Booking');

// ==================== GET STATIONS ====================

// @desc    Get all stations with filters
// @route   GET /api/stations
// @access  Public
const getStations = async (req, res) => {
  try {
    const { lat, lng, radiusKm = 10, connectorType, q } = req.query;
    
    let query = { isActive: true };
    
    if (q) {
      query.name = { $regex: q, $options: 'i' };
    }
    
    if (connectorType) {
      query['connectors.type'] = connectorType;
    }
    
    let stations;
    
    if (lat && lng) {
      stations = await Station.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: parseFloat(radiusKm) * 1000,
          },
        },
      }).populate('owner', 'name email');
    } else {
      stations = await Station.find(query).populate('owner', 'name email');
    }
    
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stations by city
// @route   GET /api/stations/city/:city
// @access  Public
const getStationsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const stations = await Station.find({
      'address.city': { $regex: city, $options: 'i' },
      isActive: true
    }).populate('owner', 'name email');
    
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single station
// @route   GET /api/stations/:id
// @access  Public
const getStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id).populate('owner', 'name email');
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    res.json(station);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== CREATE STATION ====================

// @desc    Create station
// @route   POST /api/stations
// @access  Private (station_owner or admin)
const createStation = async (req, res) => {
  try {
    const { 
      name, location, address, connectors, 
      operatingHours, pricing, amenities 
    } = req.body;

    // Validate required fields
    if (!name || !location || !address || !connectors || connectors.length === 0) {
      return res.status(400).json({ 
        message: 'Name, location, address, and at least one connector are required' 
      });
    }

    // Validate coordinates
    if (!location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ 
        message: 'Valid coordinates [longitude, latitude] are required' 
      });
    }

    const station = await Station.create({
      name,
      location,
      address,
      connectors,
      operatingHours: operatingHours || { open: '06:00', close: '23:00' },
      pricing: pricing || 0,
      amenities: amenities || [],
      owner: req.user._id,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Station created successfully',
      station
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== UPDATE STATION ====================

// @desc    Update station
// @route   PUT /api/stations/:id
// @access  Private (owner or admin)
const updateStation = async (req, res) => {
  try {
    let station = await Station.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    // ROLE-BASED ACCESS: Check ownership or admin role
    if (station.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to update this station',
        role: req.user.role,
        requiredRole: 'station_owner or admin'
      });
    }
    
    // Prevent updating owner field (security)
    delete req.body.owner;
    
    station = await Station.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Station updated successfully',
      station
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DELETE STATION ====================

// @desc    Delete station
// @route   DELETE /api/stations/:id
// @access  Private (owner or admin)
const deleteStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    // ROLE-BASED ACCESS: Check ownership or admin role
    if (station.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to delete this station',
        role: req.user.role,
        requiredRole: 'station_owner or admin'
      });
    }
    
    // Check if there are active bookings for this station
    const activeBookings = await Booking.find({
      station: req.params.id,
      status: { $in: ['pending', 'active'] }
    });
    
    if (activeBookings.length > 0) {
      return res.status(409).json({ 
        message: 'Cannot delete station with active bookings',
        activeBookings: activeBookings.length
      });
    }
    
    // Hard delete
    await station.deleteOne();
    
    res.json({
      success: true,
      message: 'Station deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== SOFT DELETE (Deactivate) ====================

// @desc    Soft delete station (deactivate)
// @route   PATCH /api/stations/:id/deactivate
// @access  Private (owner or admin)
const deactivateStation = async (req, res) => {
  try {
    let station = await Station.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    // ROLE-BASED ACCESS
    if (station.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to deactivate this station'
      });
    }
    
    station.isActive = false;
    await station.save();
    
    res.json({
      success: true,
      message: 'Station deactivated successfully',
      station
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== REACTIVATE STATION ====================

// @desc    Reactivate station
// @route   PATCH /api/stations/:id/reactivate
// @access  Private (owner or admin)
const reactivateStation = async (req, res) => {
  try {
    let station = await Station.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    // ROLE-BASED ACCESS
    if (station.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to reactivate this station'
      });
    }
    
    station.isActive = true;
    await station.save();
    
    res.json({
      success: true,
      message: 'Station reactivated successfully',
      station
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== GET MY STATIONS ====================

// @desc    Get stations owned by the current user
// @route   GET /api/stations/my-stations
// @access  Private (station_owner or admin)
const getMyStations = async (req, res) => {
  try {
    const stations = await Station.find({
      owner: req.user._id
    }).populate('owner', 'name email');
    
    res.json({
      success: true,
      count: stations.length,
      stations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStations,
  getStationsByCity,
  getStation,
  createStation,
  updateStation,
  deleteStation,
  deactivateStation,
  reactivateStation,
  getMyStations
};