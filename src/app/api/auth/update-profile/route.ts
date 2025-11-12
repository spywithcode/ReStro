import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { authenticateUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const { user } = await authenticateUser(request);

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const imageFile = formData.get('image') as File | null;

    // Validate input
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email is already in use' },
        { status: 400 }
      );
    }

    let imageBase64 = null;
    if (imageFile) {
      // Validate image file
      if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json(
          { success: false, message: 'Image file too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }

      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, message: 'Invalid file type. Only images are allowed.' },
          { status: 400 }
        );
      }

      // Convert to base64
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageBase64 = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
    }

    // Update user profile
    const updateData: any = {
      name,
      email,
      phone,
      updatedAt: new Date()
    };

    if (imageBase64) {
      updateData.image = imageBase64;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        restaurantId: updatedUser.restaurantId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        image: updatedUser.image
      }
    });

  } catch (error: any) {
    console.error('Update profile error:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: 'Invalid data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
