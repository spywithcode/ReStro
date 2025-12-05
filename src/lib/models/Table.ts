import mongoose, { Document, Schema } from 'mongoose';

export type TableStatus = 'Free' | 'Occupied' | 'Requires-Cleaning';

export interface ITable extends Document {
  id: number;
  status: TableStatus;
  capacity: number;
  qrCodeUrl: string;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>({
  id: {
    type: Number,
    required: [true, 'Table ID is required'],
    min: 1
  },
  status: {
    type: String,
    enum: ['Free', 'Occupied', 'Requires-Cleaning'],
    default: 'Free'
  },
  capacity: {
    type: Number,
    required: [true, 'Table capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [20, 'Capacity cannot exceed 20']
  },
  qrCodeUrl: {
    type: String,
    required: [true, 'QR code URL is required'],
    trim: true
  },
  restaurantId: {
    type: String,
    required: [true, 'Restaurant ID is required'],
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique table numbers per restaurant
TableSchema.index({ restaurantId: 1, id: 1 }, { unique: true });

// Indexes for better query performance
TableSchema.index({ restaurantId: 1 });
TableSchema.index({ status: 1 });
TableSchema.index({ restaurantId: 1, status: 1 });

export const Table = mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema);
