const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Station = require('../models/Station');

dotenv.config();

const indianStations = [
  // Mumbai
  {
    name: 'Bandra West EV Charging Hub',
    location: { type: 'Point', coordinates: [72.8226, 19.0596] },
    address: { street: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 6, power: 150 },
      { type: 'Type2', count: 4, power: 22 }
    ],
    operatingHours: { open: '06:00', close: '23:00' },
    pricing: 0.30,
    amenities: ['cafe', 'wifi', 'restroom'],
    isActive: true,
    rating: 4.5
  },
  {
    name: 'Navi Mumbai EV Station',
    location: { type: 'Point', coordinates: [73.0032, 19.0330] },
    address: { street: 'Vashi', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 4, power: 100 },
      { type: 'CHAdeMO', count: 2, power: 50 }
    ],
    operatingHours: { open: '07:00', close: '22:00' },
    pricing: 0.28,
    amenities: ['wifi', 'shopping'],
    isActive: true,
    rating: 4.2
  },
  {
    name: 'South Mumbai EV Charge',
    location: { type: 'Point', coordinates: [72.8311, 18.9399] },
    address: { street: 'Colaba', city: 'Mumbai', state: 'Maharashtra', pincode: '400005', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 3, power: 150 },
      { type: 'Type2', count: 3, power: 22 }
    ],
    operatingHours: { open: '08:00', close: '22:00' },
    pricing: 0.32,
    amenities: ['cafe', 'wifi'],
    isActive: true,
    rating: 4.3
  },

  // Delhi
  {
    name: 'Connaught Place EV Hub',
    location: { type: 'Point', coordinates: [77.2165, 28.6304] },
    address: { street: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 8, power: 150 },
      { type: 'Type2', count: 6, power: 22 },
      { type: 'Tesla', count: 2, power: 250 }
    ],
    operatingHours: { open: '00:00', close: '23:59' },
    pricing: 0.35,
    amenities: ['cafe', 'wifi', 'restroom', 'shopping'],
    isActive: true,
    rating: 4.7
  },
  {
    name: 'South Delhi Charging Station',
    location: { type: 'Point', coordinates: [77.2143, 28.5534] },
    address: { street: 'Saket', city: 'New Delhi', state: 'Delhi', pincode: '110017', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 5, power: 100 },
      { type: 'Type2', count: 3, power: 22 }
    ],
    operatingHours: { open: '07:00', close: '23:00' },
    pricing: 0.32,
    amenities: ['wifi', 'restaurant'],
    isActive: true,
    rating: 4.4
  },

  // Bangalore
  {
    name: 'Indiranagar EV Charging',
    location: { type: 'Point', coordinates: [77.6403, 12.9784] },
    address: { street: 'Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 6, power: 150 },
      { type: 'Type2', count: 4, power: 22 }
    ],
    operatingHours: { open: '06:00', close: '23:00' },
    pricing: 0.30,
    amenities: ['cafe', 'wifi'],
    isActive: true,
    rating: 4.6
  },
  {
    name: 'Electronic City EV Hub',
    location: { type: 'Point', coordinates: [77.6757, 12.8399] },
    address: { street: 'Electronic City', city: 'Bangalore', state: 'Karnataka', pincode: '560100', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 5, power: 100 },
      { type: 'CHAdeMO', count: 2, power: 50 }
    ],
    operatingHours: { open: '07:00', close: '22:00' },
    pricing: 0.28,
    amenities: ['wifi', 'food court'],
    isActive: true,
    rating: 4.3
  },

  // Chennai
  {
    name: 'T Nagar EV Charging',
    location: { type: 'Point', coordinates: [80.2337, 13.0359] },
    address: { street: 'T Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 4, power: 150 },
      { type: 'Type2', count: 3, power: 22 }
    ],
    operatingHours: { open: '07:00', close: '22:00' },
    pricing: 0.28,
    amenities: ['wifi', 'shopping'],
    isActive: true,
    rating: 4.2
  },

  // Hyderabad
  {
    name: 'Hitech City EV Station',
    location: { type: 'Point', coordinates: [78.3845, 17.4438] },
    address: { street: 'Hitech City', city: 'Hyderabad', state: 'Telangana', pincode: '500081', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 6, power: 150 },
      { type: 'Type2', count: 4, power: 22 }
    ],
    operatingHours: { open: '06:00', close: '23:00' },
    pricing: 0.30,
    amenities: ['cafe', 'wifi', 'restroom'],
    isActive: true,
    rating: 4.5
  },

  // Pune
  {
    name: 'Koregaon Park EV Hub',
    location: { type: 'Point', coordinates: [73.9065, 18.5362] },
    address: { street: 'Koregaon Park', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 4, power: 150 },
      { type: 'Type2', count: 3, power: 22 }
    ],
    operatingHours: { open: '07:00', close: '23:00' },
    pricing: 0.28,
    amenities: ['cafe', 'wifi'],
    isActive: true,
    rating: 4.4
  },

  // Kolkata
  {
    name: 'Park Street EV Charging',
    location: { type: 'Point', coordinates: [88.3515, 22.5517] },
    address: { street: 'Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 4, power: 100 },
      { type: 'Type2', count: 3, power: 22 }
    ],
    operatingHours: { open: '08:00', close: '22:00' },
    pricing: 0.30,
    amenities: ['cafe', 'wifi'],
    isActive: true,
    rating: 4.1
  },

  // Ahmedabad
  {
    name: 'Ahmedabad EV Station',
    location: { type: 'Point', coordinates: [72.5714, 23.0225] },
    address: { street: 'SG Highway', city: 'Ahmedabad', state: 'Gujarat', pincode: '380054', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 4, power: 150 },
      { type: 'Type2', count: 3, power: 22 }
    ],
    operatingHours: { open: '07:00', close: '22:00' },
    pricing: 0.28,
    amenities: ['wifi'],
    isActive: true,
    rating: 4.2
  },

  // Jaipur
  {
    name: 'Jaipur EV Charging Hub',
    location: { type: 'Point', coordinates: [75.7873, 26.9124] },
    address: { street: 'MI Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 3, power: 150 },
      { type: 'Type2', count: 2, power: 22 }
    ],
    operatingHours: { open: '08:00', close: '21:00' },
    pricing: 0.30,
    amenities: ['wifi', 'cafe'],
    isActive: true,
    rating: 4.0
  },

  // Lucknow
  {
    name: 'Lucknow EV Station',
    location: { type: 'Point', coordinates: [80.9462, 26.8467] },
    address: { street: 'Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', country: 'India' },
    connectors: [
      { type: 'CCS2', count: 3, power: 100 },
      { type: 'Type2', count: 2, power: 22 }
    ],
    operatingHours: { open: '08:00', close: '21:00' },
    pricing: 0.28,
    amenities: ['wifi'],
    isActive: true,
    rating: 4.1
  }
];

const seedIndia = async () => {
  try {
    await connectDB();
    console.log('🇮🇳 Seeding Indian EV stations...\n');

    let owner = await User.findOne({ email: 'owner@india.com' });
    if (!owner) {
      owner = await User.create({
        name: 'India Station Owner',
        email: 'owner@india.com',
        password: 'Owner@123',
        role: 'station_owner'
      });
      console.log('✅ India station owner created');
    }

    console.log('🗑️  Clearing existing stations...');
    await Station.deleteMany({});
    console.log('✅ Cleared existing stations');

    const stationsWithOwner = indianStations.map(station => ({
      ...station,
      owner: owner._id
    }));

    const inserted = await Station.insertMany(stationsWithOwner);
    console.log(`✅ Added ${inserted.length} Indian EV stations`);

    const cities = await Station.aggregate([
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Stations by city:');
    cities.forEach(c => {
      console.log(`   - ${c._id}: ${c.count} stations`);
    });

    console.log('\n🔑 Credentials:');
    console.log('   Admin: admin@evcharge.com / Admin@123');
    console.log('   Test: test@example.com / password123');
    console.log('   India Owner: owner@india.com / Owner@123');

    await mongoose.connection.close();
    console.log('\n🎉 Indian EV stations seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedIndia();