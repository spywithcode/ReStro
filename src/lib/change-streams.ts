import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { Table } from '@/lib/models/Table';
import { MenuItem } from '@/lib/models/MenuItem';

export class ChangeStreams {
  private static orderListeners: Map<string, (orders: any[]) => void> = new Map();
  private static tableListeners: Map<string, (tables: any[]) => void> = new Map();
  private static menuListeners: Map<string, (menuItems: any[]) => void> = new Map();

  static async initializeOrderStream(restaurantId: string) {
    await connectDB();

    const changeStream = Order.watch([
      {
        $match: {
          'fullDocument.restaurantId': restaurantId
        }
      }
    ]);

    changeStream.on('change', (change) => {
      // Notify all listeners for this restaurant
      const listener = this.orderListeners.get(restaurantId);
      if (listener) {
        this.getOrdersForRestaurant(restaurantId).then(orders => {
          listener(orders);
        }).catch(console.error);
      }
    });

    changeStream.on('error', (error) => {
      console.error('Order change stream error:', error);
    });

    return changeStream;
  }

  static async initializeTableStream(restaurantId: string) {
    await connectDB();

    const changeStream = Table.watch([
      {
        $match: {
          'fullDocument.restaurantId': restaurantId
        }
      }
    ]);

    changeStream.on('change', (change) => {
      // Notify all listeners for this restaurant
      const listener = this.tableListeners.get(restaurantId);
      if (listener) {
        this.getTablesForRestaurant(restaurantId).then(tables => {
          listener(tables);
        }).catch(console.error);
      }
    });

    changeStream.on('error', (error) => {
      console.error('Table change stream error:', error);
    });

    return changeStream;
  }

  static async initializeMenuStream(restaurantId: string) {
    await connectDB();

    const changeStream = MenuItem.watch([
      {
        $match: {
          'fullDocument.restaurantId': restaurantId
        }
      }
    ]);

    changeStream.on('change', (change) => {
      // Notify all listeners for this restaurant
      const listener = this.menuListeners.get(restaurantId);
      if (listener) {
        this.getMenuItemsForRestaurant(restaurantId).then(menuItems => {
          listener(menuItems);
        }).catch(console.error);
      }
    });

    changeStream.on('error', (error) => {
      console.error('Menu change stream error:', error);
    });

    return changeStream;
  }

  static subscribeToOrders(restaurantId: string, callback: (orders: any[]) => void) {
    this.orderListeners.set(restaurantId, callback);

    // Initialize the stream if not already done
    this.initializeOrderStream(restaurantId).catch(console.error);

    // Return unsubscribe function
    return () => {
      this.orderListeners.delete(restaurantId);
    };
  }

  static subscribeToTables(restaurantId: string, callback: (tables: any[]) => void) {
    this.tableListeners.set(restaurantId, callback);

    // Initialize the stream if not already done
    this.initializeTableStream(restaurantId).catch(console.error);

    // Return unsubscribe function
    return () => {
      this.tableListeners.delete(restaurantId);
    };
  }

  static subscribeToMenu(restaurantId: string, callback: (menuItems: any[]) => void) {
    this.menuListeners.set(restaurantId, callback);

    // Initialize the stream if not already done
    this.initializeMenuStream(restaurantId).catch(console.error);

    // Return unsubscribe function
    return () => {
      this.menuListeners.delete(restaurantId);
    };
  }

  static async getOrdersForRestaurant(restaurantId: string) {
    await connectDB();
    return Order.find({ restaurantId }).sort({ timestamp: -1 });
  }

  static async getTablesForRestaurant(restaurantId: string) {
    await connectDB();
    return Table.find({ restaurantId }).sort({ id: 1 });
  }

  static async getMenuItemsForRestaurant(restaurantId: string) {
    await connectDB();
    return MenuItem.find({ restaurantId, isAvailable: true }).sort({ category: 1, name: 1 });
  }

  static async closeAllStreams() {
    // MongoDB change streams are automatically closed when the connection closes
    // This method is here for future cleanup if needed
    this.orderListeners.clear();
    this.tableListeners.clear();
    this.menuListeners.clear();
  }
}
