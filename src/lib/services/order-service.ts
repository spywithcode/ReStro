import { Order } from '@/lib/models/Order';

export class OrderService {
  static async getAllOrders() {
    return await Order.find({});
  }

  static async getOrdersByRestaurant(restaurantId: string) {
    return await Order.find({ restaurantId });
  }

  static async getOrderById(id: string) {
    return await Order.findById(id);
  }

  static async createOrder(orderData: {
    id: string;
    tableNumber: number;
    items: Array<{
      menuItemId: string;
      quantity: number;
      name: string;
      price: number;
    }>;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    status: string;
    timestamp: Date;
    total: number;
    restaurantId: string;
  }) {
    const order = new Order(orderData);
    return await order.save();
  }

  static async updateOrderStatus(id: string, status: string) {
    return await Order.findByIdAndUpdate(id, { status }, { new: true });
  }

  static async deleteOrder(id: string) {
    return await Order.findByIdAndDelete(id);
  }

  static async getOrdersByStatus(restaurantId: string, status: string) {
    return await Order.find({ restaurantId, status });
  }

  static async getOrdersByTable(restaurantId: string, tableNumber: number) {
    return await Order.find({ restaurantId, tableNumber });
  }
}
