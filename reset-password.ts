import mongoose from 'mongoose';
import { User } from './src/lib/models/User';
import bcrypt from 'bcryptjs';

async function resetPassword() {
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
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await User.findOneAndUpdate(
      { email },
      { hashedPassword },
      { new: true }
    );

    if (user) {
      console.log(`Password reset successfully for user: ${user._id}`);
      console.log(`New hashed password (first 10 chars): ${hashedPassword.substring(0, 10)}...`);
    } else {
      console.log(`User not found: ${email}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetPassword();
