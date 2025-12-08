import mongoose from 'mongoose';
import { connectDB } from './src/lib/db';
import { Restaurant } from './src/lib/models/Restaurant';
import { MenuItem } from './src/lib/models/MenuItem';
import { Table } from './src/lib/models/Table';
import { Order, IOrderItem } from './src/lib/models/Order';
import { User } from './src/lib/models/User';
import bcrypt from 'bcryptjs';

async function seedData() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const restaurantId = 'rest-1758811105315'; // raju dhaba
    const userEmail = 'rajesh@gmail.com';

    // Find the restaurant
    let restaurant = await Restaurant.findOne({ id: restaurantId });
    if (!restaurant) {
      console.log(`Restaurant ${restaurantId} not found. Creating it.`);
      restaurant = new Restaurant({
        id: restaurantId,
        name: 'raju dhaba',
        description: 'A cozy restaurant',
        address: 'vanaras',
        phone: '1234567890',
        email: 'raju@dhaba.com',
        isActive: true
      });
      await restaurant.save();
      console.log(`Created restaurant: ${restaurant.name}`);
    } else {
      console.log(`Found restaurant: ${restaurant.name}`);
    }

    // Find the user and ensure restaurantId is set
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { restaurantId },
      { new: true }
    );
    if (user) {
      console.log(`Updated user ${userEmail} with restaurantId: ${restaurantId}`);
    }

    // Seed Menu Items
    const menuItemsData = [
      {
        id: `menu-${restaurantId}-1`,
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry with tender chicken.',
        price: 350,
        category: 'Main Course',
        imageUrl: '/images/main-course.jpg',
        isAvailable: true,
        restaurantId
      },
      {
        id: `menu-${restaurantId}-2`,
        name: 'Naan Bread',
        description: 'Soft tandoori flatbread.',
        price: 80,
        category: 'Appetizer',
        imageUrl: '/images/bread.jpg',
        isAvailable: true,
        restaurantId
      },
      {
        id: `menu-${restaurantId}-3`,
        name: 'Gulab Jamun',
        description: 'Sweet milk dumplings in rose syrup.',
        price: 120,
        category: 'Dessert',
        imageUrl: '/images/dessert.jpg',
        isAvailable: true,
        restaurantId
      },
      {
        id: `menu-${restaurantId}-4`,
        name: 'Mango Lassi',
        description: 'Refreshing yogurt drink with mango.',
        price: 100,
        category: 'Beverage',
        imageUrl: '/images/drink.jpg',
        isAvailable: true,
        restaurantId
      }
    ];

    // Clear existing menu items for this restaurant
    await MenuItem.deleteMany({ restaurantId });
    console.log('Cleared existing menu items.');

    // Insert new menu items
    const menuItems = await MenuItem.insertMany(menuItemsData);
    console.log(`Seeded ${menuItems.length} menu items.`);

    // Seed Tables
    const tablesData = [
      { id: 1, capacity: 4, status: 'Free', restaurantId, qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(`https://re-stro.vercel.app/customer/login/${restaurantId}/1`)}` },
      { id: 2, capacity: 2, status: 'Occupied', restaurantId, qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(`https://re-stro.vercel.app/customer/login/${restaurantId}/2`)}` },
      { id: 3, capacity: 6, status: 'Free', restaurantId, qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(`https://re-stro.vercel.app/customer/login/${restaurantId}/3`)}` },
      { id: 4, capacity: 4, status: 'Requires-Cleaning', restaurantId, qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(`https://re-stro.vercel.app/customer/login/${restaurantId}/4`)}` }
    ];

    // Clear existing tables for this restaurant
    await Table.deleteMany({ restaurantId });
    console.log('Cleared existing tables.');

    // Insert new tables
    const tables = await Table.insertMany(tablesData);
    console.log(`Seeded ${tables.length} tables.`);

    // Seed Orders
    const orderItems: IOrderItem[] = [
      { menuItemId: menuItems[0]._id.toString(), quantity: 2, name: 'Butter Chicken', price: 350 },
      { menuItemId: menuItems[1]._id.toString(), quantity: 4, name: 'Naan Bread', price: 80 },
      { menuItemId: menuItems[3]._id.toString(), quantity: 1, name: 'Mango Lassi', price: 100 }
    ];

    const ordersData = [
      {
        id: `ORD-${restaurantId.slice(-4).toUpperCase()}-001`,
        tableNumber: 2,
        items: orderItems,
        status: 'Preparing',
        total: 1260, // 2*350 + 4*80 + 1*100
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        customer: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
        restaurantId,
        paymentMethod: 'Cash'
      },
      {
        id: `ORD-${restaurantId.slice(-4).toUpperCase()}-002`,
        tableNumber: 1,
        items: [{ menuItemId: menuItems[2]._id.toString(), quantity: 3, name: 'Gulab Jamun', price: 120 }],
        status: 'Completed',
        total: 360,
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        customer: { name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321' },
        restaurantId,
        paymentMethod: 'Online'
      }
    ];

    // Clear existing orders for this restaurant
    await Order.deleteMany({ restaurantId });
    console.log('Cleared existing orders.');

    // Insert new orders (map items to use actual _id)
    const seededOrders = await Promise.all(ordersData.map(async (orderData) => {
      const order = new Order({
        ...orderData,
        items: orderData.items.map(item => ({
          ...item,
          menuItemId: item.menuItemId // already set to _id string
        }))
      });
      return await order.save();
    }));
    console.log(`Seeded ${seededOrders.length} orders.`);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedData();
