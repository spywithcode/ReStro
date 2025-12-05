export type Restaurant = {
  id: string;
  name: string;
  menu: MenuItem[];
  orders: Order[];
  tables: Table[];
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
  imageUrl: string;
  isAvailable: boolean;
  restaurantId: string;
};

export type OrderStatus = 'Placed' | 'Preparing' | 'Ready' | 'Completed';

export type OrderItem = {
    menuItemId: string;
    quantity: number;
    name: string;
    price: number;
}

export type CustomerInfo = {
    name: string;
    email: string;
    phone: string;
}

export type Order = {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  timestamp: Date;
  paymentMethod?: 'Cash' | 'Online';
  customer: CustomerInfo;
  restaurantId: string;
};

export type TableStatus = 'Free' | 'Occupied' | 'Requires-Cleaning';

export type Table = {
  id: number;
  status: TableStatus;
  capacity: number;
  qrCodeUrl: string;
};

// Helper function to generate QR code URL
const getQrCodeUrl = (restaurantId: string, tableId: number) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://re-stro.vercel.app';
    const url = `${baseUrl}/customer/login/${restaurantId}/${tableId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}`;
}

const restaurant1Menu: MenuItem[] = [
  { id: '1-1', name: 'Bruschetta', description: 'Grilled bread with tomatoes, garlic, basil, and olive oil.', price: 250.00, category: 'Appetizer', imageUrl: '/images/bread.jpg', isAvailable: true, restaurantId: 'your-restaurant-id' },
  { id: '1-2', name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, and black pepper.', price: 650.00, category: 'Main Course', imageUrl: '/images/main-course.jpg', isAvailable: true, restaurantId: 'your-restaurant-id' },
  { id: '1-3', name: 'Tiramisu', description: 'Coffee-flavoured Italian dessert.', price: 300.00, category: 'Dessert', imageUrl: '/images/dessert.jpg', isAvailable: true, restaurantId: 'your-restaurant-id' },
  { id: '1-4', name: 'Margherita Pizza', description: 'Classic pizza with tomatoes, mozzarella, and basil.', price: 550.00, category: 'Main Course', imageUrl: '/images/main-course.jpg', isAvailable: true, restaurantId: 'your-restaurant-id' },
  { id: '1-5', name: 'Lemonade', description: 'Freshly squeezed lemonade.', price: 100.00, category: 'Beverage', imageUrl: '/images/drink.jpg', isAvailable: true, restaurantId: 'your-restaurant-id' },
];

const restaurant2Menu: MenuItem[] = [
  { id: '2-1', name: 'Paneer Tikka', description: 'Marinated cottage cheese cubes grilled to perfection.', price: 350.00, category: 'Appetizer', imageUrl: '/images/bread.jpg', isAvailable: true, restaurantId: 'paradise-biryani' },
  { id: '2-2', name: 'Butter Chicken', description: 'Classic Indian dish with grilled chicken in a spiced tomato-butter sauce.', price: 750.00, category: 'Main Course', imageUrl: '/images/main-course.jpg', isAvailable: true, restaurantId: 'paradise-biryani' },
  { id: '2-3', name: 'Gulab Jamun', description: 'Soft, melt-in-mouth milk-solid-based sweet.', price: 150.00, category: 'Dessert', imageUrl: '/images/dessert.jpg', isAvailable: true, restaurantId: 'paradise-biryani' },
];

const restaurant1Orders: Order[] = [
  // Add sample orders if needed
];

const restaurant1Tables: Table[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  status: i % 3 === 0 ? 'Occupied' : 'Free',
  capacity: (i % 2 === 0) ? 4 : 2,
  qrCodeUrl: getQrCodeUrl('your-restaurant-id', i + 1),
}));

const restaurant2Orders: Order[] = [
  { id: 'ORD-2-001', tableNumber: 1, customer: { name: 'Alice', email: 'alice@example.com', phone: '555-555-5555'}, items: [{ menuItemId: '2-1', quantity: 2, name: 'Paneer Tikka', price: 350.00 }], status: 'Placed', total: 700.00, timestamp: new Date(Date.now() - 1 * 60000), restaurantId: 'paradise-biryani' },
];

const restaurant2Tables: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  status: i < 2 ? 'Occupied' : 'Free',
  capacity: (i % 3 === 0) ? 6 : 4,
  qrCodeUrl: getQrCodeUrl('paradise-biryani', i + 1),
}));

export const restaurants: Restaurant[] = [
  { id: 'your-restaurant-id', name: 'The Grand Italiano', menu: restaurant1Menu, orders: restaurant1Orders, tables: restaurant1Tables },
  { id: 'paradise-biryani', name: 'Paradise Biryani', menu: restaurant2Menu, orders: restaurant2Orders, tables: restaurant2Tables },
];

export const reportData = [
  { date: '2024-07-01', revenue: 35000, orders: 30 },
  { date: '2024-07-02', revenue: 42000, orders: 35 },
  { date: '2024-07-03', revenue: 50000, orders: 42 },
  { date: '2024-07-04', revenue: 48000, orders: 38 },
  { date: '2024-07-05', revenue: 60000, orders: 50 },
  { date: '2024-07-06', revenue: 55000, orders: 45 },
  { date: '2024-07-07', revenue: 65000, orders: 55 },
];

// Legacy single-restaurant data, will be replaced by multi-tenant logic in context
export const menuItems: MenuItem[] = restaurant1Menu;
export const orders: Order[] = restaurant1Orders;
export const tables: Table[] = restaurant1Tables;
