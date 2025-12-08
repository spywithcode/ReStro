import { Table } from '@/lib/models/Table';

export class TableService {
  static async getAllTables() {
    return await Table.find({});
  }

  static async getTablesByRestaurant(restaurantId: string) {
    return await Table.find({ restaurantId });
  }

  static async getTableById(id: number) {
    return await Table.findOne({ id });
  }

  static async createTable(tableData: {
    id: number;
    capacity: number;
    status: string;
    qrCode?: string;
    restaurantId: string;
  }) {
    const table = new Table(tableData);
    return await table.save();
  }

  static async updateTableStatus(restaurantId: string, tableId: number, status: string) {
    return await Table.findOneAndUpdate(
      { restaurantId, id: tableId },
      { status },
      { new: true }
    );
  }

  static async deleteTable(id: number) {
    return await Table.findOneAndDelete({ id });
  }

  static async getAvailableTables(restaurantId: string) {
    return await Table.find({ restaurantId, status: 'Available' });
  }

  static async getOccupiedTables(restaurantId: string) {
    return await Table.find({ restaurantId, status: 'Occupied' });
  }
}
