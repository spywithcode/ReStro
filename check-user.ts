import mongoose from 'mongoose';
import { User } from './src/lib/models/User';

async function checkUser() {
  try {
    const mongoURI = 'mongodb://localhost:27017/restaurant-app';

    await mongoose.connect(mongoURI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log('Connected to MongoDB');

    const email = 'rajesh@gmail.com';
    const user = await User.findOne({ email });

    if (user) {
      console.log(`User found: ${user._id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Restaurant ID: ${user.restaurantId}`);
      console.log(`Hashed Password (first 10 chars): ${user.hashedPassword.substring(0, 10)}...`);
      console.log(`Hashed Password length: ${user.hashedPassword.length}`);
    } else {
      console.log(`User not found: ${email}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error checking user:', error);
    process.exit(1);
  }
}

checkUser();
