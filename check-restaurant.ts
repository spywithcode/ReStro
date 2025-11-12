import mongoose from 'mongoose';
import { Restaurant } from './src/lib/models/Restaurant';

async function checkRestaurant() {
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

    const restaurants = await Restaurant.find({});

    console.log(`Found ${restaurants.length} restaurants:`);
    restaurants.forEach(r => {
      console.log(`ID: ${r.id}, Name: ${r.name}, Address: ${r.address}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error checking restaurants:', error);
    process.exit(1);
  }
}

checkRestaurant();
