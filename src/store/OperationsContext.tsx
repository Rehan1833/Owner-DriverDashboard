import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Vehicle, Trip, Task, InventoryItem, PayrollRecord, SystemNotification, ActivityItem, AttendanceRecord } from '../types';
import { mockTasks, mockNotifications, mockActivities } from '../api/mockData';
import { api } from '../api/client';

interface OperationsContextType {
  user: User | null;
  vehicles: Vehicle[];
  trips: Trip[];
  tasks: Task[];
  inventory: InventoryItem[];
  payroll: PayrollRecord[];
  attendance: AttendanceRecord[];
  notifications: SystemNotification[];
  activities: ActivityItem[];
  login: (email: string, role: UserRole) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  // Inventory CRUD
  createInventory: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventory: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteInventory: (id: string) => Promise<void>;
  // Attendance CRUD
  createAttendance: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  updateAttendance: (id: string, record: Partial<AttendanceRecord>) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  // Driver Duty Actions
  driverStartDuty: (payload: { 
    driverId: string; 
    driverName: string; 
    employeeName: string; 
    checkInGPS?: string; 
    checkInWarehouse?: string; 
    checkInDeviceInfo?: string; 
    checkInInternetStatus?: string;
    vehicleNumber?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    checkInTime?: string;
    browserInfo?: string;
    deviceType?: string;
  }) => Promise<void>;
  driverStartBreak: (payload: { driverId: string; type: string; remarks: string; gps: string }) => Promise<void>;
  driverEndBreak: (payload: { driverId: string; gps: string }) => Promise<void>;
  driverEndDuty: (payload: { 
    driverId: string; 
    checkOutGPS?: string; 
    tripsCompleted: number; 
    distanceCovered: number; 
    fuelUsed: number;
    checkOutTime?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  }) => Promise<void>;
  // Salary CRUD
  createSalary: (pay: Omit<PayrollRecord, 'id'>) => Promise<void>;
  updateSalary: (id: string, pay: Partial<PayrollRecord>) => Promise<void>;
  deleteSalary: (id: string) => Promise<void>;
  // Fleet CRUD
  createVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  // Trip actions
  updateTripStatus: (tripId: string, status: Trip['status'], details?: { stopReason?: string; signatureData?: string; photo?: string; deliveryPhoto?: string[] }) => Promise<void>;
  // Dashboard compatibility helpers
  createTask: (task: Omit<Task, 'id' | 'status' | 'progress'>) => void;
  approvePayroll: (id: string) => Promise<void>;
  // Helpers
  addActivity: (action: string, details: string, category: ActivityItem['category']) => void;
  triggerNotification: (type: SystemNotification['type'], title: string, message: string, severity?: SystemNotification['severity']) => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartops_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>(mockNotifications);
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities);

  // Load Data on Mount & Auth State changes
  const refreshAllData = async () => {
    try {
      const [invData, attData, salData, fltData, trpData] = await Promise.all([
        api.inventory.getAll(),
        api.attendance.getAll(),
        api.salary.getAll(),
        api.fleet.getAll(),
        api.trips.getAll()
      ]);
      setInventory(invData);
      setAttendance(attData);
      setPayroll(salData);
      setVehicles(fltData);
      setTrips(trpData);
    } catch (err) {
      console.error('Data refreshing error:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [user]);

  const login = async (email: string, role: UserRole) => {
    const res = await api.auth.login(email, role);
    setUser(res.user);
    localStorage.setItem('smartops_user', JSON.stringify(res.user));
    triggerNotification('System Alert', 'Session Initialized', `Welcome back ${res.user.fullName}! JWT validated.`, 'Info');
  };

  const register = async (payload: any) => {
    const res = await api.auth.register(payload);
    setUser(res.user);
    localStorage.setItem('smartops_user', JSON.stringify(res.user));
    triggerNotification('System Alert', 'Account Registered', `Welcome to SmartOps, ${res.user.fullName}!`, 'Info');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartops_user');
    localStorage.removeItem('smartops_jwt');
  };

  const triggerNotification = (
    type: SystemNotification['type'],
    title: string,
    message: string,
    severity: SystemNotification['severity'] = 'Info'
  ) => {
    const newNotif: SystemNotification = {
      id: `n-${Date.now()}`,
      type,
      title,
      message,
      timestamp: 'Just Now',
      read: false,
      severity
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addActivity = (action: string, details: string, category: ActivityItem['category']) => {
    const newAct: ActivityItem = {
      id: `ac-${Date.now()}`,
      user: user?.fullName || 'System Admin',
      action,
      details,
      timestamp: 'Just Now',
      category
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // Inventory CRUD triggers
  const createInventory = async (item: Omit<InventoryItem, 'id'>) => {
    const created = await api.inventory.create(item);
    setInventory(prev => [...prev, created]);
    addActivity('Inventory Created', `Added new item: ${item.itemName} (${item.sku})`, 'inventory');
    if (created.quantity <= created.minimumQuantity) {
      triggerNotification('Low Stock', 'Safety Limit Alert', `Stock level for ${item.itemName} is below minimum capacity.`, 'Warning');
    }
  };

  const updateInventory = async (id: string, item: Partial<InventoryItem>) => {
    const updated = await api.inventory.update(id, item);
    setInventory(prev => prev.map(i => i.id === id ? updated : i));
    addActivity('Inventory Updated', `Edited item: ${updated.itemName}`, 'inventory');
  };

  const deleteInventory = async (id: string) => {
    await api.inventory.delete(id);
    setInventory(prev => prev.filter(i => i.id !== id));
    addActivity('Inventory Removed', `Deleted stock record ID: ${id}`, 'inventory');
  };

  // Attendance CRUD triggers
  const createAttendance = async (record: Omit<AttendanceRecord, 'id'>) => {
    const created = await api.attendance.create(record);
    setAttendance(prev => [...prev, created]);
    addActivity('Attendance Added', `Recorded check-in for ${record.employeeName}`, 'attendance');
  };

  const updateAttendance = async (id: string, record: Partial<AttendanceRecord>) => {
    const updated = await api.attendance.update(id, record);
    setAttendance(prev => prev.map(a => a.id === id ? updated : a));
  };

  const deleteAttendance = async (id: string) => {
    await api.attendance.delete(id);
    setAttendance(prev => prev.filter(a => a.id !== id));
  };

  const driverStartDuty = async (payload: any) => {
    const record = await api.attendance.startDuty(payload);
    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.driverId === payload.driverId && a.date === record.date));
      return [...filtered, record];
    });
    addActivity('Duty Started', `Driver ${payload.driverName} checked in at ${payload.checkInWarehouse}`, 'attendance');
    triggerNotification('System Alert', 'Duty Initiated', `Driver ${payload.driverName} is now ON DUTY at ${payload.checkInWarehouse}`, 'Info');
  };

  const driverStartBreak = async (payload: any) => {
    const record = await api.attendance.startBreak(payload);
    setAttendance(prev => prev.map(a => (a.driverId === payload.driverId && a.date === record.date) ? record : a));
    addActivity('Break Started', `Driver ${user?.fullName || payload.driverId} started break: ${payload.type}`, 'attendance');
    triggerNotification('System Alert', 'Driver Break Logs', `Driver ${user?.fullName || 'Rajesh'} started a ${payload.type} break`, 'Info');
  };

  const driverEndBreak = async (payload: any) => {
    const record = await api.attendance.endBreak(payload);
    setAttendance(prev => prev.map(a => (a.driverId === payload.driverId && a.date === record.date) ? record : a));
    addActivity('Break Ended', `Driver ${user?.fullName || payload.driverId} resumed duty`, 'attendance');
    triggerNotification('System Alert', 'Driver Break Logs', `Driver ${user?.fullName || 'Rajesh'} break completed, returned to active duty`, 'Info');
  };

  const driverEndDuty = async (payload: any) => {
    const record = await api.attendance.endDuty(payload);
    setAttendance(prev => prev.map(a => (a.driverId === payload.driverId && a.date === record.date) ? record : a));
    
    // Sync with payroll automatically
    const payrollRecord = payroll.find(p => p.employee.includes(record.employeeName || 'Rajesh Kumar') || p.employeeName?.includes(record.employeeName || 'Rajesh Kumar'));
    if (payrollRecord) {
      const overtimeBonus = Math.floor((record.overtime || 0) * 400);
      const performanceBonus = Math.floor((record.performanceScore || 100) * 10);
      const tripIncentive = Math.floor((record.tripsCompleted || 0) * 500);
      const allowanceBonus = Math.floor((record.distanceCovered || 0) * 5); // Fuel / mileage allowance
      const bonusAddition = overtimeBonus + performanceBonus + tripIncentive + allowanceBonus;
      
      await updateSalary(payrollRecord.id, {
        overtime: (payrollRecord.overtime || 0) + overtimeBonus,
        bonus: (payrollRecord.bonus || 0) + bonusAddition,
        finalSalary: payrollRecord.basicSalary + (payrollRecord.overtime || 0) + (payrollRecord.bonus || 0) + bonusAddition + payrollRecord.allowance - payrollRecord.deduction - payrollRecord.tax
      });
    }

    addActivity('Duty Completed', `Driver ${user?.fullName || payload.driverId} checked out. Shift hours: ${record.workingHours} hrs.`, 'attendance');
    triggerNotification('System Alert', 'Duty Terminated', `Driver ${user?.fullName || 'Rajesh'} shift closed. Total hours: ${record.workingHours} hrs.`, 'Info');
  };

  // Salary CRUD triggers
  const createSalary = async (pay: Omit<PayrollRecord, 'id'>) => {
    const created = await api.salary.create(pay);
    setPayroll(prev => [...prev, created]);
    addActivity('Salary Created', `Calculated salary record for ${pay.employee}`, 'payroll');
  };

  const updateSalary = async (id: string, pay: Partial<PayrollRecord>) => {
    const updated = await api.salary.update(id, pay);
    setPayroll(prev => prev.map(p => p.id === id ? updated : p));
    if (pay.paymentStatus === 'Paid') {
      addActivity('Salary Approved', `Approved and paid final salary to ${updated.employee}`, 'payroll');
      triggerNotification('Salary Pending', 'Payroll Disbursed', `Salary of INR ${updated.finalSalary} transferred to ${updated.employee}.`, 'Info');
    }
  };

  const deleteSalary = async (id: string) => {
    await api.salary.delete(id);
    setPayroll(prev => prev.filter(p => p.id !== id));
  };

  // Fleet CRUD triggers
  const createVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    const created = await api.fleet.create(vehicle);
    setVehicles(prev => [...prev, created]);
    addActivity('Vehicle Added', `Registered truck number: ${vehicle.vehicleNumber}`, 'fleet');
  };

  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    const updated = await api.fleet.update(id, vehicle);
    setVehicles(prev => prev.map(v => v.id === id ? updated : v));
  };

  const deleteVehicle = async (id: string) => {
    await api.fleet.delete(id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    addActivity('Vehicle Removed', `De-registered vehicle ID: ${id}`, 'fleet');
  };

  // Trip action triggers
  const updateTripStatus = async (
    tripId: string,
    status: Trip['status'],
    details?: { stopReason?: string; signatureData?: string; photo?: string; deliveryPhoto?: string[] }
  ) => {
    const updated = await api.trips.updateStatus(tripId, status, details);
    setTrips(prev => prev.map(t => t.id === tripId ? updated : t));
    
    // Auto-update vehicle status to match coordinates movement
    const activeVeh = vehicles.find(v => v.vehicleNumber === updated.vehicleNumber);
    if (activeVeh) {
      let vehStatus: Vehicle['status'] = 'Idle';
      if (status === 'In Transit' || status === 'Started') vehStatus = 'Moving';
      else if (status === 'Delayed') vehStatus = 'Delayed';
      await updateVehicle(activeVeh.id, { status: vehStatus });
    }

    addActivity('Trip Status Changed', `Trip ${updated.tripNumber} updated to: ${status}`, 'fleet');
    triggerNotification('Trip Started', 'Fleet telemetry Update', `Trip status for ${updated.tripNumber} is now: ${status}`, 'Info');
  };

  // Simulated live coordinate telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && trips.length > 0) {
        setTrips(prevTrips =>
          prevTrips.map(trip => {
            if (trip.status === 'In Transit' || trip.status === 'Started') {
              const distanceReduction = Math.floor(Math.random() * 3) + 1;
              const newDistance = Math.max(0, trip.distanceRemaining - distanceReduction);
              let newStatus: any = trip.status;
              if (newDistance === 0) {
                newStatus = 'Reached Destination';
              } else if (trip.status === 'Started') {
                newStatus = 'In Transit';
              }
              return { ...trip, distanceRemaining: newDistance, status: newStatus };
            }
            return trip;
          })
        );
      }
    }, 9000);

    return () => clearInterval(interval);
  }, [user, trips]);

  const createTask = (taskData: Omit<Task, 'id' | 'status' | 'progress'>) => {
    const newTask: Task = {
      ...taskData,
      id: `tk-${Date.now()}`,
      status: 'Pending',
      progress: 0
    };
    setTasks(prev => [newTask, ...prev]);
    addActivity('Task Created', `Created task "${newTask.title}" for ${newTask.assignedTo}`, 'task');
    triggerNotification('Task Assigned', 'New Operational Task', `Task "${newTask.title}" assigned to ${newTask.assignedTo}.`, 'Info');
  };

  const approvePayroll = async (id: string) => {
    await updateSalary(id, { paymentStatus: 'Paid' });
  };

  return (
    <OperationsContext.Provider
      value={{
        user,
        vehicles,
        trips,
        tasks,
        inventory,
        payroll,
        attendance,
        notifications,
        activities,
        login,
        register,
        logout,
        createInventory,
        updateInventory,
        deleteInventory,
        createAttendance,
        updateAttendance,
        deleteAttendance,
        driverStartDuty,
        driverStartBreak,
        driverEndBreak,
        driverEndDuty,
        createSalary,
        updateSalary,
        deleteSalary,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        updateTripStatus,
        createTask,
        approvePayroll,
        addActivity,
        triggerNotification
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (context === undefined) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};
