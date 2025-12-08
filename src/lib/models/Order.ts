import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus = 'Placed' | 'Preparing' | 'Ready' | 'Completed';

export interface IOrderItem {
  menuItemId: string;
  quantity: number;
  name: string;
  price: number;
}

export interface ICustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface IOrder extends Document {
  id: string;
  tableNumber: number;
  items: IOrderItem[];
  status: OrderStatus;
  total: number;
  timestamp: Date;
  paymentMethod?: 'Cash' | 'Online';
  customer: ICustomerInfo;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  menuItemId: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const CustomerInfoSchema = new Schema<ICustomerInfo>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tableNumber: {
    type: Number,
    required: [true, 'Table number is required'],
    min: 1
  },
  items: {
    type: [OrderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items: IOrderItem[]) {
        return items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  status: {
    type: String,
    enum: ['Placed', 'Preparing', 'Ready', 'Completed'],
    default: 'Placed'
  },
  total: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total must be positive']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Online']
  },
  customer: {
    type: CustomerInfoSchema,
    required: [true, 'Customer information is required']
  },
  restaurantId: {
    type: String,
    required: [true, 'Restaurant ID is required'],
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
OrderSchema.index({ restaurantId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ timestamp: -1 });
OrderSchema.index({ restaurantId: 1, status: 1 });
OrderSchema.index({ restaurantId: 1, timestamp: -1 });

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
