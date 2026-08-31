const mongoose = require('mongoose');

const connectorSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Type1', 'Type2', 'CCS1', 'CCS2', 'CHAdeMO', 'Tesla', 'GB/T'],
    required: true,
  },
  count: {
    type: Number,
    required: true,
    min: 1,
  },
  power: {
    type: Number,
    required: true,
    min: 0,
  },
});

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere',
    },
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
  },
  connectors: [connectorSchema],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  operatingHours: {
    open: String,
    close: String,
  },
  pricing: {
    type: Number,
    default: 0,
    min: 0,
  },
  amenities: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

stationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Station', stationSchema);