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
    // 1. Seed Vehicles if empty
    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      await Vehicle.insertMany([
        {
          vehicleNumber: 'MH-12-QW-9874',
          vehicleType: 'Heavy Freight Truck (10 Ton)',
          driver: 'Ramesh Sharma',
          rcNumber: 'RC-MH12-2024-9981',
          insurance: 'INS-HDFC-99281',
          permit: 'National Freight Permit',
          fitness: 'Valid (Pass)',
          fuelType: 'Diesel',
          mileage: 8.5,
          currentLocation: 'Pune Central Logistics Hub (18.5204, 73.8567)',
          status: 'Moving'
        },
        {
          vehicleNumber: 'MH-14-AB-9988',
          vehicleType: 'Medium Express Container (5 Ton)',
          driver: 'Rajesh Kumar',
          rcNumber: 'RC-MH14-2023-4412',
          insurance: 'INS-ICICI-44102',
          permit: 'State Intercity Permit',
          fitness: 'Valid (Pass)',
          fuelType: 'EV Battery Pack',
          mileage: 18.2,
          currentLocation: 'Chakan Industrial Yard (18.7602, 73.8612)',
          status: 'Idle'
        },
        {
          vehicleNumber: 'MH-43-CC-1122',
          vehicleType: 'Refrigerated Cargo Van (2 Ton)',
          driver: 'Sunita Patil',
          rcNumber: 'RC-MH43-2025-1100',
          insurance: 'INS-BAJAJ-11029',
          permit: 'Perishable Goods Transit',
          fitness: 'Valid (Pass)',
          fuelType: 'CNG Dual',
          mileage: 14.0,
          currentLocation: 'Bhiwandi Distribution Center (19.2968, 73.0631)',
          status: 'Moving'
        }
      ]);
      console.log('✅ Seeded initial Vehicles into MongoDB.');
    }

    // 2. Seed Inventory if empty
    const inventoryCount = await Inventory.countDocuments();
    if (inventoryCount === 0) {
      await Inventory.insertMany([
        {
          itemName: 'High-Pressure Hydraulic Cylinder',
          category: 'Heavy Machinery Components',
          sku: 'SKU-HYD-9981',
          quantity: 142,
          minimumQuantity: 30,
          warehouse: 'Pune Main Central Hub',
          purchasePrice: 12500,
          sellingPrice: 18900,
          supplier: 'Bosch Rexroth Corp',
          batchNumber: 'BATCH-2026-Q1',
          expiryDate: '2030-12-31',
          description: 'Industrial heavy load 250 Bar hydraulic actuator.'
        },
        {
          itemName: 'Precision Planetary Gearbox 10:1',
          category: 'Powertrain Assemblies',
          sku: 'SKU-GEAR-4412',
          quantity: 85,
          minimumQuantity: 20,
          warehouse: 'Chakan Assembly Plant',
          purchasePrice: 8200,
          sellingPrice: 13500,
          supplier: 'ZF Transmission India',
          batchNumber: 'BATCH-2026-Q2',
          expiryDate: '2035-06-30',
          description: 'High torque low backlash reduction gearbox.'
        },
        {
          itemName: 'Solid Rubber All-Terrain Fleet Tire (22.5")',
          category: 'Vehicle Spares',
          sku: 'SKU-TIRE-1122',
          quantity: 210,
          minimumQuantity: 50,
          warehouse: 'Bhiwandi Transit Terminal',
          purchasePrice: 14500,
          sellingPrice: 21000,
          supplier: 'MRF Commercial Heavy',
          batchNumber: 'BATCH-MRF-881',
          expiryDate: '2031-01-01',
          description: '16-Ply heavy load commercial radial tire.'
        }
      ]);
      console.log('✅ Seeded initial Inventory items into MongoDB.');
    }

    // 3. Seed Trips if empty
    const tripCount = await Trip.countDocuments();
    if (tripCount === 0) {
      await Trip.insertMany([
        {
          tripNumber: 'TRP-2026-001',
          vehicleNumber: 'MH-12-QW-9874',
          driverId: 'u-driver-101',
          driverName: 'Ramesh Sharma',
          pickupLocation: 'Pune Central Logistics Depot',
          dropLocation: 'Chakan Automotive Industrial Zone',
          customerName: 'Tata Motors Assembly Division',
          customerPhone: '+91 98220 11223',
          material: 'Hydraulic Actuators & Powertrain Components',
          weight: '4.8 Tons',
          invoiceNumber: 'INV-2026-8801',
          status: 'In Transit',
          eta: '14:30 PM (25 Mins)',
          distanceRemaining: 18.4,
          timestamp: new Date()
        },
        {
          tripNumber: 'TRP-2026-002',
          vehicleNumber: 'MH-43-CC-1122',
          driverId: 'u-driver-102',
          driverName: 'Sunita Patil',
          pickupLocation: 'Bhiwandi Cold Storage Hub',
          dropLocation: 'Vashi Wholesale Terminal',
          customerName: 'Reliance Retail Logistics',
          customerPhone: '+91 98900 44332',
          material: 'Cold Storage Perishable Produce',
          weight: '1.9 Tons',
          invoiceNumber: 'INV-2026-8802',
          status: 'Assigned',
          eta: '16:00 PM (1 Hr 15 Mins)',
          distanceRemaining: 34.0,
          timestamp: new Date()
        }
      ]);
      console.log('✅ Seeded initial Trips into MongoDB.');
    }

    // 4. Seed Salaries if empty
    const salaryCount = await Salary.countDocuments();
    if (salaryCount === 0) {
      await Salary.insertMany([
        {
          employee: 'Ramesh Sharma (Senior Operator)',
          basicSalary: 35000,
          overtime: 4200,
          bonus: 3000,
          allowance: 2500,
          deduction: 1500,
          tax: 2200,
          finalSalary: 41000,
          paymentStatus: 'Paid',
          paymentDate: '2026-07-01'
        },
        {
          employee: 'Rajesh Kumar (Express Driver)',
          basicSalary: 28000,
          overtime: 2100,
          bonus: 2000,
          allowance: 1800,
          deduction: 1000,
          tax: 1500,
          finalSalary: 31400,
          paymentStatus: 'Pending',
          paymentDate: undefined
        }
      ]);
      console.log('✅ Seeded initial Salaries into MongoDB.');
    }

    // 5. Seed Attendance if empty
    const attendanceCount = await Attendance.countDocuments();
    if (attendanceCount === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      await Attendance.create({
        employeeName: 'Ramesh Sharma',
        driverName: 'Ramesh Sharma',
        driverId: 'u-driver-101',
        vehicleNumber: 'MH-12-QW-9874',
        checkIn: '08:00 AM',
        checkInTime: '08:00 AM',
        checkInGPS: '18.5204, 73.8567',
        checkInWarehouse: 'Pune Central Logistics Depot',
        checkInDeviceInfo: 'Samsung Galaxy Tab Active 4',
        checkInInternetStatus: 'Connected (5G)',
        workingHours: 6.5,
        breakDuration: 35,
        tripsCompleted: 2,
        distanceCovered: 124.5,
        fuelUsed: 14.8,
        overtime: 0,
        attendanceStatus: 'Present',
        currentStatus: 'On Duty',
        performanceScore: 98,
        status: 'Present',
        date: todayStr,
        breaks: [
          {
            type: 'Lunch Break',
            breakStart: '12:30 PM',
            breakEnd: '01:05 PM',
            gps: '18.6200, 73.8100',
            remarks: 'Halted at Highway Toll Plaza Rest Stop',
            duration: 35
          }
        ],
        timeline: [
          { time: '08:00 AM', event: 'Start Duty', description: 'Shift initialized at Pune Central Depot', gps: '18.5204, 73.8567' },
          { time: '12:30 PM', event: 'Lunch Break', description: 'Halted for lunch', gps: '18.6200, 73.8100' },
          { time: '01:05 PM', event: 'Resume Duty', description: 'Resumed route transit', gps: '18.6200, 73.8100' }
        ]
      });
      console.log('✅ Seeded initial Attendance records into MongoDB.');
    }
  } catch (err: any) {
    console.error('Database seeding warning:', err.message);
  }
};

import { validateEmailEnvironment } from './utils/otpService';

// Bootstrap Server
connectDB().then(() => {
  seedMockDatabase();
  validateEmailEnvironment();
  server.listen(PORT, () => {
    console.log(`SmartOps Express Server listening on port ${PORT}`);
  });
});

