import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db';

// Mongoose Models
import User from './models/User';
import Inventory from './models/Inventory';
import Attendance from './models/Attendance';
import Salary from './models/Salary';
import Vehicle from './models/Vehicle';
import Trip from './models/Trip';

// Load Config
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'smartops_super_secret_key_123!';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth Middleware
interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
      req.userId = decoded.id;
      req.userRole = decoded.role;
      next();
    });
  } else {
    res.status(401).json({ message: 'Authorization header required.' });
  }
};

// ==========================================
// AUTH ENDPOINTS
// ==========================================

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, mobileNumber, role, password, companyName, driverId, vehicleNumber, licenseNumber } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      mobileNumber,
      role,
      passwordHash,
      companyName,
      driverId,
      vehicleNumber,
      licenseNumber
    });

    await newUser.save();
    
    // Create JWT
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '12h' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.companyName,
        driverId: newUser.driverId,
        vehicleNumber: newUser.vehicleNumber
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        driverId: user.driverId,
        vehicleNumber: user.vehicleNumber
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot / Reset Password Mocks
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json({ message: `Reset link dispatched to ${email}. Token simulated.` });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  res.json({ message: 'Password has been successfully updated.' });
});

// ==========================================
// INVENTORY CRUD
// ==========================================
app.get('/api/inventory', async (req: Request, res: Response) => {
  const items = await Inventory.find();
  res.json(items);
});

app.post('/api/inventory', async (req: Request, res: Response) => {
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/inventory/:id', async (req: Request, res: Response) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/inventory/:id', async (req: Request, res: Response) => {
  await Inventory.findByIdAndDelete(req.params.id);
  res.json({ message: 'Item deleted.' });
});

// ==========================================
// DRIVER DUTY & ATTENDANCE MANAGEMENT SYSTEM APIs
// ==========================================

// GET all logs
app.get('/api/attendance', async (req: Request, res: Response) => {
  try {
    const logs = await Attendance.find().sort({ date: -1, createdAt: -1 });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET historical log list
app.get('/api/attendance/history', async (req: Request, res: Response) => {
  try {
    const logs = await Attendance.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET live active duty dashboard list
app.get('/api/attendance/live', async (req: Request, res: Response) => {
  try {
    const logs = await Attendance.find({
      currentStatus: { $in: ['On Duty', 'On Trip', 'On Break', 'Emergency'] }
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET analytics data for Recharts
app.get('/api/attendance/analytics', async (req: Request, res: Response) => {
  try {
    const logs = await Attendance.find();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET log for individual driver
app.get('/api/attendance/:driverId', async (req: Request, res: Response) => {
  try {
    const logs = await Attendance.find({ driverId: req.params.driverId }).sort({ date: -1 });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST Start Duty
app.post('/api/attendance/start-duty', async (req: Request, res: Response) => {
  try {
    const { 
      driverId, 
      driverName, 
      employeeName, 
      checkInGPS, 
      checkInWarehouse, 
      checkInDeviceInfo, 
      checkInInternetStatus,
      vehicleNumber,
      latitude,
      longitude,
      address,
      checkInTime,
      browserInfo,
      deviceType
    } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    let record = await Attendance.findOne({ driverId, date: todayStr });
    if (record) {
      return res.status(400).json({ message: 'Duty has already been initialized for today.' });
    }

    const finalTime = checkInTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    // Check if late (Shift starts at 08:30 AM)
    let attendanceStatus: 'Present' | 'Late' | 'Absent' = 'Present';
    const [timeVal, modifier] = finalTime.split(' ');
    const [hours, minutes] = timeVal.split(':').map(Number);
    let checkInHour = hours;
    if (modifier === 'PM' && hours !== 12) checkInHour += 12;
    if (modifier === 'AM' && hours === 12) checkInHour = 0;

    if (checkInHour > 8 || (checkInHour === 8 && minutes > 30)) {
      attendanceStatus = 'Late';
    }

    const attendanceObjectId = new mongoose.Types.ObjectId();

    record = new Attendance({
      _id: attendanceObjectId,
      attendanceId: attendanceObjectId.toString(),
      employeeName: employeeName || driverName || 'Driver Operator',
      driverName: driverName || employeeName || 'Driver Operator',
      driverId,
      vehicleNumber: vehicleNumber || 'MH-12-QW-9874',
      checkIn: finalTime,
      checkInTime: finalTime,
      checkInGPS: checkInGPS || (latitude && longitude ? `${latitude}, ${longitude}` : ''),
      latitude: latitude,
      longitude: longitude,
      address: address || checkInWarehouse || 'Primary Warehouse Yard',
      checkInWarehouse: address || checkInWarehouse || 'Primary Warehouse Yard',
      checkInDeviceInfo: deviceType || checkInDeviceInfo || 'Android Device',
      checkInInternetStatus: checkInInternetStatus || 'Connected',
      workingHours: 0,
      breakDuration: 0,
      tripsCompleted: 0,
      distanceCovered: 0,
      fuelUsed: 0,
      overtime: 0,
      attendanceStatus,
      currentStatus: 'On Duty',
      performanceScore: 100,
      status: attendanceStatus, // backwards compatibility
      date: todayStr,
      breaks: [],
      timeline: [
        {
          time: finalTime,
          event: 'Driver Logged In',
          description: `Device: ${deviceType || checkInDeviceInfo || 'Unknown'}. Browser: ${browserInfo || 'Unknown'}. Internet: ${checkInInternetStatus || 'Active'}.`,
          gps: checkInGPS || (latitude && longitude ? `${latitude}, ${longitude}` : '')
        },
        {
          time: finalTime,
          event: 'Start Duty',
          description: `Duty successfully authorized at ${address || checkInWarehouse || 'Warehouse Point'}.`,
          gps: checkInGPS || (latitude && longitude ? `${latitude}, ${longitude}` : '')
        }
      ]
    });

    await record.save();
    io.emit('telemetryUpdate', { action: 'start-duty', driverId, record });
    res.status(201).json(record);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST Start Break
app.post('/api/attendance/start-break', async (req: Request, res: Response) => {
  try {
    const { driverId, type, remarks, gps } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const record = await Attendance.findOne({ driverId, date: todayStr });
    if (!record) {
      return res.status(404).json({ message: 'Active duty sheet for today not found.' });
    }

    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    record.currentStatus = 'On Break';
    record.breaks.push({
      type,
      breakStart: timeStr,
      gps,
      remarks,
      duration: 0
    } as any);

    record.timeline.push({
      time: timeStr,
      event: 'Lunch Break',
      description: `Initiated halt: ${type}. Remarks: ${remarks || 'Standard Stop'}.`,
      gps
    } as any);

    await record.save();
    io.emit('telemetryUpdate', { action: 'start-break', driverId, record });
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST End Break
app.post('/api/attendance/end-break', async (req: Request, res: Response) => {
  try {
    const { driverId, gps } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const record = await Attendance.findOne({ driverId, date: todayStr });
    if (!record) {
      return res.status(404).json({ message: 'Active duty sheet not found.' });
    }

    const activeBreak = record.breaks.find(b => !b.breakEnd);
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (activeBreak) {
      activeBreak.breakEnd = timeStr;
      
      // Calculate minutes difference
      const [sTime, sMod] = activeBreak.breakStart.split(' ');
      const [sH, sM] = sTime.split(':').map(Number);
      let startMin = sH * 60 + sM;
      if (sMod === 'PM' && sH !== 12) startMin += 720;
      if (sMod === 'AM' && sH === 12) startMin -= 720;

      const [eTime, eMod] = timeStr.split(' ');
      const [eH, eM] = eTime.split(':').map(Number);
      let endMin = eH * 60 + eM;
      if (eMod === 'PM' && eH !== 12) endMin += 720;
      if (eMod === 'AM' && eH === 12) endMin -= 720;

      const duration = Math.max(0, endMin - startMin);
      activeBreak.duration = duration;
      record.breakDuration = (record.breakDuration || 0) + duration;
    }

    record.currentStatus = 'On Duty';
    record.timeline.push({
      time: timeStr,
      event: 'Resume Duty',
      description: `Resumed active operations. Break duration was ${activeBreak?.duration || 0} mins.`,
      gps
    } as any);

    await record.save();
    io.emit('telemetryUpdate', { action: 'end-break', driverId, record });
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST End Duty
app.post('/api/attendance/end-duty', async (req: Request, res: Response) => {
  try {
    const { driverId, checkOutGPS, tripsCompleted, distanceCovered, fuelUsed, checkOutTime, latitude, longitude, address } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const record = await Attendance.findOne({ driverId, date: todayStr });
    if (!record) {
      return res.status(404).json({ message: 'Duty has not been started today.' });
    }

    const finalCheckOutTime = checkOutTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Calculate active shift working hours
    const [sTime, sMod] = record.checkIn.split(' ');
    const [sH, sM] = sTime.split(':').map(Number);
    let startMin = sH * 60 + sM;
    if (sMod === 'PM' && sH !== 12) startMin += 720;
    if (sMod === 'AM' && sH === 12) startMin -= 720;

    const [eTime, eMod] = finalCheckOutTime.split(' ');
    const [eH, eM] = eTime.split(':').map(Number);
    let endMin = eH * 60 + eM;
    if (eMod === 'PM' && eH !== 12) endMin += 720;
    if (eMod === 'AM' && eH === 12) endMin -= 720;

    const totalMinutes = Math.max(0, endMin - startMin);
    const hours = Number((totalMinutes / 60).toFixed(2));
    const overtime = Math.max(0, hours - 8);

    record.checkOut = finalCheckOutTime;
    record.checkOutTime = finalCheckOutTime;
    record.checkOutGPS = checkOutGPS || (latitude && longitude ? `${latitude}, ${longitude}` : '');
    if (latitude !== undefined) record.latitude = latitude;
    if (longitude !== undefined) record.longitude = longitude;
    if (address !== undefined) record.address = address;
    record.workingHours = hours;
    record.overtime = Number(overtime.toFixed(2));
    record.currentStatus = 'Off Duty';
    record.tripsCompleted = tripsCompleted || record.tripsCompleted;
    record.distanceCovered = distanceCovered || record.distanceCovered;
    record.fuelUsed = fuelUsed || record.fuelUsed;

    // Deduct score for late checking
    let score = 100;
    if (record.attendanceStatus === 'Late') score -= 10;
    if (record.breakDuration && record.breakDuration > 60) score -= 5;
    record.performanceScore = score;

    record.timeline.push({
      time: finalCheckOutTime,
      event: 'End Duty',
      description: `Shift successfully terminated. Active Working hours: ${hours} hrs, Overtime: ${record.overtime} hrs.`,
      gps: checkOutGPS || (latitude && longitude ? `${latitude}, ${longitude}` : '')
    } as any);

    await record.save();
    io.emit('telemetryUpdate', { action: 'end-duty', driverId, record });
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update records
app.put('/api/attendance/:id', async (req: Request, res: Response) => {
  try {
    const updated = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Delete record
app.delete('/api/attendance/:id', async (req: Request, res: Response) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance log deleted.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// SALARY CRUD
// ==========================================
app.get('/api/salary', async (req: Request, res: Response) => {
  const salaries = await Salary.find();
  res.json(salaries);
});

app.post('/api/salary', async (req: Request, res: Response) => {
  const pay = new Salary(req.body);
  await pay.save();
  res.status(201).json(pay);
});

app.put('/api/salary/:id', async (req: Request, res: Response) => {
  const updated = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/salary/:id', async (req: Request, res: Response) => {
  await Salary.findByIdAndDelete(req.params.id);
  res.json({ message: 'Salary record removed.' });
});

// ==========================================
// FLEET VEHICLE CRUD
// ==========================================
app.get('/api/fleet', async (req: Request, res: Response) => {
  const vehicles = await Vehicle.find();
  res.json(vehicles);
});

app.post('/api/fleet', async (req: Request, res: Response) => {
  const vehicle = new Vehicle(req.body);
  await vehicle.save();
  res.status(201).json(vehicle);
});

app.put('/api/fleet/:id', async (req: Request, res: Response) => {
  const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/fleet/:id', async (req: Request, res: Response) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ message: 'Vehicle deleted.' });
});

// ==========================================
// TRANSIT TRIPS CRUD & POD ACTIONS
// ==========================================
app.get('/api/trips', async (req: Request, res: Response) => {
  const trips = await Trip.find();
  res.json(trips);
});

app.post('/api/trips', async (req: Request, res: Response) => {
  const trip = new Trip(req.body);
  await trip.save();
  res.status(201).json(trip);
});

app.put('/api/trips/:id', async (req: Request, res: Response) => {
  const updated = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
  
  // Socket.io telemetry broadcast
  io.emit('telemetryUpdate', { tripId: req.params.id, update: req.body });
  
  res.json(updated);
});

// Database Seed script
const seedMockDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial owner and driver accounts...');
      
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
      
      // Seed Inventory items
      await Inventory.insertMany([
        { itemName: 'Cold Rolled Steel Sheet', category: 'Raw Materials', sku: 'STL-CR-001', quantity: 1540, minimumQuantity: 2000, warehouse: 'Pune Main', purchasePrice: 40, sellingPrice: 55, supplier: 'Tata Steel' },
        { itemName: 'Alloy Wheels 17"', category: 'Assemblies', sku: 'WHL-AL-172', quantity: 240, minimumQuantity: 100, warehouse: 'Pune Main', purchasePrice: 120, sellingPrice: 160, supplier: 'Speedline Corp' },
        { itemName: 'MCU-32 Microcontrollers', category: 'Electronics', sku: 'ELC-MC-032', quantity: 0, minimumQuantity: 500, warehouse: 'Pune Main', purchasePrice: 8, sellingPrice: 12, supplier: 'NXP Semiconductors' }
      ]);

      // Seed Vehicle assets
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

      console.log('Seed execution completed successfully.');
    }
  } catch (err: any) {
    console.error('Database seeding failed:', err.message);
  }
};

// Boot Server
connectDB().then(() => {
  seedMockDatabase();
  server.listen(PORT, () => {
    console.log(`SmartOps Express Backend running on port ${PORT}`);
  });
});
