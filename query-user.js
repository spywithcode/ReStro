const mongoose = require('mongoose');
const { connectDB } = require('./src/lib/db');
const { User } = require('./src/lib/models/User');

async function queryUser() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'rajesh@gmail.com' });
    if (user) {
      console.log('User found:');
      console.log('- ID:', user._id);
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('- Restaurant ID:', user.restaurantId);
      console.log('- Hashed Password (first 10 chars):', user.hashedPassword ? user.hashedPassword.substring(0, 10) + '...' : 'None');
      console.log('- Created At:', user.createdAt);
    } else {
      console.log('No user found with email rajesh@gmail.com');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error querying user:', error);
  }
}

queryUser();
