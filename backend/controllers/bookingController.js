const Booking = require('../models/Booking');
const Station = require('../models/Station');

const getAvailability = async (req, res) => {
  try {
    const { station, connectorType, date } = req.query;
    
    if (!station || !connectorType || !date) {
      return res.status(400).json({ 
        message: 'Station, connectorType, and date are required' 
      });
    }
    
    const stationData = await Station.findById(station);
    if (!stationData) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    const connector = stationData.connectors.find(c => c.type === connectorType);
    if (!connector) {
      return res.status(404).json({ 
        message: 'Connector type not available at this station' 
      });
    }
    
    const totalBays = connector.count;
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const bookings = await Booking.find({
      station,
      connectorType,
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['pending', 'active'] },
    });
    
    const availability = [];
    for (let hour = 8; hour <= 22; hour++) {
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(selectedDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      
      const overlapping = bookings.filter(b => {
        return b.startTime < slotEnd && b.endTime > slotStart;
      });
      
      const available = totalBays - overlapping.length;
      availability.push({
        hour,
        available: Math.max(0, available),
        total: totalBays,
        isFull: available <= 0,
      });
    }
    
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { station, connectorType, startTime, endTime } = req.body;
    
    if (!station || !connectorType || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Station, connectorType, startTime, and endTime are required' 
      });
    }
    
    const stationData = await Station.findById(station);
    if (!stationData) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    const connector = stationData.connectors.find(c => c.type === connectorType);
    if (!connector) {
      return res.status(404).json({ message: 'Connector type not available' });
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    
    const existingBookings = await Booking.find({
      station,
      connectorType,
      status: { $in: ['pending', 'active'] },
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } },
      ],
    });
    
    if (existingBookings.length >= connector.count) {
      return res.status(409).json({ 
        message: 'No available bays for this time slot. All bays are booked.' 
      });
    }
    
    const booking = await Booking.create({
      user: req.user._id,
      station,
      connectorType,
      startTime: start,
      endTime: end,
    });
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('station', 'name location address')
      .sort({ startTime: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rescheduleBooking = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot reschedule this booking' });
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    
    const stationData = await Station.findById(booking.station);
    const connector = stationData.connectors.find(c => c.type === booking.connectorType);
    
    const existingBookings = await Booking.find({
      station: booking.station,
      connectorType: booking.connectorType,
      status: { $in: ['pending', 'active'] },
      _id: { $ne: booking._id },
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } },
      ],
    });
    
    if (existingBookings.length >= connector.count) {
      return res.status(409).json({ 
        message: 'No available bays for this time slot' 
      });
    }
    
    booking.startTime = start;
    booking.endTime = end;
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailability,
  createBooking,
  getMyBookings,
  rescheduleBooking,
  cancelBooking,
};