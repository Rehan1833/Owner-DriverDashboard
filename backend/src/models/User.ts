import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  email: string;
  mobileNumber: string;
  role: 'Owner' | 'Driver';
  passwordHash: string;
  // Owner Fields
  companyName?: string;
  // Driver Fields
  driverId?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  mobileNumber: { type: String, required: true },
  role: { type: String, enum: ['Owner', 'Driver'], required: true },
  passwordHash: { type: String, required: true },
  companyName: { type: String },
  driverId: { type: String, unique: true, sparse: true },
  vehicleNumber: { type: String },
  licenseNumber: { type: String }
}, {
  timestamps: true
});

// Password verification method
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema);
