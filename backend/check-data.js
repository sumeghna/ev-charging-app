const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const User = require('./models/User');
    const Station = require('./models/Station');
    const Booking = require('./models/Booking');
    
    // 1. Check Users
    console.log('👤 USERS:');
    const users = await User.find({}).select('name email role');
    console.log(`   Total: ${users.length}`);
    users.forEach(u => console.log(`   - ${u.name} (${u.email}) [${u.role}]`));
    console.log();
    
    // 2. Check Stations
    console.log('🔌 STATIONS:');
    const stations = await Station.find({}).select('name address.city connectors');
    console.log(`   Total: ${stations.length}`);
    if (stations.length > 0) {
      stations.forEach(s => {
        console.log(`   - ${s.name} (${s.address?.city || 'Unknown'}) - ${s.connectors?.length || 0} connectors`);
      });
    } else {
      console.log('   ❌ No stations found!');
    }
    console.log();
    
    // 3. Check Bookings
    console.log('📅 BOOKINGS:');
    const bookings = await Booking.countDocuments();
    console.log(`   Total: ${bookings}`);
    
    await mongoose.connection.close();
    console.log('\n✅ Data check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
  }
}

checkData();