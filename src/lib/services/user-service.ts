import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class UserService {
  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'admin' | 'staff' | 'customer';
    restaurantId?: string;
  }) {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = new User({
      ...userData,
      hashedPassword,
    });

    return await user.save();
  }

  static async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  static async findUserById(id: string) {
    return await User.findById(id);
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async generateToken(user: any) {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  static async verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async updateUser(id: string, updateData: Partial<typeof User>) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteUser(id: string) {
    return await User.findByIdAndDelete(id);
  }
}
