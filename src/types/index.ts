export type UserRole = 'Owner' | 'Driver';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
  companyName?: string;
  driverId?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  avatarUrl?: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  driver: string;
  rcNumber: string;
  insurance: string; // Expiry Date
  permit: string; // Expiry Date
  fitness: string; // Expiry Date
  fuelType: string;
  mileage: number;
  currentLocation: string;
  status: 'Moving' | 'Idle' | 'Maintenance' | 'Delayed';
  // UI Compatibility fields
  fuelLevel?: number;
  odometer?: number;
  health?: 'Excellent' | 'Good' | 'Needs Service' | 'Critical';
  rcExpiry?: string;
  permitExpiry?: string;
  fitnessExpiry?: string;
  insuranceExpiry?: string;
}

export interface Trip {
  id: string;
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
  timestamp: string;
  vehicleId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  deadline: string;
  progress: number;
}

export interface InventoryItem {
  id: string;
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
  // UI Compatibility fields
  name?: string;
  status?: 'In Stock' | 'Low Stock' | 'Out Of Stock';
  type?: 'Raw Material' | 'Finished Goods' | 'Packaging';
}

export interface BreakItem {
  type: string;
  breakStart: string;
  breakEnd?: string;
  gps?: string;
  remarks?: string;
  duration?: number;
}

export interface TimelineItem {
  time: string;
  event: string;
  description?: string;
  gps?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeName: string;
  driverName?: string;
  driverId?: string;
  checkIn: string;
  checkOut?: string;
  checkInGPS?: string;
  checkOutGPS?: string;
  checkInWarehouse?: string;
  checkInDeviceInfo?: string;
  checkInInternetStatus?: string;
  workingHours?: number;
  breakDuration?: number;
  tripsCompleted?: number;
  distanceCovered?: number;
  fuelUsed?: number;
  overtime?: number;
  attendanceStatus?: 'Present' | 'Late' | 'Absent' | 'On Leave';
  currentStatus?: 'On Duty' | 'On Trip' | 'On Break' | 'Off Duty' | 'Emergency';
  performanceScore?: number;
  breaks?: BreakItem[];
  timeline?: TimelineItem[];
  status: 'Present' | 'Late' | 'Absent'; // Keep for backwards compatibility
  date: string;
  remarks?: string;
  attendanceId?: string;
  vehicleNumber?: string;
  checkInTime?: string;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  // UI Compatibility fields
  workerName?: string;
  avatar?: string;
  role?: string;
}

export interface PayrollRecord {
  id: string;
  employee: string;
  basicSalary: number;
  overtime: number;
  bonus: number;
  allowance: number;
  deduction: number;
  tax: number;
  finalSalary: number;
  paymentStatus: 'Pending' | 'Paid';
  paymentDate?: string;
  // UI Compatibility fields
  netPay?: number;
  employeeName?: string;
  month?: string;
  avatar?: string;
  status?: string;
}

export interface SystemNotification {
  id: string;
  type: 'Low Stock' | 'Task Assigned' | 'Trip Started' | 'Salary Pending' | 'Document Expiry' | 'Vehicle Alert' | 'System Alert' | 'Critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'Info' | 'Warning' | 'Error';
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  category: 'attendance' | 'task' | 'inventory' | 'fleet' | 'payroll' | 'gate';
}
