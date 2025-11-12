import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { authenticateUser, requireRole, AuthError } from '@/lib/auth';
import { z } from 'zod';

const createOrderSchema = z.object({
  tableNumber: z.number().min(1, 'Table number must be positive'),
  items: z.array(z.object({
    menuItemId: z.string(),
    
    quantity: z.number().min(1),
    name: z.string(),
    price: z.number().min(0),
  })).min(1, 'Order must have at least one item'),
  customer: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().min(1, 'Customer email is required'),
    phone: z.string().min(1, 'Customer phone is required'),
  }),
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  paymentMethod: z.enum(['Cash', 'Online']).optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['Placed', 'Preparing', 'Ready', 'Completed']),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const status = searchParams.get('status');
    const tableNumber = searchParams.get('tableNumber');

    let query: any = {};

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    if (status) {
      query.status = status;
    }

    if (tableNumber) {
      query.tableNumber = parseInt(tableNumber);
    }

    const orders = await Order.find(query).sort({ timestamp: -1 });

    return NextResponse.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error('Get orders error:', error);

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Calculate total
    const total = validatedData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Generate order ID
    const orderId = `ORD-${validatedData.restaurantId.slice(0, 4).toUpperCase()}-${Date.now()}`;

    // Create new order
    const order = new Order({
      id: orderId,
      ...validatedData,
      total,
      status: 'Placed',
      timestamp: new Date(),
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    }, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);

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
      throw new AuthError('Order ID is required', 400);
    }

    const validatedData = updateOrderStatusSchema.parse(updateData);

    // Find and update order
    const order = await Order.findOneAndUpdate(
      { id },
      { ...validatedData },
      { new: true, runValidators: true }
    );

    if (!order) {
      throw new AuthError('Order not found', 404);
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });

  } catch (error) {
    console.error('Update order error:', error);

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
      throw new AuthError('Order ID is required', 400);
    }

    // Find and delete order
    const order = await Order.findOneAndDelete({ id });

    if (!order) {
      throw new AuthError('Order not found', 404);
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    });

  } catch (error) {
    console.error('Delete order error:', error);

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
