import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Restaurant } from '@/lib/models/Restaurant';
import { authenticateUser, requireRole, AuthError } from '@/lib/auth';
import { z } from 'zod';

const createRestaurantSchema = z.object({
  id: z.string().min(1, 'Restaurant ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email format'),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

const updateRestaurantSchema = createRestaurantSchema.partial();

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const isActive = searchParams.get('isActive');

    let query: any = {};

    if (id) {
      query.id = id;
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const restaurants = await Restaurant.find(query).sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: restaurants,
    });

  } catch (error) {
    console.error('Get restaurants error:', error);

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication and admin role
    await requireRole(['admin'])(request);

    const body = await request.json();
    const validatedData = createRestaurantSchema.parse(body);

    // Check if restaurant ID already exists
    const existingRestaurant = await Restaurant.findOne({ id: validatedData.id });
    if (existingRestaurant) {
      throw new AuthError('Restaurant with this ID already exists', 409);
    }

    // Create new restaurant
    const restaurant = new Restaurant({
      ...validatedData,
      isActive: true,
    });

    await restaurant.save();

    return NextResponse.json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant,
    }, { status: 201 });

  } catch (error) {
    console.error('Create restaurant error:', error);

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

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication and admin role
    await requireRole(['admin'])(request);

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      throw new AuthError('Restaurant ID is required', 400);
    }

    const validatedData = updateRestaurantSchema.parse(updateData);

    // Find and update restaurant
    const restaurant = await Restaurant.findOneAndUpdate(
      { id },
      { ...validatedData },
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      throw new AuthError('Restaurant not found', 404);
    }

    return NextResponse.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant,
    });

  } catch (error) {
    console.error('Update restaurant error:', error);

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

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication and admin role
    await requireRole(['admin'])(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new AuthError('Restaurant ID is required', 400);
    }

    // Find and delete restaurant
    const restaurant = await Restaurant.findOneAndDelete({ id });

    if (!restaurant) {
      throw new AuthError('Restaurant not found', 404);
    }

    return NextResponse.json({
      success: true,
      message: 'Restaurant deleted successfully',
    });

  } catch (error) {
    console.error('Delete restaurant error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
