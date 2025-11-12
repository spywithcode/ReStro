import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Restaurant } from '@/lib/models/Restaurant';
import { generateToken, AuthError } from '@/lib/auth';
import { UserService } from '@/lib/services/user-service';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'staff', 'customer']).default('customer'),
  restaurantId: z.string().optional(),
  restaurantName: z.string().optional(),
  address: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, phone, password, role, restaurantId, restaurantName, address } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AuthError('User with this email already exists', 409);
    }

    let finalRestaurantId = restaurantId;

    // If role is admin and no restaurantId provided, create a new restaurant
    if (role === 'admin' && !restaurantId) {
      if (!restaurantName || !address) {
        throw new AuthError('Restaurant name and address are required for admin registration', 400);
      }

      const newRestaurant = new Restaurant({
        id: `rest-${Date.now()}`,
        name: restaurantName.trim(),
        description: `Restaurant created by ${name}`,
        address: address.trim(),
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        imageUrl: '/images/default-food.jpg'
      });

      await newRestaurant.save();
      finalRestaurantId = newRestaurant.id;
    }

    // If role is admin or staff, validate restaurant exists
    if (['admin', 'staff'].includes(role)) {
      if (!finalRestaurantId) {
        throw new AuthError('Restaurant ID is required for admin/staff roles', 400);
      }

      const restaurant = await Restaurant.findOne({ id: finalRestaurantId });
      if (!restaurant) {
        throw new AuthError('Restaurant not found', 404);
      }
    }

    // Create new user using UserService (which handles password hashing and saves)
    const newUser = await UserService.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role,
      restaurantId: ['admin', 'staff'].includes(role) ? finalRestaurantId : undefined,
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      restaurantId: newUser.restaurantId,
    });

    // Create response with user data (excluding password)
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      restaurantId: newUser.restaurantId,
      createdAt: newUser.createdAt,
    };

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: userResponse,
      restaurantId: newUser.restaurantId,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
