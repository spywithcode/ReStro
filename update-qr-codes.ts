import mongoose from 'mongoose';
import { connectDB } from './src/lib/db';
import { Table } from './src/lib/models/Table';

async function updateQrCodes() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const baseUrl = 'https://re-stro.vercel.app';

    // Find all tables
    const tables = await Table.find({});
    console.log(`Found ${tables.length} tables to update.`);

    for (const table of tables) {
      const url = `${baseUrl}/customer/login/${table.restaurantId}/${table.id}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}`;

      await Table.updateOne(
        { _id: table._id },
        { qrCodeUrl }
      );
      console.log(`Updated QR code for table ${table.id} in restaurant ${table.restaurantId}`);
    }

    console.log('QR code update completed successfully!');
  } catch (error) {
    console.error('Update error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

updateQrCodes();
