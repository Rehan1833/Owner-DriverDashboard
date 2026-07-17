import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  tripNumber: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  pickupLocation: string;
  dropLocation: string;
  customerName: string;
  customerPhone: string;
  material: string;
  weight: string;
  invoiceNumber: string;
  status: 'Assigned' | 'Accepted' | 'Started' | 'Reached Pickup' | 'Loaded' | 'In Transit' | 'Reached Destination' | 'Delivered' | 'Completed' | 'Delayed';
  eta: string;
  distanceRemaining: number;
  stopReason?: string;
  deliveryPhoto?: string[];
  signatureData?: string;
  timestamp: Date;
}

const TripSchema = new Schema<ITrip>({
  tripNumber: { type: String, required: true, unique: true },
  vehicleNumber: { type: String, required: true },
  driverId: { type: String, required: true },
  driverName: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  material: { type: String, required: true },
  weight: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ['Assigned', 'Accepted', 'Started', 'Reached Pickup', 'Loaded', 'In Transit', 'Reached Destination', 'Delivered', 'Completed', 'Delayed'],
    default: 'Assigned'
  },
  eta: { type: String, required: true },
  distanceRemaining: { type: Number, required: true },
  stopReason: { type: String },
  deliveryPhoto: [{ type: String }],
  signatureData: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<ITrip>('Trip', TripSchema);
