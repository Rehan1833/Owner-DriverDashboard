import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  itemName: string;
  category: string;
  sku: string;
  quantity: number;
  minimumQuantity: number;
  warehouse: string;
  purchasePrice: number;
  sellingPrice: number;
  supplier: string;
  batchNumber?: string;
  expiryDate?: string;
  description?: string;
}

const InventorySchema = new Schema<IInventory>({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  minimumQuantity: { type: Number, required: true, default: 0 },
  warehouse: { type: String, required: true },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  supplier: { type: String, required: true },
  batchNumber: { type: String },
  expiryDate: { type: String },
  description: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IInventory>('Inventory', InventorySchema);
