const Station = require('../models/Station');

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

const createStation = async (req, res) => {
  try {
    const station = await Station.create({
      ...req.body,
      owner: req.user._id,
    });
    res.status(201).json(station);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStation = async (req, res) => {
  try {
    let station = await Station.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    if (station.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this station' });
    }
    
    station = await Station.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(station);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    if (station.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this station' });
    }
    
    await station.deleteOne();
    res.json({ message: 'Station removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStations,
  getStation,
  getStationsByCity,
  createStation,
  updateStation,
  deleteStation,
};