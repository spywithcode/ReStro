import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Table } from '@/lib/models/Table';
import { authenticateUser, requireRole, AuthError } from '@/lib/auth';
import { z } from 'zod';

const createTableSchema = z.object({
  id: z.number().min(1, 'Table ID must be positive'),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(20, 'Capacity cannot exceed 20'),
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
});

const updateTableStatusSchema = z.object({
  status: z.enum(['Free', 'Occupied', 'Requires-Cleaning']),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const status = searchParams.get('status');

    let query: any = {};

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    if (status) {
      query.status = status;
    }

    const tables = await Table.find(query).sort({ id: 1 });

    return NextResponse.json({
      success: true,
      data: tables,
    });

  } catch (error) {
    console.error('Get tables error:', error);

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
    const validatedData = createTableSchema.parse(body);

    // Check if table already exists for this restaurant
    const existingTable = await Table.findOne({
      restaurantId: validatedData.restaurantId,
      id: validatedData.id
    });

    if (existingTable) {
      throw new AuthError('Table with this ID already exists for this restaurant', 409);
    }

    // Generate QR code URL using external QR service
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://re-stro.vercel.app/';
    const customerUrl = `${baseUrl}/customer/login/${validatedData.restaurantId}/${validatedData.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(customerUrl)}`;

    // Create new table
    const table = new Table({
      ...validatedData,
      status: 'Free',
      qrCodeUrl,
    });

    await table.save();

    return NextResponse.json({
      success: true,
      message: 'Table created successfully',
      data: table,
    }, { status: 201 });

  } catch (error) {
    console.error('Create table error:', error);

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
    const { id, restaurantId, ...updateData } = body;

    if (!id || !restaurantId) {
      throw new AuthError('Table ID and Restaurant ID are required', 400);
    }

    const validatedData = updateTableStatusSchema.parse(updateData);

    // Find and update table
    const table = await Table.findOneAndUpdate(
      { id, restaurantId },
      { ...validatedData },
      { new: true, runValidators: true }
    );

    if (!table) {
      throw new AuthError('Table not found', 404);
    }

    return NextResponse.json({
      success: true,
      message: 'Table updated successfully',
      data: table,
    });

  } catch (error) {
    console.error('Update table error:', error);

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
    const restaurantId = searchParams.get('restaurantId');

    if (!id || !restaurantId) {
      throw new AuthError('Table ID and Restaurant ID are required', 400);
    }

    // Find and delete table
    const table = await Table.findOneAndDelete({ id, restaurantId });

    if (!table) {
      throw new AuthError('Table not found', 404);
    }

    return NextResponse.json({
      success: true,
      message: 'Table deleted successfully',
    });

  } catch (error) {
    console.error('Delete table error:', error);

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
