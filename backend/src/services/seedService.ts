import bcrypt from 'bcryptjs';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Trip from '../models/Trip';
import Product from '../models/Product';
import Inventory from '../models/Inventory';
import Attendance from '../models/Attendance';
import Salary from '../models/Salary';
import POD from '../models/POD';

export const seedCompanyData = async (
  companyId: string,
  ownerId?: string,
  ownerEmail?: string,
  companyName: string = 'SmartOps Logistics'
) => {
  if (!companyId) return;

  try {
    const ownerIdStr = ownerId ? String(ownerId) : '65f1a2b3c4d5e6f7a8b9c0d1';

    // ── 1. Seed Drivers for Company ──────────────────────────────────────────
    const existingDrivers = await User.countDocuments({ companyId, role: 'Driver' });
    let driver1Id = 'DRV-000101';
    let driver2Id = 'DRV-000102';
    let driver3Id = 'DRV-000103';

    if (existingDrivers === 0) {
      console.log(`[SeedService] Seeding default Drivers for company ${companyId}...`);
      const salt = await bcrypt.genSalt(10);
      const passHash = await bcrypt.hash('123456', salt);

      const d1 = new User({
        fullName: 'Harpreet Singh',
        email: `harpreet.${companyId.toLowerCase().replace(/[^a-z0-9]/g, '')}@smartops.com`,
        mobileNumber: '9823456781',
        role: 'Driver',
        passwordHash: passHash,
        provider: 'local',
        isEmailVerified: true,
        isPhoneVerified: true,
        companyId,
        companyName,
        driverId: driver1Id,
        vehicleNumber: 'MH-12-PQ-4589',
        licenseNumber: 'DL-IND-998822',
        status: 'Active',
        isOnline: true
      });
      await d1.save().catch(() => {});

      const d2 = new User({
        fullName: 'Rajesh Kumar',
        email: `rajesh.${companyId.toLowerCase().replace(/[^a-z0-9]/g, '')}@smartops.com`,
        mobileNumber: '9823456782',
        role: 'Driver',
        passwordHash: passHash,
        provider: 'local',
        isEmailVerified: true,
        isPhoneVerified: true,
        companyId,
        companyName,
        driverId: driver2Id,
        vehicleNumber: 'MH-14-GH-1122',
        licenseNumber: 'DL-IND-443311',
        status: 'Active',
        isOnline: false
      });
      await d2.save().catch(() => {});

      const d3 = new User({
        fullName: 'Vikram Sharma',
        email: `vikram.${companyId.toLowerCase().replace(/[^a-z0-9]/g, '')}@smartops.com`,
        mobileNumber: '9823456783',
        role: 'Driver',
        passwordHash: passHash,
        provider: 'local',
        isEmailVerified: true,
        isPhoneVerified: true,
        companyId,
        companyName,
        driverId: driver3Id,
        vehicleNumber: 'MH-43-AB-7788',
        licenseNumber: 'DL-IND-556677',
        status: 'Active',
        isOnline: true
      });
      await d3.save().catch(() => {});
    }

    // ── 2. Seed Fleet Vehicles for Company ───────────────────────────────────
    const existingVehicles = await Vehicle.countDocuments({ companyId });
    if (existingVehicles === 0) {
      console.log(`[SeedService] Seeding default Vehicles for company ${companyId}...`);
      const sampleVehicles = [
        {
          vehicleNumber: 'MH-12-PQ-4589',
          vehicleType: 'Heavy Truck (10-Ton)',
          driver: 'Harpreet Singh',
          rcNumber: 'RC-MH12-9901',
          insurance: 'INS-2026-8871',
          permit: 'National Cargo Permit',
          fitness: 'Valid up to Dec 2027',
          fuelType: 'Diesel',
          mileage: 4.5,
          currentLocation: 'Pune Central Yard',
          status: 'Moving',
          companyId,
          ownerId: ownerIdStr
        },
        {
          vehicleNumber: 'MH-14-GH-1122',
          vehicleType: 'Container Trailer (32-ft)',
          driver: 'Rajesh Kumar',
          rcNumber: 'RC-MH14-2233',
          insurance: 'INS-2026-4412',
          permit: 'All India Transit Permit',
          fitness: 'Valid up to Oct 2027',
          fuelType: 'Diesel',
          mileage: 3.8,
          currentLocation: 'Navi Mumbai Freight Hub',
          status: 'Idle',
          companyId,
          ownerId: ownerIdStr
        },
        {
          vehicleNumber: 'MH-43-AB-7788',
          vehicleType: 'Express Pickup Van',
          driver: 'Vikram Sharma',
          rcNumber: 'RC-MH43-7744',
          insurance: 'INS-2026-9931',
          permit: 'State Transport Permit',
          fitness: 'Valid up to Jan 2028',
          fuelType: 'CNG',
          mileage: 12.2,
          currentLocation: 'Thane Industrial Zone',
          status: 'Moving',
          companyId,
          ownerId: ownerIdStr
        },
        {
          vehicleNumber: 'KA-01-MJ-9002',
          vehicleType: 'Refrigerated Transport (Reefer)',
          driver: 'Suresh Raina',
          rcNumber: 'RC-KA01-5511',
          insurance: 'INS-2026-7723',
          permit: 'Cold Chain National Permit',
          fitness: 'Valid up to Aug 2027',
          fuelType: 'Diesel',
          mileage: 4.1,
          currentLocation: 'Bengaluru Cold Yard',
          status: 'Maintenance',
          companyId,
          ownerId: ownerIdStr
        }
      ];

      for (const v of sampleVehicles) {
        await Vehicle.create(v).catch(() => {});
      }
    }

    // ── 3. Seed Products & Inventory for Company ─────────────────────────────
    const existingInventory = await Inventory.countDocuments({ companyId });
    if (existingInventory === 0) {
      console.log(`[SeedService] Seeding default Inventory for company ${companyId}...`);
      const seededItems = [
        {
          productName: "CR Steel Sheets (1.2mm)",
          sku: `STL-CR-001-${companyId}`,
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
          remarks: "High grade cold-rolled steel sheets for automotive body panel assembly."
        },
        {
          productName: "HR Steel Plates (5.0mm)",
          sku: `STL-HR-002-${companyId}`,
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
          remarks: "Hot-rolled plates for heavy structural fabrication."
        },
        {
          productName: "Copper Wiring Harness 1.5m",
          sku: `ELE-COP-101-${companyId}`,
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
          remarks: "Standard 1.5m wiring harness for dashboard control connections."
        },
        {
          productName: "LED Control Module Gen 3",
          sku: `ELE-LED-102-${companyId}`,
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
          quantity: 420,
          reservedStock: 40,
          warehouse: "Mumbai Hub",
          storageLocation: "Shelf E-4",
          supplier: "Bosch Automotive",
          batchNumber: "B-ELE-102",
          remarks: "Gen-3 LED vehicle lighting micro-controller unit."
        },
        {
          productName: "Synthetic Engine Oil 15W-40 (20L)",
          sku: `LUB-OIL-201-${companyId}`,
          barcode: "8901234567894",
          category: "Consumables",
          subCategory: "Lubricants",
          brand: "Castrol",
          unit: "Barrels",
          purchasePrice: 4200,
          sellingPrice: 5800,
          minimumStockLevel: 20,
          maximumStockLevel: 100,
          reorderLevel: 30,
          status: "Active",
          quantity: 85,
          reservedStock: 10,
          warehouse: "Pune Main Yard",
          storageLocation: "Oil Depot 2",
          supplier: "Castrol India",
          batchNumber: "B-LUB-201",
          remarks: "Heavy-duty commercial fleet synthetic engine lubricant."
        }
      ];

      for (const item of seededItems) {
        let product = await Product.findOne({ sku: item.sku });
        if (!product) {
          product = new Product({
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
            ownerId: ownerIdStr
          });
          await product.save();
        }

        const inv = new Inventory({
          productId: product._id,
          itemName: item.productName,
          category: item.category,
          sku: item.sku,
          quantity: item.quantity,
          reservedStock: item.reservedStock,
          warehouse: item.warehouse,
          storageLocation: item.storageLocation,
          supplier: item.supplier,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          minimumQuantity: item.minimumStockLevel,
          batchNumber: item.batchNumber,
          remarks: item.remarks,
          status: item.status,
          companyId,
          ownerId: ownerIdStr
        });
        await inv.save();
      }
    }

    // ── 4. Seed Trips for Company ────────────────────────────────────────────
    const existingTrips = await Trip.countDocuments({ companyId });
    if (existingTrips === 0) {
      console.log(`[SeedService] Seeding default Trips for company ${companyId}...`);
      const sampleTrips = [
        {
          tripNumber: `TRP-${companyId.replace(/[^a-zA-Z0-9]/g, '')}-001`,
          vehicleNumber: 'MH-12-PQ-4589',
          driverId: driver1Id,
          driverName: 'Harpreet Singh',
          pickupLocation: 'Pune Industrial Area Yard 4, MH',
          dropLocation: 'Bhiwandi Freight Center, Mumbai, MH',
          customerName: 'AutoCorp India Ltd.',
          customerPhone: '+91 9811223344',
          material: 'CR Steel Sheets',
          weight: '12.5 Tons',
          invoiceNumber: 'INV-2026-901',
          priority: 'High',
          status: 'In Transit',
          eta: '1 hr 45 mins',
          distanceRemaining: 42.5,
          timestamp: new Date(),
          startedAt: new Date(Date.now() - 3 * 3600 * 1000),
          currentLocation: 'Panvel Expressway Toll Plaza',
          currentAddress: 'Panvel Expressway Toll Plaza, Navi Mumbai',
          latitude: 19.0330,
          longitude: 73.1158,
          stops: [
            {
              sequence: 1,
              address: 'Lonavala Weigh Bridge Station',
              latitude: 18.7557,
              longitude: 73.4091,
              status: 'Completed',
              arrivedAt: new Date(Date.now() - 2 * 3600 * 1000),
              completedAt: new Date(Date.now() - 90 * 60 * 1000)
            },
            {
              sequence: 2,
              address: 'Bhiwandi Freight Hub Warehouse A-2',
              latitude: 19.2812,
              longitude: 73.0483,
              status: 'Pending'
            }
          ],
          companyId,
          ownerId: ownerIdStr
        },
        {
          tripNumber: `TRP-${companyId.replace(/[^a-zA-Z0-9]/g, '')}-002`,
          vehicleNumber: 'MH-43-AB-7788',
          driverId: driver3Id,
          driverName: 'Vikram Sharma',
          pickupLocation: 'Thane Warehousing Hub, MH',
          dropLocation: 'Chakan Automotive Park, Pune, MH',
          customerName: 'Mahindra Logistics Hub',
          customerPhone: '+91 9822334455',
          material: 'Wiring Harness & Microcontrollers',
          weight: '4.2 Tons',
          invoiceNumber: 'INV-2026-902',
          priority: 'Urgent',
          status: 'Assigned',
          eta: '3 hrs 10 mins',
          distanceRemaining: 118.0,
          timestamp: new Date(),
          currentLocation: 'Thane Warehousing Hub',
          currentAddress: 'Thane Warehousing Hub, MH',
          latitude: 19.2183,
          longitude: 72.9781,
          stops: [
            {
              sequence: 1,
              address: 'Chakan Industrial Gate 3',
              latitude: 18.7606,
              longitude: 73.8636,
              status: 'Pending'
            }
          ],
          companyId,
          ownerId: ownerIdStr
        },
        {
          tripNumber: `TRP-${companyId.replace(/[^a-zA-Z0-9]/g, '')}-003`,
          vehicleNumber: 'MH-14-GH-1122',
          driverId: driver2Id,
          driverName: 'Rajesh Kumar',
          pickupLocation: 'Jawaharlal Nehru Port Trust (JNPT), Navi Mumbai',
          dropLocation: 'Nagpur Logistics Hub',
          customerName: 'JSW Infrastructure',
          customerPhone: '+91 9833445566',
          material: 'Structural HR Steel Plates',
          weight: '24.0 Tons',
          invoiceNumber: 'INV-2026-903',
          priority: 'Normal',
          status: 'Completed',
          eta: 'Delivered',
          distanceRemaining: 0,
          timestamp: new Date(),
          startedAt: new Date(Date.now() - 24 * 3600 * 1000),
          completedAt: new Date(Date.now() - 2 * 3600 * 1000),
          currentLocation: 'Nagpur Logistics Hub',
          currentAddress: 'Nagpur Logistics Hub, MH',
          latitude: 21.1458,
          longitude: 79.0882,
          stops: [],
          companyId,
          ownerId: ownerIdStr
        }
      ];

      for (const t of sampleTrips) {
        await Trip.create(t).catch(() => {});
      }
    }

    // ── 5. Seed Attendance Logs for Company ──────────────────────────────────
    const existingAttendance = await Attendance.countDocuments({ companyId });
    if (existingAttendance === 0) {
      console.log(`[SeedService] Seeding default Attendance for company ${companyId}...`);
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const sampleAttendance = [
        {
          employeeName: 'Harpreet Singh',
          driverName: 'Harpreet Singh',
          driverId: driver1Id,
          vehicleNumber: 'MH-12-PQ-4589',
          checkIn: '08:15 AM',
          checkInGPS: '18.5204, 73.8567',
          checkInWarehouse: 'Pune Main Depot',
          workingHours: 7.5,
          breakDuration: 0.5,
          tripsCompleted: 1,
          distanceCovered: 184.2,
          fuelUsed: 40.5,
          overtime: 1.0,
          attendanceStatus: 'Present',
          currentStatus: 'On Trip',
          performanceScore: 94,
          status: 'Present',
          date: todayStr,
          companyId,
          ownerId: ownerIdStr,
          breaks: [],
          timeline: [
            { time: '08:15 AM', event: 'Shift Check-In', description: 'Biometric verification passed' },
            { time: '09:00 AM', event: 'Trip Started', description: 'Assigned TRP-001' }
          ]
        },
        {
          employeeName: 'Vikram Sharma',
          driverName: 'Vikram Sharma',
          driverId: driver3Id,
          vehicleNumber: 'MH-43-AB-7788',
          checkIn: '08:30 AM',
          checkInGPS: '19.2183, 72.9781',
          checkInWarehouse: 'Thane Freight Hub',
          workingHours: 6.8,
          breakDuration: 0.75,
          tripsCompleted: 2,
          distanceCovered: 142.0,
          fuelUsed: 12.0,
          overtime: 0,
          attendanceStatus: 'Present',
          currentStatus: 'On Duty',
          performanceScore: 98,
          status: 'Present',
          date: todayStr,
          companyId,
          ownerId: ownerIdStr,
          breaks: [],
          timeline: [
            { time: '08:30 AM', event: 'Shift Check-In', description: 'Standard morning check-in' }
          ]
        },
        {
          employeeName: 'Rajesh Kumar',
          driverName: 'Rajesh Kumar',
          driverId: driver2Id,
          vehicleNumber: 'MH-14-GH-1122',
          checkIn: '08:00 AM',
          checkOut: '06:00 PM',
          workingHours: 10.0,
          breakDuration: 1.0,
          tripsCompleted: 1,
          distanceCovered: 620.0,
          fuelUsed: 160.0,
          overtime: 2.0,
          attendanceStatus: 'Present',
          currentStatus: 'Off Duty',
          performanceScore: 91,
          status: 'Present',
          date: yesterdayStr,
          companyId,
          ownerId: ownerIdStr,
          breaks: [],
          timeline: []
        }
      ];

      for (const a of sampleAttendance) {
        await Attendance.create(a).catch(() => {});
      }
    }

    // ── 6. Seed Salary Records for Company ───────────────────────────────────
    const existingSalaries = await Salary.countDocuments({ companyId });
    if (existingSalaries === 0) {
      console.log(`[SeedService] Seeding default Salaries for company ${companyId}...`);
      const sampleSalaries = [
        {
          employee: 'Harpreet Singh (DRV-000101)',
          basicSalary: 28000,
          overtime: 3500,
          bonus: 2000,
          allowance: 1500,
          deduction: 1000,
          tax: 1200,
          finalSalary: 32800,
          paymentStatus: 'Paid',
          paymentDate: '2026-08-01',
          companyId,
          ownerId: ownerIdStr
        },
        {
          employee: 'Rajesh Kumar (DRV-000102)',
          basicSalary: 30000,
          overtime: 4200,
          bonus: 2500,
          allowance: 1800,
          deduction: 1200,
          tax: 1500,
          finalSalary: 35800,
          paymentStatus: 'Paid',
          paymentDate: '2026-08-01',
          companyId,
          ownerId: ownerIdStr
        },
        {
          employee: 'Vikram Sharma (DRV-000103)',
          basicSalary: 26000,
          overtime: 1500,
          bonus: 1000,
          allowance: 1200,
          deduction: 800,
          tax: 900,
          finalSalary: 28000,
          paymentStatus: 'Pending',
          paymentDate: '',
          companyId,
          ownerId: ownerIdStr
        }
      ];

      for (const s of sampleSalaries) {
        await Salary.create(s).catch(() => {});
      }
    }

    // ── 7. Seed POD Records for Company ──────────────────────────────────────
    const existingPODs = await POD.countDocuments({ companyId });
    if (existingPODs === 0) {
      console.log(`[SeedService] Seeding default PODs for company ${companyId}...`);
      const samplePODs = [
        {
          podId: `POD-${companyId.replace(/[^a-zA-Z0-9]/g, '')}-8801`,
          driverId: driver2Id,
          driverName: 'Rajesh Kumar',
          vehicleNumber: 'MH-14-GH-1122',
          orderNumber: 'ORD-90812',
          customerName: 'JSW Infrastructure',
          customerAddress: 'Nagpur Freight Depot, MH',
          imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop'],
          signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          remarks: 'Delivered 24 Tons steel plates safely with customer stamp verification.',
          status: 'Approved',
          approvedBy: ownerIdStr,
          approvedAt: new Date(),
          companyId,
          ownerId: ownerIdStr
        },
        {
          podId: `POD-${companyId.replace(/[^a-zA-Z0-9]/g, '')}-8802`,
          driverId: driver1Id,
          driverName: 'Harpreet Singh',
          vehicleNumber: 'MH-12-PQ-4589',
          orderNumber: 'ORD-90815',
          customerName: 'AutoCorp India Ltd.',
          customerAddress: 'Bhiwandi Freight Hub Warehouse A-2, Mumbai, MH',
          imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&auto=format&fit=crop',
          images: ['https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&auto=format&fit=crop'],
          signatureUrl: '',
          remarks: 'Partial delivery of CR steel sheets, remaining awaiting unload gate access.',
          status: 'Pending',
          companyId,
          ownerId: ownerIdStr
        }
      ];

      for (const p of samplePODs) {
        await POD.create(p).catch(() => {});
      }
    }

    console.log(`[SeedService] Data seeding verification completed for company ${companyId}.`);
  } catch (err: any) {
    console.error(`[SeedService] Error seeding company ${companyId}:`, err.message);
  }
};
