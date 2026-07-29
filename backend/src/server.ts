import http from 'http';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import app from './app';
import { connectDB } from './config/db';
import { initSocket } from './sockets/telemetrySocket';

// Mongoose Models for Seeding
import User from './models/User';
import Inventory from './models/Inventory';
import Attendance from './models/Attendance';
import Salary from './models/Salary';
import Vehicle from './models/Vehicle';
import Trip from './models/Trip';

// Load Configurations
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create http server wrapper
const server = http.createServer(app);

// Initialize Socket.io telemetry handlers
initSocket(server);

// Database Seeding Logic
const seedMockDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Seeding initial owner and driver credentials...');
      
      const salt = await bcrypt.genSalt(10);
      const ownerHash = await bcrypt.hash('password123', salt);
      const driverHash = await bcrypt.hash('password123', salt);

      const defaultOwner = new User({
        fullName: 'Harsh Vardhan',
        email: 'harsh.v@smartops.com',
        mobileNumber: '9876543210',
        role: 'Owner',
        passwordHash: ownerHash,
        companyName: 'SmartOps Manufacturing Ltd.'
      });

      const defaultDriver = new User({
        fullName: 'Rajesh Kumar',
        email: 'rajesh.k@smartops.com',
        mobileNumber: '9123456789',
        role: 'Driver',
        passwordHash: driverHash,
        driverId: 'DRV-9041',
        vehicleNumber: 'MH-12-QW-9874',
        licenseNumber: 'DL-MH12-9988'
      });

      await defaultOwner.save();
      await defaultDriver.save();
      
      // Seed Inventory
      await Inventory.insertMany([
        { itemName: 'Cold Rolled Steel Sheet', category: 'Raw Materials', sku: 'STL-CR-001', quantity: 1540, minimumQuantity: 2000, warehouse: 'Pune Main', purchasePrice: 40, sellingPrice: 55, supplier: 'Tata Steel' },
        { itemName: 'Alloy Wheels 17"', category: 'Assemblies', sku: 'WHL-AL-172', quantity: 240, minimumQuantity: 100, warehouse: 'Pune Main', purchasePrice: 120, sellingPrice: 160, supplier: 'Speedline Corp' },
        { itemName: 'MCU-32 Microcontrollers', category: 'Electronics', sku: 'ELC-MC-032', quantity: 0, minimumQuantity: 500, warehouse: 'Pune Main', purchasePrice: 8, sellingPrice: 12, supplier: 'NXP Semiconductors' }
      ]);

      // Seed Vehicles
      await Vehicle.insertMany([
        { vehicleNumber: 'MH-12-QW-9874', vehicleType: 'Container Truck (18T)', driver: 'Rajesh Kumar', rcNumber: 'RC-MH-9874', insurance: '2026-12-15', permit: '2026-10-20', fitness: '2026-09-05', fuelType: 'Diesel', mileage: 6.2, currentLocation: 'Pune Gate 1', status: 'Idle' },
        { vehicleNumber: 'KA-03-MN-4512', vehicleType: 'Flatbed Trailer (24T)', driver: 'Satnam Singh', rcNumber: 'RC-KA-4512', insurance: '2026-08-11', permit: '2026-11-02', fitness: '2026-07-28', fuelType: 'Diesel', mileage: 5.5, currentLocation: 'Bengaluru Yd', status: 'Moving' }
      ]);

      // Seed Trips
      await Trip.insertMany([
        { tripNumber: 'TRP-2026-8801', vehicleNumber: 'MH-12-QW-9874', driverId: 'DRV-9041', driverName: 'Rajesh Kumar', pickupLocation: 'Warehouse A (Pune)', dropLocation: 'Distribution Center (Mumbai)', customerName: 'Tata Motors', customerPhone: '+919876543210', material: 'Engine Assemblies', weight: '15 Tons', invoiceNumber: 'INV-9041', status: 'Assigned', eta: '16:45 PM', distanceRemaining: 48 }
      ]);

      // Seed Attendances
      await Attendance.insertMany([
        {
          employeeName: 'Rajesh Kumar',
          driverName: 'Rajesh Kumar',
          driverId: 'DRV-9041',
          checkIn: '08:45 AM',
          checkOut: '06:15 PM',
          checkInGPS: '18.5204, 73.8567',
          checkOutGPS: '19.0760, 72.8777',
          checkInWarehouse: 'Warehouse A (Pune)',
          checkInDeviceInfo: 'Samsung Galaxy S22 Ultra',
          checkInInternetStatus: 'Connected (5G)',
          workingHours: 9.5,
          breakDuration: 30,
          tripsCompleted: 1,
          distanceCovered: 148,
          fuelUsed: 24,
          overtime: 1.5,
          attendanceStatus: 'Late',
          currentStatus: 'Off Duty',
          performanceScore: 90,
          status: 'Late',
          date: new Date().toISOString().split('T')[0],
          remarks: 'Completed Pune-Mumbai transit container load',
          breaks: [
            {
              type: 'Lunch Break',
              breakStart: '12:30 PM',
              breakEnd: '01:00 PM',
              gps: '18.7502, 73.4501',
              remarks: 'Rest stop at highway food court',
              duration: 30
            }
          ],
          timeline: [
            { time: '08:45 AM', event: 'Driver Logged In', description: 'Session validated via OAuth.' },
            { time: '08:47 AM', event: 'Start Duty', description: 'Checked in at Pune Warehouse A.', gps: '18.5204, 73.8567' },
            { time: '08:50 AM', event: 'Trip Assigned', description: 'Assigned trip TRP-2026-8801.' },
            { time: '09:00 AM', event: 'Trip Started', description: 'Departed yard in vehicle MH-12-QW-9874.' },
            { time: '12:30 PM', event: 'Lunch Break', description: 'Halted at Highway plaza.', gps: '18.7502, 73.4501' },
            { time: '01:00 PM', event: 'Resume Duty', description: 'Transit tracking resumed.' },
            { time: '04:45 PM', event: 'Delivery Completed', description: 'Consignment handed to consignee.' },
            { time: '05:00 PM', event: 'POD Uploaded', description: 'Cargo photo and consignee signature uploaded.' },
            { time: '06:10 PM', event: 'End Trip', description: 'Arrived at Mumbai terminal.' },
            { time: '06:15 PM', event: 'End Duty', description: 'Clocked out. Shift logs updated.', gps: '19.0760, 72.8777' }
          ]
        },
        {
          employeeName: 'Satnam Singh',
          driverName: 'Satnam Singh',
          driverId: 'DRV-9042',
          checkIn: '08:20 AM',
          checkInGPS: '12.9716, 77.5946',
          checkInWarehouse: 'Warehouse B (Bengaluru)',
          checkInDeviceInfo: 'OnePlus 10 Pro',
          checkInInternetStatus: 'Connected (WiFi)',
          workingHours: 6.5,
          breakDuration: 15,
          tripsCompleted: 0,
          distanceCovered: 110,
          fuelUsed: 18,
          overtime: 0,
          attendanceStatus: 'Present',
          currentStatus: 'On Trip',
          performanceScore: 98,
          status: 'Present',
          date: new Date().toISOString().split('T')[0],
          remarks: 'Dispatched to Chennai DC',
          breaks: [
            {
              type: 'Fuel Stop',
              breakStart: '11:15 AM',
              breakEnd: '11:30 AM',
              gps: '12.8540, 77.9540',
              remarks: 'Refuelled 40L diesel',
              duration: 15
            }
          ],
          timeline: [
            { time: '08:20 AM', event: 'Start Duty', description: 'Clocked in. Location: Bengaluru Gate 2.', gps: '12.9716, 77.5946' },
            { time: '08:30 AM', event: 'Trip Assigned', description: 'Assigned trip TRP-2026-8802.' },
            { time: '08:45 AM', event: 'Trip Started', description: 'Departed in KA-03-MN-4512.' },
            { time: '11:15 AM', event: 'Fuel Stop', description: 'Halted at HP Fuel Pump.', gps: '12.8540, 77.9540' },
            { time: '11:30 AM', event: 'Resume Duty', description: 'Transit tracking resumed.' }
          ]
        }
      ]);

      // Seed Salaries
      await Salary.insertMany([
        { employee: 'Rajesh Kumar', basicSalary: 28000, overtime: 2400, bonus: 1000, allowance: 500, deduction: 300, tax: 1500, finalSalary: 30100, paymentStatus: 'Pending' }
      ]);

      console.log('Database seeding successfully completed.');
    }
  } catch (err: any) {
    console.error('Database seeding failed:', err.message);
  }
};

// Bootstrap Server
connectDB().then(() => {
  seedMockDatabase();
  server.listen(PORT, () => {
    console.log(`SmartOps Express Server listening on port ${PORT}`);
  });
});
