import mongoose from 'mongoose';
import { User } from './src/lib/models/User';
import bcrypt from 'bcryptjs';

async function resetPassword() {
  try {
    const mongoURI = 'mongodb+srv://Coder_db_user:bSd9kQf0JJVmc997@cluster0.mgimzli.mongodb.net/?appName=Cluster0';

    await mongoose.connect(mongoURI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log('Connected to MongoDB');

    const email = 'spywithcode@gmail.com';
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    let user = await User.findOne({ email });

    if (user) {
      // Update existing user
      user.hashedPassword = hashedPassword;
      await user.save();
      console.log(`Password reset successfully for user: ${user._id}`);
      console.log(`New hashed password (first 10 chars): ${hashedPassword.substring(0, 10)}...`);
    } else {
      // Create new user
      user = new User({
        name: 'Admin User',
        email,
        phone: '+1234567890', // Placeholder phone
        hashedPassword,
        role: 'admin',
        restaurantId: 'default-restaurant' // Assuming a default or placeholder
      });
      await user.save();
      console.log(`New admin user created: ${user._id}`);
      console.log(`New hashed password (first 10 chars): ${hashedPassword.substring(0, 10)}...`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetPassword();
