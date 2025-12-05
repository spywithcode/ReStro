import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { User } from './models/User';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  restaurantId?: string;
}

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new AuthError('Invalid or expired token');
  }
};

// Get token from request (cookie or authorization header)
export const getTokenFromRequest = (request: NextRequest): string | null => {
  // Try to get from cookie first
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Try to get from authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

// Authenticate user and return user data
export const authenticateUser = async (request: NextRequest): Promise<{ user: any; token: string }> => {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw new AuthError('No authentication token provided', 401);
  }

  try {
    const decoded = verifyToken(token);

    // Get user from database (excluding password)
    const user = await User.findById(decoded.userId).select('-hashedPassword');
    if (!user) {
      throw new AuthError('User not found', 401);
    }

    return { user, token };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Invalid authentication token', 401);
  }
};

// Check if user has required role
export const requireRole = (allowedRoles: string[]) => {
  return async (request: NextRequest) => {
    const { user } = await authenticateUser(request);
    if (!allowedRoles.includes(user.role)) {
      throw new AuthError('Insufficient permissions', 403);
    }
    return { user };
  };
};

// Check if user owns the restaurant
export const requireRestaurantOwner = (restaurantId: string) => {
  return async (request: NextRequest) => {
    const { user } = await authenticateUser(request);
    if (user.role !== 'admin' || user.restaurantId !== restaurantId) {
      throw new AuthError('Access denied. You do not own this restaurant.', 403);
    }
    return { user };
  };
};
