import { RestaurantService } from './services/restaurant-service';
import { UserService } from './services/user-service';
import { connectDB } from './db';

export class MongoDBServices {
  static async createRestaurantWithOwner(data: {
    ownerName: string;
    mobile: string;
    email: string;
    address: string;
    name: string;
    password: string;
  }) {
    try {
      await connectDB();

      // Check if user already exists
      const existingUser = await UserService.findUserByEmail(data.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create restaurant first
      const restaurant = await RestaurantService.createRestaurant({
        id: `rest-${Date.now()}`,
        name: data.name,
        description: `Restaurant created by ${data.ownerName}`,
        address: data.address,
        phone: data.mobile,
        email: data.email,
        imageUrl: '/images/default-food.jpg'
      });

      // Create user account
      const user = await UserService.createUser({
        name: data.ownerName,
        email: data.email,
        password: data.password,
        phone: data.mobile,
        role: 'admin',
        restaurantId: restaurant.id
      });

      return { restaurant, user };
    } catch (error) {
      console.error('Error creating restaurant with owner:', error);
      throw error;
    }
  }

  static async getAllRestaurants() {
    await connectDB();
    return await RestaurantService.getAllRestaurants();
  }

  static async getRestaurantById(id: string) {
    await connectDB();
    return await RestaurantService.getRestaurantById(id);
  }

  static async updateRestaurant(id: string, updateData: any) {
    await connectDB();
    return await RestaurantService.updateRestaurant(id, updateData);
  }

  static async deleteRestaurant(id: string) {
    await connectDB();
    return await RestaurantService.deleteRestaurant(id);
  }
}
