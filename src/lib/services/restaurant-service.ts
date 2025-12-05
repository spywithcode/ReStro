import { Restaurant } from '@/lib/models/Restaurant';

export class RestaurantService {
  static async getAllRestaurants() {
    return await Restaurant.find({});
  }

  static async getRestaurantById(id: string) {
    return await Restaurant.findById(id);
  }

  static async createRestaurant(restaurantData: {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    imageUrl?: string;
  }) {
    const restaurant = new Restaurant(restaurantData);
    return await restaurant.save();
  }

  static async updateRestaurant(id: string, updateData: Partial<typeof Restaurant>) {
    return await Restaurant.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteRestaurant(id: string) {
    return await Restaurant.findByIdAndDelete(id);
  }

  static async getRestaurantsByOwner(ownerId: string) {
    return await Restaurant.find({ ownerId });
  }
}
