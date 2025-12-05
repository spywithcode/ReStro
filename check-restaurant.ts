import { connectDB } from './src/lib/db';
import { Restaurant } from './src/lib/models/Restaurant';

async function checkRestaurant() {
  try {
    await connectDB();

    const restaurants = await Restaurant.find({});

    console.log(`Found ${restaurants.length} restaurants:`);
    restaurants.forEach(r => {
      console.log(`ID: ${r.id}, Name: ${r.name}, Address: ${r.address}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking restaurants:', error);
    process.exit(1);
  }
}

checkRestaurant();
