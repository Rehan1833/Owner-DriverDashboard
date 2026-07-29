import mongoose, { Schema, Document } from 'mongoose';

<<<<<<< HEAD
export interface ITrip extends Document {
  tripNumber: string;
  vehicleNumber: string;
=======
export interface ITripStop {
  _id?: string;
  sequence: number;
  address: string;
  latitude: number;
  longitude: number;
  status: 'Pending' | 'Arrived' | 'Completed' | 'Skipped';
  arrivedAt?: Date;
  completedAt?: Date;
  stopReason?: string;
  podId?: string;
  notes?: string;
}

export interface ILocationPoint {
  lat: number;
  lng: number;
  timestamp: Date;
  address?: string;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

export interface ITrip extends Document {
  tripNumber: string;
  vehicleNumber: string;
  vehicleId?: string;
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
  driverId: string;
  driverName: string;
  pickupLocation: string;
  dropLocation: string;
  customerName: string;
  customerPhone: string;
  material: string;
  weight: string;
  invoiceNumber: string;
<<<<<<< HEAD
  status: 'Assigned' | 'Accepted' | 'Started' | 'Reached Pickup' | 'Loaded' | 'In Transit' | 'Reached Destination' | 'Delivered' | 'Completed' | 'Delayed';
=======
  priority: 'Normal' | 'High' | 'Urgent';
  cargo?: {
    description?: string;
    quantity?: number;
    weight?: string;
  };
  stops: ITripStop[];
  scheduledStart?: Date;
  expectedEnd?: Date;
  notes?: string;
  status: 'Draft' | 'Assigned' | 'Accepted' | 'Started' | 'Reached Pickup' | 'Loaded' | 'In Transit' | 'At Stop' | 'Reached Destination' | 'Delivered' | 'Completed' | 'Cancelled' | 'Delayed' | 'Incident Reported';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
  eta: string;
  distanceRemaining: number;
  stopReason?: string;
  deliveryPhoto?: string[];
  signatureData?: string;
  timestamp: Date;
<<<<<<< HEAD
}

const TripSchema = new Schema<ITrip>({
  tripNumber: { type: String, required: true, unique: true },
  vehicleNumber: { type: String, required: true },
=======
  startedAt?: Date;
  completedAt?: Date;
  // Google Maps & GPS Telemetry Fields
  currentLocation?: string;
  currentAddress?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  lastGpsUpdate?: Date;
  pickupCoordinates?: { lat: number; lng: number };
  dropCoordinates?: { lat: number; lng: number };
  locationHistory?: ILocationPoint[];
}

const TripStopSchema = new Schema<ITripStop>({
  sequence: { type: Number, required: true },
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Arrived', 'Completed', 'Skipped'],
    default: 'Pending'
  },
  arrivedAt: { type: Date },
  completedAt: { type: Date },
  stopReason: { type: String },
  podId: { type: String },
  notes: { type: String }
});

const TripSchema = new Schema<ITrip>({
  tripNumber: { type: String, required: true, unique: true },
  vehicleNumber: { type: String, required: true },
  vehicleId: { type: String },
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
  driverId: { type: String, required: true },
  driverName: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
<<<<<<< HEAD
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
=======
  customerName: { type: String, default: 'Logistics Client' },
  customerPhone: { type: String, default: '9876543210' },
  material: { type: String, default: 'General Freight' },
  weight: { type: String, default: '1.5 Tons' },
  invoiceNumber: { type: String, default: 'INV-AUTOMATED' },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  cargo: {
    description: { type: String },
    quantity: { type: Number },
    weight: { type: String }
  },
  stops: [TripStopSchema],
  scheduledStart: { type: Date },
  expectedEnd: { type: Date },
  notes: { type: String },
  status: {
    type: String,
    enum: ['Draft', 'Assigned', 'Accepted', 'Started', 'Reached Pickup', 'Loaded', 'In Transit', 'At Stop', 'Reached Destination', 'Delivered', 'Completed', 'Cancelled', 'Delayed', 'Incident Reported'],
    default: 'Assigned'
  },
  eta: { type: String, default: '30 Mins' },
  distanceRemaining: { type: Number, default: 15.0 },
  stopReason: { type: String },
  deliveryPhoto: [{ type: String }],
  signatureData: { type: String },
  timestamp: { type: Date, default: Date.now },
  startedAt: { type: Date },
  completedAt: { type: Date },
  // Telemetry & GPS fields
  currentLocation: { type: String },
  currentAddress: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  accuracy: { type: Number },
  speed: { type: Number },
  heading: { type: Number },
  lastGpsUpdate: { type: Date },
  pickupCoordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  dropCoordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  locationHistory: [
    {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
      address: { type: String },
      speed: { type: Number },
      heading: { type: Number },
      accuracy: { type: Number }
    }
  ]
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
}, {
  timestamps: true
});

export default mongoose.model<ITrip>('Trip', TripSchema);
