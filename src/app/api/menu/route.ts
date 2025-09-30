import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { MenuItem } from '@/lib/models/MenuItem';
import { authenticateUser, requireRole, AuthError } from '@/lib/auth';
import { z } from 'zod';

const createMenuItemSchema = z.object({
  id: z.string().min(1, 'Menu item ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description cannot exceed 500 characters'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.enum(['Appetizer', 'Main Course', 'Dessert', 'Beverage']),
  imageUrl: z.string().url('Invalid image URL'),
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
});

const updateMenuItemSchema = createMenuItemSchema.partial();

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const category = searchParams.get('category');
    const isAvailable = searchParams.get('isAvailable');

    let query: any = {};

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    if (category) {
      query.category = category;
    }

    if (isAvailable !== null) {
      query.isAvailable = isAvailable === 'true';
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

    return NextResponse.json({
      success: true,
      data: menuItems,
    });

  } catch (error) {
    console.error('Get menu items error:', error);

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
    const validatedData = createMenuItemSchema.parse(body);

    // Check if menu item ID already exists
    const existingMenuItem = await MenuItem.findOne({ id: validatedData.id });
    if (existingMenuItem) {
      throw new AuthError('Menu item with this ID already exists', 409);
    }

    // Create new menu item
    const menuItem = new MenuItem({
      ...validatedData,
      isAvailable: true,
    });

    await menuItem.save();

    return NextResponse.json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem,
    }, { status: 201 });

  } catch (error) {
    console.error('Create menu item error:', error);

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
      throw new AuthError('Menu item ID is required', 400);
    }

    const validatedData = updateMenuItemSchema.parse(updateData);

    // Find and update menu item
    const menuItem = await MenuItem.findOneAndUpdate(
      { id },
      { ...validatedData },
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      throw new AuthError('Menu item not found', 404);
    }

    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem,
    });

  } catch (error) {
    console.error('Update menu item error:', error);

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
      throw new AuthError('Menu item ID is required', 400);
    }

    // Find and delete menu item
    const menuItem = await MenuItem.findOneAndDelete({ id });

    if (!menuItem) {
      throw new AuthError('Menu item not found', 404);
    }

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    });

  } catch (error) {
    console.error('Delete menu item error:', error);

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
