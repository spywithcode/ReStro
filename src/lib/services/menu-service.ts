import { MenuItem } from '@/lib/models/MenuItem';
import { MenuItem as MenuItemType } from '@/lib/data';

export class MenuService {
  static async getAllMenuItems() {
    return await MenuItem.find({});
  }

  static async getMenuItemsByRestaurant(restaurantId: string) {
    return await MenuItem.find({ restaurantId });
  }

  static async getMenuItemById(id: string) {
    return await MenuItem.findById(id);
  }

  static async createMenuItem(menuItemData: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    isAvailable: boolean;
    restaurantId: string;
  }) {
    const menuItem = new MenuItem(menuItemData);
    return await menuItem.save();
  }

  static async updateMenuItem(id: string, updateData: Partial<MenuItemType>) {
    return await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteMenuItem(id: string) {
    return await MenuItem.findByIdAndDelete(id);
  }

  static async getMenuItemsByCategory(restaurantId: string, category: string) {
    return await MenuItem.find({ restaurantId, category });
  }

  static async getAvailableMenuItems(restaurantId: string) {
    return await MenuItem.find({ restaurantId, isAvailable: true });
  }
}
