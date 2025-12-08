import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

async function queryUser() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'rajesh@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User details:');
    console.log('- ID:', user._id.toString());
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Restaurant ID:', user.restaurantId);
    console.log('- Hashed Password (first 10 chars):', user.hashedPassword.substring(0, 10));
    console.log('- Created At:', user.createdAt);

  } catch (error) {
    console.error('Error querying user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

queryUser();
