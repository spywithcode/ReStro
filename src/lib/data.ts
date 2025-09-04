

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
    contact: string;
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
    // In a real app, you'd use the actual domain. For this demo, we can construct a relative path.
    // However, QR codes need an absolute URL. We'll assume a placeholder domain.
    // This part is tricky in a dev environment. For the demo to work, we will use a common pattern
    // but a better solution would involve environment variables.
    // For now, let's point to a placeholder that can be replaced.
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9002';
    const url = `${baseUrl}/menu/${restaurantId}/${tableId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}`;
}


const restaurant1Menu: MenuItem[] = [
  { id: '1-1', name: 'Bruschetta', description: 'Grilled bread with tomatoes, garlic, basil, and olive oil.', price: 250.00, category: 'Appetizer', imageUrl: 'https://placehold.co/600x400.png', isAvailable: true },
  { id: '1-2', name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, and black pepper.', price: 650.00, category: 'Main Course', imageUrl: 'https://placehold.co/600x400.png', isAvailable: true },
  { id: '1-3', name: 'Tiramisu', description: 'Coffee-flavoured Italian dessert.', price: 300.00, category: 'Dessert', imageUrl: 'https://placehold.co/600x400.png', isAvailable: false },
  { id: '1-4', name: 'Margherita Pizza', description: 'Classic pizza with tomatoes, mozzarella, and basil.', price: 550.00, category: 'Main Course', imageUrl: 'https://placehold.co/600x400.png', isAvailable: true },
  { id: '1-5', name: 'Lemonade', description: 'Freshly squeezed lemonade.', price: 100.00, category: 'Beverage', imageUrl: 'https://placehold.co/600x400.png', isAvailable: true },
];

const restaurant1Orders: Order[] = [
  { id: 'ORD-1-001', tableNumber: 3, customer: { name: 'John Doe', contact: '123-456-7890'}, items: [{ menuItemId: '1-2', quantity: 1, name: 'Spaghetti Carbonara', price: 650.00 }, { menuItemId: '1-5', quantity: 1, name: 'Lemonade', price: 100.00 }], status: 'Preparing', total: 750.00, timestamp: new Date(Date.now() - 5 * 60000) },
  { id: 'ORD-1-002', tableNumber: 5, customer: { name: 'Jane Smith', contact: '098-765-4321'}, items: [{ menuItemId: '1-4', quantity: 2, name: 'Margherita Pizza', price: 550.00 }], status: 'Placed', total: 1100.00, timestamp: new Date(Date.now() - 2 * 60000) },
];

const restaurant1Tables: Table[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  status: i % 3 === 0 ? 'Occupied' : 'Free',
  capacity: (i % 2 === 0) ? 4 : 2,
  qrCodeUrl: getQrCodeUrl('your-restaurant-id', i + 1),
}));

const restaurant2Menu: MenuItem[] = [
  { id: '2-1', name: 'Paneer Tikka', description: 'Marinated cottage cheese cubes grilled to perfection.', price: 350.00, category: 'Appetizer', imageUrl: 'https://placehold.co/600x400.png', isAvailable: true },
  { id: '2-2', name: 'Butter Chicken', description: 'Classic Indian dish with grilled chicken in a spiced tomato-butter sauce.', price: 750.00, category: 'Main Course', imageUrl: 'https://placehold.co/600x400.png', isAvailable: true },
  { id: '2-3', name: 'Gulab Jamun', description: 'Soft, melt-in-your-mouth milk-solid-based sweet.', price: 150.00, category: 'Dessert', imageUrl: 'https://placehold.co/600x400.png', isAvailable: true },
];

const restaurant2Orders: Order[] = [
    { id: 'ORD-2-001', tableNumber: 1, customer: { name: 'Alice', contact: '555-555-5555'}, items: [{ menuItemId: '2-1', quantity: 2, name: 'Paneer Tikka', price: 350.00 }], status: 'Placed', total: 700.00, timestamp: new Date(Date.now() - 1 * 60000) },
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
