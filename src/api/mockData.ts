import { Vehicle, Trip, Task, InventoryItem, PayrollRecord, SystemNotification, ActivityItem, AttendanceRecord } from '../types';

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    vehicleNumber: 'MH-12-QW-9874',
    vehicleType: 'Container Truck (18T)',
    driver: 'Rajesh Kumar',
    rcNumber: 'RC-MH-12-9874',
    insurance: '2026-12-15',
    permit: '2026-10-20',
    fitness: '2026-09-05',
    fuelType: 'Diesel',
    mileage: 6.2,
    currentLocation: 'Pune Warehouse A',
    status: 'Idle'
  },
  {
    id: 'v2',
    vehicleNumber: 'KA-03-MN-4512',
    vehicleType: 'Flatbed Trailer (24T)',
    driver: 'Satnam Singh',
    rcNumber: 'RC-KA-03-4512',
    insurance: '2026-08-11',
    permit: '2026-11-02',
    fitness: '2026-07-28',
    fuelType: 'Diesel',
    mileage: 5.5,
    currentLocation: 'Bengaluru Gate 2',
    status: 'Moving'
  },
  {
    id: 'v3',
    vehicleNumber: 'HR-55-ZX-3344',
    vehicleType: 'Reefer Truck (15T)',
    driver: 'Arjun Sharma',
    rcNumber: 'RC-HR-55-3344',
    insurance: '2026-07-20',
    permit: '2026-06-18',
    fitness: '2026-06-25',
    fuelType: 'Diesel',
    mileage: 5.8,
    currentLocation: 'Delhi Cold Stg',
    status: 'Delayed'
  }
];

export const mockTrips: Trip[] = [
  {
    id: 't1',
    tripNumber: 'TRP-2026-8801',
    vehicleNumber: 'MH-12-QW-9874',
    driverId: 'DRV-9041',
    driverName: 'Rajesh Kumar',
    pickupLocation: 'Warehouse A (Pune)',
    dropLocation: 'Distribution Center (Mumbai)',
    customerName: 'Tata Motors Manufacturing',
    customerPhone: '+919876543210',
    material: 'Engine Assemblies & Parts',
    weight: '15 Tons',
    invoiceNumber: 'INV-2026-9041',
    status: 'In Transit',
    eta: '16:45 PM',
    distanceRemaining: 48,
    timestamp: '2026-07-14T12:30:00Z'
  },
  {
    id: 't2',
    tripNumber: 'TRP-2026-8802',
    vehicleNumber: 'KA-03-MN-4512',
    driverId: 'DRV-9042',
    driverName: 'Satnam Singh',
    pickupLocation: 'Warehouse B (Bengaluru)',
    dropLocation: 'Automotive Hub (Chennai)',
    customerName: 'Hyundai India Logistics',
    customerPhone: '+918765432109',
    material: 'Steel Coils',
    weight: '22 Tons',
    invoiceNumber: 'INV-2026-9042',
    status: 'Started',
    eta: '22:15 PM',
    distanceRemaining: 310,
    timestamp: '2026-07-14T14:15:00Z'
  }
];

export const mockTasks: Task[] = [
  { id: 'tk1', title: 'Verify Warehouse A Stock Variance', description: 'Reconcile stock count for sheet metal inventory.', priority: 'High', assignedTo: 'Amit Patel', status: 'In Progress', deadline: '2026-07-15', progress: 65 },
  { id: 'tk2', title: 'Schedule Maintenance for MH-12-QW-9874', description: 'Routine 100k km oil change and brake pad check.', priority: 'Medium', assignedTo: 'Rajesh Kumar', status: 'Pending', deadline: '2026-07-16', progress: 0 },
  { id: 'tk3', title: 'Approve Driver Allowances Q2', description: 'Verify trip log vouchers and credit out-of-station payroll bonuses.', priority: 'Critical', assignedTo: 'Harsh Vardhan', status: 'Pending', deadline: '2026-07-14', progress: 10 }
];

export const mockInventory: InventoryItem[] = [
  {
    id: 'i1',
    itemName: 'Cold Rolled Steel Sheet',
    category: 'Raw Materials',
    sku: 'STL-CR-001',
    quantity: 1540,
    minimumQuantity: 2000,
    warehouse: 'Pune Main',
    purchasePrice: 40,
    sellingPrice: 55,
    supplier: 'Tata Steel',
    batchNumber: 'BT-STEEL-09',
    expiryDate: '2030-12-31',
    description: 'Structural reinforcement sheet metal'
  },
  {
    id: 'i2',
    itemName: 'Alloy Wheels 17"',
    category: 'Assemblies',
    sku: 'WHL-AL-172',
    quantity: 240,
    minimumQuantity: 100,
    warehouse: 'Pune Main',
    purchasePrice: 120,
    sellingPrice: 160,
    supplier: 'Speedline Corp',
    batchNumber: 'BT-WHEEL-14',
    expiryDate: '2035-06-30',
    description: 'Aluminium hub wheel assembly'
  },
  {
    id: 'i3',
    itemName: 'MCU-32 Microcontrollers',
    category: 'Electronics',
    sku: 'ELC-MC-032',
    quantity: 0,
    minimumQuantity: 500,
    warehouse: 'Pune Main',
    purchasePrice: 8,
    sellingPrice: 12,
    supplier: 'NXP Semiconductors',
    batchNumber: 'BT-ELC-88',
    expiryDate: '2029-05-15',
    description: '32-bit automotive gateway chips'
  }
];

export const mockPayroll: PayrollRecord[] = [
  {
    id: 'p1',
    employee: 'Rajesh Kumar',
    basicSalary: 28000,
    overtime: 3600,
    bonus: 1200,
    allowance: 500,
    deduction: 500,
    tax: 1500,
    finalSalary: 31300,
    paymentStatus: 'Pending',
    paymentDate: '2026-07-30'
  },
  {
    id: 'p2',
    employee: 'Satnam Singh',
    basicSalary: 30000,
    overtime: 2700,
    bonus: 2000,
    allowance: 800,
    deduction: 800,
    tax: 1800,
    finalSalary: 32900,
    paymentStatus: 'Pending',
    paymentDate: '2026-07-30'
  }
];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: 'a1',
    employeeName: 'Rajesh Kumar',
    driverName: 'Rajesh Kumar',
    checkIn: '08:30 AM',
    checkOut: '05:30 PM',
    workingHours: 9,
    status: 'Present',
    date: '2026-07-14',
    remarks: 'Delivered TRP-8800 on-time'
  },
  {
    id: 'a2',
    employeeName: 'Satnam Singh',
    driverName: 'Satnam Singh',
    checkIn: '08:45 AM',
    status: 'Present',
    date: '2026-07-14',
    remarks: 'Dispatched to Chennai DC'
  }
];

export const mockNotifications: SystemNotification[] = [
  { id: 'n1', type: 'Low Stock', title: 'Low Stock Alert: Cold Rolled Steel', message: 'Warehouse Pune Main is running below safety stock level (1,540 / 2,000 sheets).', timestamp: '10 Mins Ago', read: false, severity: 'Warning' },
  { id: 'n2', type: 'Critical', title: 'Out of Stock Alert: MCU-32 Microcontrollers', message: 'Semiconductor stock depleted. Assembly Line 3 halted.', timestamp: '35 Mins Ago', read: false, severity: 'Error' },
  { id: 'n4', type: 'Salary Pending', title: 'Salary Approvals Awaiting Action', message: 'June 2026 payroll spreadsheet is ready for Owner review (2 drivers pending approval).', timestamp: '2 Hours Ago', read: false, severity: 'Info' }
];

export const mockActivities: ActivityItem[] = [
  { id: 'ac1', user: 'System Agent', action: 'Trip Started', details: 'Began trip TRP-2026-8802 in Vehicle KA-03-MN-4512.', timestamp: '1 Hour Ago', category: 'fleet' },
  { id: 'ac3', user: 'Harsh Vardhan', action: 'Salary Approved', details: 'Approved June payroll for Rajesh Kumar.', timestamp: '3 Hours Ago', category: 'payroll' },
  { id: 'ac4', user: 'Rajesh Kumar', action: 'POD Uploaded', details: 'Customer signature & cargo photo submitted for trip TRP-2026-8800.', timestamp: '4 Hours Ago', category: 'fleet' }
];
