# Restaurant Management App - JWT Authentication Testing Guide

This guide provides comprehensive testing instructions for the MongoDB-based JWT authentication system that replaced Firebase.

## 🚀 Prerequisites

1. **MongoDB Running**: Ensure MongoDB is running locally or use MongoDB Atlas
2. **Environment Variables**: Set up `.env.local` with:
   ```
   MONGODB_URI=mongodb://localhost:27017/restaurant-app
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   ```
3. **Dependencies**: Install required packages:
   ```bash
   npm install mongoose bcryptjs jsonwebtoken
   ```

## 📋 Testing Files Included

### 1. **auth-test.http** (VS Code REST Client)
- Complete HTTP request collection for testing all endpoints
- Includes authentication, CRUD operations, and error scenarios
- Use VS Code REST Client extension to run these requests

### 2. **Restaurant-API-Postman-Collection.json** (Postman)
- Complete Postman collection with tests
- Pre-configured variables and test scripts
- Import this into Postman for GUI testing

### 3. **test-setup.sh** (Shell Script)
- Automated test data setup script
- Creates sample users, restaurants, menu items, tables, and orders
- Run this to populate your database with test data

## 🧪 Testing Steps

### Step 1: Set Up Test Data
```bash
# Run the setup script to create test data
chmod +x test-setup.sh
./test-setup.sh
```

### Step 2: Start the Development Server
```bash
npm run dev
```

### Step 3: Test Authentication Flow

#### 1. Register New Users
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Test Restaurant Owner",
  "email": "owner@testrestaurant.com",
  "password": "testpassword123",
  "mobile": "+1234567890",
  "role": "admin",
  "restaurantName": "Test Restaurant",
  "restaurantDescription": "A test restaurant for API testing",
  "restaurantAddress": "123 Test Street, Test City, TC 12345",
  "restaurantPhone": "+1234567890",
  "restaurantEmail": "contact@testrestaurant.com"
}
```

#### 2. Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "owner@testrestaurant.com",
  "password": "testpassword123"
}
```

#### 3. Verify Token
```http
GET http://localhost:3000/api/auth/verify
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### Step 4: Test Protected Endpoints

#### Get Menu Items (Requires Authentication)
```http
GET http://localhost:3000/api/menu
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

#### Create Menu Item
```http
POST http://localhost:3000/api/menu
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato sauce, mozzarella, and fresh basil",
  "price": 12.99,
  "category": "Main Course",
  "imageUrl": "https://example.com/pizza.jpg",
  "isAvailable": true
}
```

#### Create Order
```http
POST http://localhost:3000/api/orders
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "tableNumber": 1,
  "items": [
    {
      "menuItemId": "menu-1234567890",
      "quantity": 2,
      "name": "Margherita Pizza",
      "price": 12.99
    }
  ],
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

### Step 5: Test Real-time Updates

The app uses MongoDB Change Streams for real-time updates. Test this by:

1. Opening multiple browser tabs
2. Making changes in one tab (update order status, add menu item)
3. Observing real-time updates in other tabs

### Step 6: Test Error Scenarios

#### Invalid Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "wrong@email.com",
  "password": "wrongpassword"
}
```

#### Access Protected Route Without Token
```http
GET http://localhost:3000/api/menu
```

#### Access Protected Route With Invalid Token
```http
GET http://localhost:3000/api/menu
Authorization: Bearer invalid.jwt.token.here
```

## 🔍 Key Features to Test

### ✅ Authentication Features
- [ ] User registration with password hashing
- [ ] JWT token generation and validation
- [ ] Token refresh and expiration
- [ ] Password reset functionality
- [ ] Role-based access control

### ✅ Database Operations
- [ ] MongoDB connection and health checks
- [ ] CRUD operations for all collections
- [ ] Data validation and error handling
- [ ] Database indexing and performance

### ✅ Real-time Features
- [ ] MongoDB Change Streams implementation
- [ ] Real-time order status updates
- [ ] Real-time table status updates
- [ ] Real-time menu updates

### ✅ Security Features
- [ ] Password hashing with bcrypt
- [ ] JWT token security
- [ ] Input validation and sanitization
- [ ] Rate limiting and DDoS protection
- [ ] CORS configuration

### ✅ API Features
- [ ] RESTful API design
- [ ] Proper HTTP status codes
- [ ] Error handling and responses
- [ ] API documentation
- [ ] Request/response validation

## 🐛 Common Issues and Solutions

### 1. MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check connection string
echo $MONGODB_URI
```

### 2. JWT Token Issues
```bash
# Check JWT_SECRET is set
echo $JWT_SECRET

# Verify token format
# Should be: Bearer <token>
```

### 3. Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### 4. Environment Variables Not Loading
```bash
# Check .env.local exists
ls -la .env.local

# Restart development server
npm run dev
```

## 📊 Testing Checklist

- [ ] All authentication endpoints work correctly
- [ ] JWT tokens are generated and validated properly
- [ ] Protected routes require authentication
- [ ] Real-time updates work across multiple tabs
- [ ] Error handling works for all scenarios
- [ ] Database operations are performant
- [ ] Security measures are in place
- [ ] API responses are properly formatted

## 🎯 Expected Results

After successful testing, you should have:

1. **Working Authentication System**: Users can register, login, and access protected resources
2. **Secure JWT Implementation**: Tokens are properly signed, verified, and expired
3. **Real-time Functionality**: Changes are reflected immediately across all connected clients
4. **Robust Error Handling**: Proper error messages and status codes for all scenarios
5. **Production-Ready Security**: Password hashing, input validation, and secure token handling

## 📞 Support

If you encounter any issues during testing:

1. Check the browser console for JavaScript errors
2. Check the terminal for server-side errors
3. Verify environment variables are set correctly
4. Ensure MongoDB is running and accessible
5. Check network connectivity and firewall settings

Happy Testing! 🎉
