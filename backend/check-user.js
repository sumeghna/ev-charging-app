const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const User = require('./models/User');
    
    // Check all users
    const allUsers = await User.find({}).select('name email role');
    console.log('📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) [${user.role}]`);
    });
    console.log(`\nTotal users: ${allUsers.length}\n`);
    
    // Check specific users
    const admin = await User.findOne({ email: 'admin@evcharge.com' });
    if (admin) {
      console.log('✅ Admin user found:');
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Has password: ${admin.password ? 'Yes' : 'No'}`);
      console.log(`   Password length: ${admin.password ? admin.password.length : 0}`);
    } else {
      console.log('❌ Admin user NOT found!');
    }
    
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      console.log('\n✅ Test user found');
    } else {
      console.log('\n❌ Test user NOT found!');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
  }
}

checkUsers();