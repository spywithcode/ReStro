#!/bin/bash

# Restaurant Management App - Test Data Setup Script
# This script populates your MongoDB database with sample data for testing

echo "🚀 Setting up test data for Restaurant Management App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${RED}❌ MongoDB is not running. Please start MongoDB first.${NC}"
    echo "Start MongoDB with: sudo systemctl start mongod"
    exit 1
fi

echo -e "${GREEN}✅ MongoDB is running${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is installed${NC}"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating with default values...${NC}"

    cat > .env.local << EOL
MONGODB_URI=mongodb://localhost:27017/restaurant-app
JWT_SECRET=your-super-secret-jwt-key-change-in-production-123456789
JWT_EXPIRES_IN=7d
NODE_ENV=development
EOL

    echo -e "${GREEN}✅ Created .env.local with default values${NC}"
fi

echo -e "${GREEN}✅ Environment setup complete${NC}"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Create test data using Node.js script
echo -e "${YELLOW}🗄️  Creating test data in MongoDB...${NC}"

node -e "
// Test Data Setup Script
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-app')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  hashedPassword: String,
  role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
  restaurantId: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  description: String,
  address: String,
  phone: String,
  email: String,
  imageUrl: String,
  ownerId: String
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  description: String,
  price: Number,
  category: String,
  imageUrl: String,
  isAvailable: { type: Boolean, default: true },
  restaurantId: String
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// Table Schema
const tableSchema = new mongoose.Schema({
  id: Number,
  capacity: Number,
  status: { type: String, enum: ['Available', 'Occupied', 'Reserved'], default: 'Available' },
  qrCode: String,
  restaurantId: String
}, { timestamps: true });

const Table = mongoose.model('Table', tableSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  tableNumber: Number,
  items: [{
    menuItemId: String,
    quantity: Number,
    name: String,
    price: Number
  }],
  customer: {
    name: String,
    email: String,
    phone: String
  },
  status: { type: String, enum: ['Placed', 'Preparing', 'Ready', 'Served', 'Cancelled'], default: 'Placed' },
  timestamp: { type: Date, default: Date.now },
  total: Number,
  restaurantId: String
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

async function createTestData() {
  try {
    console.log('🧹 Clearing existing test data...');

    // Clear existing data
    await User.deleteMany({ email: { \$in: ['owner@testrestaurant.com', 'customer@testrestaurant.com', 'staff@testrestaurant.com'] } });
    await Restaurant.deleteMany({ id: { \$in: ['test-rest-001', 'test-rest-002'] } });
    await MenuItem.deleteMany({ restaurantId: { \$in: ['test-rest-001', 'test-rest-002'] } });
    await Table.deleteMany({ restaurantId: { \$in: ['test-rest-001', 'test-rest-002'] } });
    await Order.deleteMany({ restaurantId: { \$in: ['test-rest-001', 'test-rest-002'] } });

    console.log('✅ Cleared existing test data');

    // Create test users
    const hashedPassword = await bcrypt.hash('testpassword123', 12);

    const users = [
      {
        name: 'Test Restaurant Owner',
        email: 'owner@testrestaurant.com',
        phone: '+1234567890',
        hashedPassword: hashedPassword,
        role: 'admin',
        restaurantId: 'test-rest-001'
      },
      {
        name: 'Test Customer',
        email: 'customer@testrestaurant.com',
        phone: '+1987654321',
        hashedPassword: hashedPassword,
        role: 'customer'
      },
      {
        name: 'Test Staff',
        email: 'staff@testrestaurant.com',
        phone: '+1555123456',
        hashedPassword: hashedPassword,
        role: 'staff',
        restaurantId: 'test-rest-001'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Created test users');

    // Create test restaurants
    const restaurants = [
      {
        id: 'test-rest-001',
        name: 'Test Restaurant',
        description: 'A test restaurant for API testing',
        address: '123 Test Street, Test City, TC 12345',
        phone: '+1234567890',
        email: 'contact@testrestaurant.com',
        imageUrl: 'https://example.com/restaurant.jpg',
        ownerId: createdUsers[0]._id
      },
      {
        id: 'test-rest-002',
        name: 'Another Test Restaurant',
        description: 'Another test restaurant',
        address: '456 Demo Avenue, Sample City, SC 67890',
        phone: '+1987654321',
        email: 'info@anothertest.com',
        imageUrl: 'https://example.com/restaurant2.jpg',
        ownerId: createdUsers[0]._id
      }
    ];

    const createdRestaurants = await Restaurant.insertMany(restaurants);
    console.log('✅ Created test restaurants');

    // Create test menu items
    const menuItems = [
      {
        id: 'menu-001',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        price: 12.99,
        category: 'Main Course',
        imageUrl: 'https://example.com/pizza.jpg',
        isAvailable: true,
        restaurantId: 'test-rest-001'
      },
      {
        id: 'menu-002',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing and croutons',
        price: 8.99,
        category: 'Appetizer',
        imageUrl: 'https://example.com/salad.jpg',
        isAvailable: true,
        restaurantId: 'test-rest-001'
      },
      {
        id: 'menu-003',
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with vanilla ice cream',
        price: 6.99,
        category: 'Dessert',
        imageUrl: 'https://example.com/cake.jpg',
        isAvailable: true,
        restaurantId: 'test-rest-001'
      },
      {
        id: 'menu-004',
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with lemon herb seasoning',
        price: 18.99,
        category: 'Main Course',
        imageUrl: 'https://example.com/salmon.jpg',
        isAvailable: true,
        restaurantId: 'test-rest-002'
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log('✅ Created test menu items');

    // Create test tables
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      tables.push({
        id: i,
        capacity: i <= 5 ? 2 : (i <= 8 ? 4 : 6),
        status: i <= 3 ? 'Available' : (i <= 6 ? 'Occupied' : 'Reserved'),
        qrCode: \`https://example.com/qr/\${i}\`,
        restaurantId: 'test-rest-001'
      });
    }

    await Table.insertMany(tables);
    console.log('✅ Created test tables');

    // Create test orders
    const orders = [
      {
        id: 'ORD-TEST-001',
        tableNumber: 1,
        items: [
          {
            menuItemId: 'menu-001',
            quantity: 2,
            name: 'Margherita Pizza',
            price: 12.99
          },
          {
            menuItemId: 'menu-002',
            quantity: 1,
            name: 'Caesar Salad',
            price: 8.99
          }
        ],
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        status: 'Preparing',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        total: 34.97,
        restaurantId: 'test-rest-001'
      },
      {
        id: 'ORD-TEST-002',
        tableNumber: 3,
        items: [
          {
            menuItemId: 'menu-003',
            quantity: 1,
            name: 'Chocolate Cake',
            price: 6.99
          }
        ],
        customer: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1987654321'
        },
        status: 'Placed',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        total: 6.99,
        restaurantId: 'test-rest-001'
      }
    ];

    await Order.insertMany(orders);
    console.log('✅ Created test orders');

    console.log('');
    console.log('🎉 Test data setup complete!');
    console.log('');
    console.log('📋 Test Credentials:');
    console.log('   Admin: owner@testrestaurant.com / testpassword123');
    console.log('   Customer: customer@testrestaurant.com / testpassword123');
    console.log('   Staff: staff@testrestaurant.com / testpassword123');
    console.log('');
    console.log('🏪 Test Restaurants:');
    console.log('   ID: test-rest-001 (Test Restaurant)');
    console.log('   ID: test-rest-002 (Another Test Restaurant)');
    console.log('');
    console.log('🍕 Sample Menu Items:');
    console.log('   menu-001: Margherita Pizza ($12.99)');
    console.log('   menu-002: Caesar Salad ($8.99)');
    console.log('   menu-003: Chocolate Cake ($6.99)');
    console.log('   menu-004: Grilled Salmon ($18.99)');
    console.log('');
    console.log('🪑 Tables: 1-10 (various capacities and statuses)');
    console.log('📋 Orders: ORD-TEST-001, ORD-TEST-002');
    console.log('');
    console.log('🚀 Ready to test! Start your development server with: npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
    process.exit(1);
  }
}

createTestData();
"

echo -e "${GREEN}✅ Test data setup script completed${NC}"
echo ""
echo "🎉 Your MongoDB database is now populated with test data!"
echo ""
echo "📋 Next Steps:"
echo "1. Start your development server: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Use the testing files to test authentication and API endpoints"
echo "4. Check AUTH-TESTING-README.md for detailed testing instructions"
echo ""
echo "🔗 Test Credentials:"
echo "   Admin: owner@testrestaurant.com / testpassword123"
echo "   Customer: customer@testrestaurant.com / testpassword123"
echo "   Staff: staff@testrestaurant.com / testpassword123"
