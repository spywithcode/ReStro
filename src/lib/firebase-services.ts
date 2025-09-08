import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Restaurant, Order, MenuItem, Table, OrderStatus, TableStatus } from './data';

// Collection names
const COLLECTIONS = {
  RESTAURANTS: 'restaurants',
  ORDERS: 'orders',
  MENU_ITEMS: 'menuItems',
  TABLES: 'tables',
};

// Firebase Services Class
export class FirebaseServices {
  // Restaurant Services
  static async getRestaurant(restaurantId: string): Promise<Restaurant | null> {
    try {
      const docRef = doc(db, COLLECTIONS.RESTAURANTS, restaurantId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          orders: data.orders || [],
          menu: data.menu || [],
          tables: data.tables || [],
        } as Restaurant;
      }
      return null;
    } catch (error) {
      console.error('Error getting restaurant:', error);
      return null;
    }
  }

  static async getAllRestaurants(): Promise<Restaurant[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.RESTAURANTS));
      const restaurants: Restaurant[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        restaurants.push({
          ...data,
          id: doc.id,
          orders: data.orders || [],
          menu: data.menu || [],
          tables: data.tables || [],
        } as Restaurant);
      });

      return restaurants;
    } catch (error) {
      console.error('Error getting restaurants:', error);
      return [];
    }
  }

  static async updateRestaurant(restaurant: Restaurant): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.RESTAURANTS, restaurant.id);
      await setDoc(docRef, {
        ...restaurant,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  }

  // Order Services
  static async addOrder(order: Order): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, order.id);
      await setDoc(docRef, {
        ...order,
        timestamp: Timestamp.fromDate(order.timestamp),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }

  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          timestamp: data.timestamp.toDate(),
        } as Order;
      }
      return null;
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }

  static async getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ORDERS),
        where('restaurantId', '==', restaurantId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          ...data,
          id: doc.id,
          timestamp: data.timestamp.toDate(),
        } as Order);
      });

      return orders;
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Real-time Order Listener
  static subscribeToOrders(restaurantId: string, callback: (orders: Order[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('restaurantId', '==', restaurantId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          ...data,
          id: doc.id,
          timestamp: data.timestamp.toDate(),
        } as Order);
      });
      callback(orders);
    }, (error) => {
      console.error('Error in orders subscription:', error);
    });
  }

  // Menu Services
  static async addMenuItem(restaurantId: string, menuItem: MenuItem): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.MENU_ITEMS, menuItem.id);
      await setDoc(docRef, {
        ...menuItem,
        restaurantId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  }

  static async updateMenuItem(menuItem: MenuItem): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.MENU_ITEMS, menuItem.id);
      await updateDoc(docRef, {
        ...menuItem,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  static async deleteMenuItem(menuItemId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.MENU_ITEMS, menuItemId));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  static async getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.MENU_ITEMS),
        where('restaurantId', '==', restaurantId)
      );

      const querySnapshot = await getDocs(q);
      const menuItems: MenuItem[] = [];

      querySnapshot.forEach((doc) => {
        menuItems.push({
          ...doc.data(),
          id: doc.id,
        } as MenuItem);
      });

      return menuItems;
    } catch (error) {
      console.error('Error getting menu items:', error);
      return [];
    }
  }

  // Table Services
  static async updateTableStatus(restaurantId: string, tableId: number, status: TableStatus): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.TABLES, `${restaurantId}-${tableId}`);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating table status:', error);
      throw error;
    }
  }

  static async getTablesByRestaurant(restaurantId: string): Promise<Table[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.TABLES),
        where('restaurantId', '==', restaurantId)
      );

      const querySnapshot = await getDocs(q);
      const tables: Table[] = [];

      querySnapshot.forEach((doc) => {
        tables.push({
          ...doc.data(),
          id: doc.data().tableId,
        } as Table);
      });

      return tables;
    } catch (error) {
      console.error('Error getting tables:', error);
      return [];
    }
  }

  // Migration helper - migrate localStorage data to Firestore
  static async migrateLocalStorageData(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      const localData = localStorage.getItem('qrmenu-app-data');
      if (!localData) return;

      const parsedData = JSON.parse(localData);
      const batch = writeBatch(db);

      // Migrate restaurants
      for (const restaurant of parsedData.restaurants || []) {
        const restaurantRef = doc(db, COLLECTIONS.RESTAURANTS, restaurant.id);
        batch.set(restaurantRef, {
          ...restaurant,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        // Migrate orders
        for (const order of restaurant.orders || []) {
          const orderRef = doc(db, COLLECTIONS.ORDERS, order.id);
          batch.set(orderRef, {
            ...order,
            restaurantId: restaurant.id,
            timestamp: Timestamp.fromDate(new Date(order.timestamp)),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }

        // Migrate menu items
        for (const menuItem of restaurant.menu || []) {
          const menuRef = doc(db, COLLECTIONS.MENU_ITEMS, menuItem.id);
          batch.set(menuRef, {
            ...menuItem,
            restaurantId: restaurant.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }

        // Migrate tables
        for (const table of restaurant.tables || []) {
          const tableRef = doc(db, COLLECTIONS.TABLES, `${restaurant.id}-${table.id}`);
          batch.set(tableRef, {
            ...table,
            tableId: table.id,
            restaurantId: restaurant.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
      }

      await batch.commit();
      console.log('Data migration completed successfully');
    } catch (error) {
      console.error('Error migrating data:', error);
      throw error;
    }
  }
}
