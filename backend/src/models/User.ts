import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  email: string;
  mobileNumber?: string;
  role: 'Owner' | 'Driver';
  passwordHash?: string;
  googleId?: string;
  provider?: 'local' | 'google';
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  otpCode?: string;
  otpExpiresAt?: Date;
  verifiedAt?: Date;
  securityQuestion?: string;
  securityAnswerHash?: string;
  // Company Reference — root entity for data isolation
  companyId?: string;
  // Owner Fields
  companyName?: string;
  // Driver Fields
  driverId?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  avatarUrl?: string;
  comparePassword: (password: string) => Promise<boolean>;
  compareSecurityAnswer: (answer: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  mobileNumber: { type: String, required: false },
  role: { type: String, enum: ['Owner', 'Driver'], required: true },
  passwordHash: { type: String, required: false },
  googleId: { type: String, unique: true, sparse: true },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiresAt: { type: Date },
  verifiedAt: { type: Date },
  securityQuestion: { type: String },
  securityAnswerHash: { type: String },
  companyId: { type: String, index: true, sparse: true },
  companyName: { type: String },
  driverId: { type: String, unique: true, sparse: true },
  vehicleNumber: { type: String },
  licenseNumber: { type: String },
  avatarUrl: { type: String }
}, {
  timestamps: true
});

// Password verification method
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

// Security Answer verification method
UserSchema.methods.compareSecurityAnswer = async function(answer: string): Promise<boolean> {
  if (!this.securityAnswerHash) return false;
  return bcrypt.compare(answer.toLowerCase().trim(), this.securityAnswerHash);
};

export default mongoose.model<IUser>('User', UserSchema);
