const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const cities = [
  {
    name: 'LA Downtown Charging',
    lat: 34.0522,
    lng: -118.2437,
    city: 'Los Angeles',
    state: 'CA'
  },
  {
    name: 'SF Bay Charging',
    lat: 37.7749,
    lng: -122.4194,
    city: 'San Francisco',
    state: 'CA'
  },
  {
    name: 'Chicago Loop EV Hub',
    lat: 41.8781,
    lng: -87.6298,
    city: 'Chicago',
    state: 'IL'
  }
];

async function addStations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    const Station = require('./models/Station');
    
    // Get or create a station owner
    let owner = await User.findOne({ email: 'owner@demo.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Demo Station Owner',
        email: 'owner@demo.com',
        password: 'Owner@123',
        role: 'station_owner'
      });
      console.log('✅ Created station owner');
    }
    
    // Add stations for each city
    for (const city of cities) {
      const exists = await Station.findOne({ name: city.name });
      if (!exists) {
        await Station.create({
          name: city.name,
          location: {
            type: 'Point',
            coordinates: [city.lng, city.lat]
          },
          address: {
            street: '123 Main St',
            city: city.city,
            state: city.state,
            zipCode: '10001',
            country: 'USA'
          },
          connectors: [
            { type: 'CCS2', count: 3, power: 150 },
            { type: 'Type2', count: 2, power: 22 }
          ],
          operatingHours: { open: '06:00', close: '23:00' },
          pricing: 0.40,
          amenities: ['wifi'],
          owner: owner._id,
          isActive: true
        });
        console.log(`✅ Added station: ${city.name}`);
      } else {
        console.log(`ℹ️  Station already exists: ${city.name}`);
      }
    }
    
    console.log('\n🎉 All stations added!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
  }
}

addStations();