import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import User from '../models/User';
import Product from '../models/Product';
import Inventory from '../models/Inventory';

const seedDefaultInventory = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding default enterprise products and inventory...');
      const companyId = 'SmartOps Logistics';
      const ownerId = '65f1a2b3c4d5e6f7a8b9c0d1'; // Default Owner ID

      const seededItems = [
        {
          productName: "CR Steel Sheets (1.2mm)",
          sku: "STL-CR-001",
          barcode: "8901234567890",
          category: "Raw Materials",
          subCategory: "Flat Rolled Steel",
          brand: "Tata Steel",
          unit: "Kg",
          purchasePrice: 65,
          sellingPrice: 85,
          minimumStockLevel: 500,
          maximumStockLevel: 5000,
          reorderLevel: 1000,
          status: "Active",
          quantity: 2400,
          reservedStock: 300,
          warehouse: "Pune Main Yard",
          storageLocation: "Row A, Shelf 2",
          supplier: "Tata Steel Ltd.",
          batchNumber: "B-STL-001",
          expiryDate: "",
          manufacturingDate: "2026-05-15",
          remarks: "High grade cold-rolled steel sheets for automotive body panel assembly."
        },
        {
          productName: "HR Steel Plates (5.0mm)",
          sku: "STL-HR-002",
          barcode: "8901234567891",
          category: "Raw Materials",
          subCategory: "Structural Steel",
          brand: "JSW Steel",
          unit: "Kg",
          purchasePrice: 58,
          sellingPrice: 76,
          minimumStockLevel: 300,
          maximumStockLevel: 3000,
          reorderLevel: 800,
          status: "Active",
          quantity: 450,
          reservedStock: 50,
          warehouse: "Pune Main Yard",
          storageLocation: "Row B, Shelf 1",
          supplier: "JSW Steel Ltd.",
          batchNumber: "B-STL-002",
          expiryDate: "",
          manufacturingDate: "2026-06-10",
          remarks: "Hot-rolled plates for heavy structural fabrication."
        },
        {
          productName: "Copper Wiring Harness 1.5m",
          sku: "ELE-COP-101",
          barcode: "8901234567892",
          category: "Electronics",
          subCategory: "Cabling",
          brand: "Finolex",
          unit: "Pieces",
          purchasePrice: 280,
          sellingPrice: 420,
          minimumStockLevel: 200,
          maximumStockLevel: 2000,
          reorderLevel: 400,
          status: "Active",
          quantity: 180,
          reservedStock: 20,
          warehouse: "Mumbai Hub",
          storageLocation: "Bin 14",
          supplier: "Finolex Cables",
          batchNumber: "B-ELE-101",
          expiryDate: "",
          manufacturingDate: "2026-04-01",
          remarks: "Standard 1.5m wiring harness for dashboard control connections."
        },
        {
          productName: "LED Control Module Gen 3",
          sku: "ELE-LED-102",
          barcode: "8901234567893",
          category: "Electronics",
          subCategory: "Microcontrollers",
          brand: "Bosch",
          unit: "Pieces",
          purchasePrice: 1250,
          sellingPrice: 1850,
          minimumStockLevel: 50,
          maximumStockLevel: 500,
          reorderLevel: 100,
          status: "Active",
          quantity: 12,
          reservedStock: 0,
          warehouse: "Mumbai Hub",
          storageLocation: "Shelf C-4",
          supplier: "Bosch India",
          batchNumber: "B-ELE-102",
          expiryDate: "",
          manufacturingDate: "2026-02-28",
          remarks: "Electronic controller for dashboard LED status illumination. Low stock, reorder required."
        },
        {
          productName: "Engine Lubricant Grade 5W-30",
          sku: "LUB-ENG-501",
          barcode: "8901234567894",
          category: "Lubricants",
          subCategory: "Motor Oils",
          brand: "Castrol",
          unit: "Litre",
          purchasePrice: 450,
          sellingPrice: 620,
          minimumStockLevel: 100,
          maximumStockLevel: 1000,
          reorderLevel: 200,
          status: "Active",
          quantity: 0,
          reservedStock: 0,
          warehouse: "Pune Main Yard",
          storageLocation: "Rack 3, Row D",
          supplier: "Castrol India",
          batchNumber: "B-LUB-501",
          expiryDate: "2029-06-30",
          manufacturingDate: "2026-06-30",
          remarks: "High performance synthetic engine oil for fleet vehicles. Out of stock, critical replenishment."
        },
        {
          productName: "Hydraulic Brake Fluid Dot 4",
          sku: "LUB-BRK-502",
          barcode: "8901234567895",
          category: "Lubricants",
          subCategory: "Brake Fluids",
          brand: "Mobil 1",
          unit: "Litre",
          purchasePrice: 380,
          sellingPrice: 510,
          minimumStockLevel: 50,
          maximumStockLevel: 500,
          reorderLevel: 100,
          status: "Active",
          quantity: 340,
          reservedStock: 15,
          warehouse: "Pune Main Yard",
          storageLocation: "Rack 3, Row E",
          supplier: "Mobil Distributors",
          batchNumber: "B-LUB-502",
          expiryDate: "2028-12-15",
          manufacturingDate: "2025-12-15",
          remarks: "Standard DOT 4 brake fluid for hydraulic braking systems."
        },
        {
          productName: "Corrugated Cardboard Box XL",
          sku: "PKG-CAR-301",
          barcode: "8901234567896",
          category: "Packaging",
          subCategory: "Shipping Boxes",
          brand: "Packwell",
          unit: "Pieces",
          purchasePrice: 45,
          sellingPrice: 65,
          minimumStockLevel: 1000,
          maximumStockLevel: 10000,
          reorderLevel: 2000,
          status: "Active",
          quantity: 6200,
          reservedStock: 500,
          warehouse: "Pune Main Yard",
          storageLocation: "Aisle 7",
          supplier: "Packwell Packaging Ltd.",
          batchNumber: "B-PKG-301",
          expiryDate: "",
          manufacturingDate: "2026-07-01",
          remarks: "Heavy duty corrugated shipping boxes for finished assemblies."
        },
        {
          productName: "Industrial Bubble Wrap Roll 100m",
          sku: "PKG-BUB-302",
          barcode: "8901234567897",
          category: "Packaging",
          subCategory: "Protective Wrap",
          brand: "3M",
          unit: "Pieces",
          purchasePrice: 850,
          sellingPrice: 1200,
          minimumStockLevel: 30,
          maximumStockLevel: 300,
          reorderLevel: 60,
          status: "Active",
          quantity: 45,
          reservedStock: 5,
          warehouse: "Pune Main Yard",
          storageLocation: "Aisle 8",
          supplier: "3M India Ltd.",
          batchNumber: "B-PKG-302",
          expiryDate: "",
          manufacturingDate: "2026-05-10",
          remarks: "High quality protective packaging rolls for delicate electronics shipping. Low stock status."
        },
        {
          productName: "Front Axle Assembly v2.1",
          sku: "ASM-FRT-201",
          barcode: "8901234567898",
          category: "Assemblies",
          subCategory: "Axles",
          brand: "SmartOps Heavy",
          unit: "Pieces",
          purchasePrice: 8500,
          sellingPrice: 12500,
          minimumStockLevel: 15,
          maximumStockLevel: 150,
          reorderLevel: 30,
          status: "Active",
          quantity: 42,
          reservedStock: 10,
          warehouse: "Pune Main Yard",
          storageLocation: "Staging Area 1",
          supplier: "SmartOps Assembly Division",
          batchNumber: "B-ASM-201",
          expiryDate: "",
          manufacturingDate: "2026-07-20",
          remarks: "Complete front axle structural assembly ready for chassis mounting."
        },
        {
          productName: "Rear Axle Assembly v2.1",
          sku: "ASM-RER-202",
          barcode: "8901234567899",
          category: "Assemblies",
          subCategory: "Axles",
          brand: "SmartOps Heavy",
          unit: "Pieces",
          purchasePrice: 9200,
          sellingPrice: 13800,
          minimumStockLevel: 15,
          maximumStockLevel: 150,
          reorderLevel: 30,
          status: "Active",
          quantity: 8,
          reservedStock: 2,
          warehouse: "Pune Main Yard",
          storageLocation: "Staging Area 2",
          supplier: "SmartOps Assembly Division",
          batchNumber: "B-ASM-202",
          expiryDate: "",
          manufacturingDate: "2026-07-22",
          remarks: "Complete rear axle assembly with integrated differential gears. Low stock, reorder required."
        }
      ];

      for (const item of seededItems) {
        // Create Product
        const product = new Product({
          productName: item.productName,
          sku: item.sku,
          barcode: item.barcode,
          category: item.category,
          subCategory: item.subCategory,
          brand: item.brand,
          unit: item.unit,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          minimumStockLevel: item.minimumStockLevel,
          maximumStockLevel: item.maximumStockLevel,
          reorderLevel: item.reorderLevel,
          status: item.status,
          companyId,
          ownerId,
          createdBy: ownerId
        });
        await product.save();

        // Create Inventory
        const inventory = new Inventory({
          productId: product._id,
          quantity: item.quantity,
          reservedStock: item.reservedStock,
          warehouse: item.warehouse,
          storageLocation: item.storageLocation,
          supplier: item.supplier,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          manufacturingDate: item.manufacturingDate,
          lastRestockedDate: (item as any).lastRestockedDate || new Date().toLocaleDateString(),
          remarks: item.remarks,
          status: item.status,
          companyId,
          ownerId,
          // Legacy fields
          itemName: item.productName,
          category: item.category,
          sku: item.sku,
          minimumQuantity: item.minimumStockLevel,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          description: item.remarks
        });
        await inventory.save();
      }
      console.log('Seeded 10 enterprise products and inventory successfully.');
    }
  } catch (err: any) {
    console.error('Error seeding default inventory:', err.message);
  }
};

const seedDefaultAccounts = async () => {
  try {
    const ownerEmail = 'rehanchaudhari181133@gmail.com';
    const existingOwner = await User.findOne({ email: ownerEmail });
    if (!existingOwner) {
      console.log('Seeding default Owner account...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('123456', salt);
      const owner = new User({
        _id: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c0d1'),
        fullName: 'Rehan Chaudhari',
        email: ownerEmail,
        mobileNumber: '9876543210',
        role: 'Owner',
        passwordHash,
        provider: 'local',
        isEmailVerified: true,
        isPhoneVerified: true,
        verifiedAt: new Date(),
        securityQuestion: "What is your best friend's name?",
        securityAnswerHash: await bcrypt.hash('friend', 10),
        companyName: 'SmartOps Logistics'
      });
      await owner.save();
      console.log('Default Owner account seeded successfully!');
    }

    // Seed Default Driver Account (rajesh@smartops.com)
    const driverEmail = 'rajesh@smartops.com';
    const existingDriver = await User.findOne({ $or: [{ email: driverEmail }, { driverId: 'DRV-9041' }] });
    if (!existingDriver) {
      console.log('Seeding default Driver account (Rajesh Kumar)...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('123456', salt);
      const driver = new User({
        _id: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c0d2'),
        fullName: 'Rajesh Kumar',
        email: driverEmail,
        mobileNumber: '9876543211',
        role: 'Driver',
        driverId: 'DRV-9041',
        vehicleNumber: 'MH-12-QW-9874',
        passwordHash,
        provider: 'local',
        isEmailVerified: true,
        isPhoneVerified: true,
        verifiedAt: new Date(),
        securityQuestion: "What is your best friend's name?",
        securityAnswerHash: await bcrypt.hash('friend', 10),
        companyName: 'SmartOps Logistics'
      });
      await driver.save();
      console.log('Default Driver account seeded successfully!');
    }

    // Seed Second Default Driver Account (driver@smartops.com)
    const driver2Email = 'driver@smartops.com';
    const existingDriver2 = await User.findOne({ $or: [{ email: driver2Email }, { driverId: 'DRV-1001' }] });
    if (!existingDriver2) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('123456', salt);
      const driver2 = new User({
        _id: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c0d3'),
        fullName: 'Vikram Singh',
        email: driver2Email,
        mobileNumber: '9876543212',
        role: 'Driver',
        driverId: 'DRV-1001',
        vehicleNumber: 'MH-14-TR-4421',
        passwordHash,
        provider: 'local',
        isEmailVerified: true,
        isPhoneVerified: true,
        verifiedAt: new Date(),
        securityQuestion: "What is your best friend's name?",
        securityAnswerHash: await bcrypt.hash('friend', 10),
        companyName: 'SmartOps Logistics'
      });
      await driver2.save();
      console.log('Second default Driver account seeded successfully!');
    }
  } catch (err: any) {
    console.error('Error seeding default accounts:', err.message);
  }
};

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/smartops';
    console.log(`Connecting to MongoDB: ${connStr}...`);
    
    // Set connection timeouts so it doesn't hang indefinitely on offline DBs
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    await seedDefaultAccounts();
    await seedDefaultInventory();

    // Clean up legacy/stale collection indexes (e.g., username_1)
    try {
      if (mongoose.connection.db) {
        const usersCollection = mongoose.connection.db.collection('users');
        const indexes = await usersCollection.indexes();
        if (indexes.some(idx => idx.name === 'username_1')) {
          await usersCollection.dropIndex('username_1');
          console.log('[DB FIX] Dropped legacy username_1 index from users collection.');
        }
      }
    } catch (indexErr: any) {
      console.log('[DB INDEX SYNC] Legacy index check completed:', indexErr.message);
    }
  } catch (err: any) {
    console.error(`MongoDB connection warning: ${err.message}`);
    console.log('Backend will operate in persistent local database fallback if local daemon is unavailable.');
    
    try {
      console.log('Starting MongoMemoryServer with local disk storage persistence...');
      // @ts-ignore
      const { MongoMemoryServer } = await import('mongodb-memory-server');

      const dataDir = path.join(process.cwd(), '.mongo_data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Remove stale lock file if present from an unclean termination
      const lockFile = path.join(dataDir, 'mongod.lock');
      if (fs.existsSync(lockFile)) {
        try {
          fs.unlinkSync(lockFile);
        } catch {
          // ignore
        }
      }

      let mongoServer: any;
      try {
        mongoServer = await MongoMemoryServer.create({
          instance: {
            dbPath: dataDir,
            storageEngine: 'wiredTiger'
          }
        });
      } catch (dbPathErr: any) {
        console.warn(`Persistent dbPath creation warning: ${dbPathErr.message}. Falling back to standard MongoMemoryServer...`);
        mongoServer = await MongoMemoryServer.create();
      }

      const mongoUri = mongoServer.getUri();
      console.log(`MongoDB instance started at ${mongoUri}`);
      
      await mongoose.connect(mongoUri);
      console.log('Connected successfully to local MongoDB fallback!');
      await seedDefaultAccounts();
      await seedDefaultInventory();

      const cleanup = async () => {
        try {
          await mongoose.disconnect();
          await mongoServer.stop();
        } catch {
          // ignore
        }
      };
      process.once('SIGINT', cleanup);
      process.once('SIGTERM', cleanup);
    } catch (fallbackErr: any) {
      console.error(`Database startup failed: ${fallbackErr.message}`);
    }
  }
};


