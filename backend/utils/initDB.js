const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Station = require('../models/Station');
const Booking = require('../models/Booking');

dotenv.config();

const initDatabase = async () => {
  try {
    await connectDB();
    console.log('🗄️  Initializing database...');

    console.log('📇 Creating indexes...');
    
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await Station.collection.createIndex({ location: '2dsphere' });
    await Station.collection.createIndex({ name: 'text' });
    await Station.collection.createIndex({ 'connectors.type': 1 });
    await Station.collection.createIndex({ isActive: 1 });
    await Booking.collection.createIndex({ station: 1, connectorType: 1, startTime: 1, endTime: 1 });
    await Booking.collection.createIndex({ user: 1, startTime: -1 });
    await Booking.collection.createIndex({ status: 1 });
    
    console.log('✅ Indexes created successfully');
    
    const adminExists = await User.findOne({ email: 'admin@evcharge.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@evcharge.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '+1234567890',
      });
      console.log('✅ Admin user created');
    }

    const testExists = await User.findOne({ email: 'test@example.com' });
    if (!testExists) {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'driver',
        phone: '+9876543210',
      });
      console.log('✅ Test user created');
    }

    console.log('\n🔑 Default Credentials:');
    console.log('   Admin: admin@evcharge.com / Admin@123');
    console.log('   Test: test@example.com / password123');

    await mongoose.connection.close();
    console.log('\n🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

initDatabase();