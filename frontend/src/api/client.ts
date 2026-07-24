import axios from 'axios';
import { User, Vehicle, Trip, Task, InventoryItem, PayrollRecord, AttendanceRecord, PODRecord } from '../types';
import { mockVehicles, mockTrips, mockTasks, mockInventory, mockPayroll, mockAttendance } from './mockData';

const API_BASE_URL = 'http://localhost:5000/api';

// Axios Instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000
});

// Bind Token to Requests
axiosInstance.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('smartops_jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error: any) => Promise.reject(error));

// LocalStorage Fallback Helper class
class LocalStorageFallback {
  private static initKey<T>(key: string, defaultData: T[]) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultData));
    }
  }

  static get<T>(key: string, defaultData: T[]): T[] {
    this.initKey(key, defaultData);
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  static set<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

// ==========================================
// EXPORTED API METHODS
// ==========================================

export const api = {
  // 1. AUTH API
  auth: {
    login: async (email: string, role: string, password?: string): Promise<{ token: string; user: User }> => {
      try {
        const res = await axiosInstance.post('/auth/login', { email, password: password || '' });
        localStorage.setItem('smartops_jwt', res.data.token);
        return res.data;
      } catch (err: any) {
        if (err.response) {
          throw err;
        }
        console.warn('Backend Auth Offline. Simulating local token verification.');
        const mockUser: User = {
          id: role === 'Owner' ? 'u-owner' : 'u-driver',
          fullName: email.split('@')[0],
          email,
          mobileNumber: '9999999999',
          role: role as any,
          companyName: role === 'Owner' ? 'SmartOps Manufacturing Ltd.' : undefined,
          driverId: role === 'Driver' ? `DRV-${Date.now().toString().slice(-4)}` : undefined,
          vehicleNumber: role === 'Driver' ? 'MH-12-QW-9874' : undefined,
          licenseNumber: role === 'Driver' ? 'DL-MH12-9988' : undefined,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=2563EB`
        };
        localStorage.setItem('smartops_jwt', 'mock_jwt_token_payload');
        return { token: 'mock_jwt_token_payload', user: mockUser };
      }
    },
    register: async (payload: any): Promise<{ token: string; user: User }> => {
      try {
        const res = await axiosInstance.post('/auth/register', payload);
        localStorage.setItem('smartops_jwt', res.data.token);
        return res.data;
      } catch (err: any) {
        if (err.response) {
          throw err;
        }
        console.warn('Backend Auth Offline. Registering user in local session.');
        const mockUser: User = {
          id: `u-${Date.now()}`,
          fullName: payload.fullName,
          email: payload.email,
          mobileNumber: payload.mobileNumber,
          role: payload.role,
          companyName: payload.companyName,
          driverId: payload.driverId,
          vehicleNumber: payload.vehicleNumber,
          licenseNumber: payload.licenseNumber,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.fullName)}`
        };
        localStorage.setItem('smartops_jwt', 'mock_jwt_token_payload');
        return { token: 'mock_jwt_token_payload', user: mockUser };
      }
    }
  },

  // 2. INVENTORY CRUD
  inventory: {
    getAll: async (): Promise<InventoryItem[]> => {
      try {
        const res = await axiosInstance.get('/inventory');
        return res.data.map((item: any) => ({ ...item, id: item._id || item.id }));
      } catch (err) {
        return LocalStorageFallback.get<InventoryItem>('smartops_inventory', mockInventory);
      }
    },
    create: async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
      try {
        const res = await axiosInstance.post('/inventory', item);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<InventoryItem>('smartops_inventory', mockInventory);
        const newItem = { ...item, id: `i-${Date.now()}` };
        local.push(newItem);
        LocalStorageFallback.set('smartops_inventory', local);
        return newItem;
      }
    },
    update: async (id: string, item: Partial<InventoryItem>): Promise<InventoryItem> => {
      try {
        const res = await axiosInstance.put(`/inventory/${id}`, item);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<InventoryItem>('smartops_inventory', mockInventory);
        const updated = local.map(i => i.id === id ? { ...i, ...item } : i);
        LocalStorageFallback.set('smartops_inventory', updated);
        return updated.find(i => i.id === id) as InventoryItem;
      }
    },
    delete: async (id: string): Promise<void> => {
      try {
        await axiosInstance.delete(`/inventory/${id}`);
      } catch (err) {
        const local = LocalStorageFallback.get<InventoryItem>('smartops_inventory', mockInventory);
        const filtered = local.filter(i => i.id !== id);
        LocalStorageFallback.set('smartops_inventory', filtered);
      }
    }
  },

  // 3. DRIVER DUTY & ATTENDANCE SYSTEM API
  attendance: {
    getAll: async (): Promise<AttendanceRecord[]> => {
      try {
        const res = await axiosInstance.get('/attendance');
        return res.data.map((item: any) => ({ ...item, id: item._id || item.id }));
      } catch (err) {
        return LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance);
      }
    },
    getHistory: async (): Promise<AttendanceRecord[]> => {
      try {
        const res = await axiosInstance.get('/attendance/history');
        return res.data.map((item: any) => ({ ...item, id: item._id || item.id }));
      } catch (err) {
        return LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance).sort((a, b) => b.date.localeCompare(a.date));
      }
    },
    getLive: async (): Promise<AttendanceRecord[]> => {
      try {
        const res = await axiosInstance.get('/attendance/live');
        return res.data.map((item: any) => ({ ...item, id: item._id || item.id }));
      } catch (err) {
        const local = LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance);
        return local.filter(a => a.currentStatus && a.currentStatus !== 'Off Duty');
      }
    },
    getAnalytics: async (): Promise<AttendanceRecord[]> => {
      try {
        const res = await axiosInstance.get('/attendance/analytics');
        return res.data.map((item: any) => ({ ...item, id: item._id || item.id }));
      } catch (err) {
        return LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance);
      }
    },
    getByDriverId: async (driverId: string): Promise<AttendanceRecord[]> => {
      try {
        const res = await axiosInstance.get(`/attendance/${driverId}`);
        return res.data.map((item: any) => ({ ...item, id: item._id || item.id }));
      } catch (err) {
        const local = LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance);
        return local.filter(a => a.driverId === driverId);
      }
    },
    startDuty: async (payload: { 
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
    }): Promise<AttendanceRecord> => {
      try {
        const res = await axiosInstance.post('/attendance/start-duty', payload);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance);
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Remove existing record for today if present (force overwrite for testing simplicity)
        const filtered = local.filter(a => !(a.driverId === payload.driverId && a.date === todayStr));
        
        const finalTime = payload.checkInTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        let attendanceStatus: 'Present' | 'Late' | 'Absent' = 'Present';
        const [timeVal, modifier] = finalTime.split(' ');
        const [hours, minutes] = timeVal.split(':').map(Number);
        let checkInHour = hours;
        if (modifier === 'PM' && hours !== 12) checkInHour += 12;
        if (modifier === 'AM' && hours === 12) checkInHour = 0;
        if (checkInHour > 8 || (checkInHour === 8 && minutes > 30)) {
          attendanceStatus = 'Late';
        }

        const newRecord: AttendanceRecord = {
          id: `a-${Date.now()}`,
          attendanceId: `a-${Date.now()}`,
          employeeName: payload.employeeName,
          driverName: payload.driverName,
          driverId: payload.driverId,
          vehicleNumber: payload.vehicleNumber || 'MH-12-QW-9874',
          checkIn: finalTime,
          checkInTime: finalTime,
          checkInGPS: payload.checkInGPS || (payload.latitude && payload.longitude ? `${payload.latitude}, ${payload.longitude}` : ''),
          latitude: payload.latitude,
          longitude: payload.longitude,
          address: payload.address || payload.checkInWarehouse || 'Primary Warehouse Yard',
          checkInWarehouse: payload.address || payload.checkInWarehouse || 'Primary Warehouse Yard',
          checkInDeviceInfo: payload.deviceType || payload.checkInDeviceInfo || 'Android Device',
          checkInInternetStatus: payload.checkInInternetStatus || 'Connected',
          workingHours: 0,
          breakDuration: 0,
          tripsCompleted: 0,
          distanceCovered: 0,
          fuelUsed: 0,
          overtime: 0,
          attendanceStatus,
          currentStatus: 'On Duty',
          performanceScore: 100,
          status: attendanceStatus,
          date: todayStr,
          breaks: [],
          timeline: [
            { time: finalTime, event: 'Driver Logged In', description: `Device: ${payload.deviceType || payload.checkInDeviceInfo || 'Unknown'}. Browser: ${payload.browserInfo || 'Unknown'}. Internet: ${payload.checkInInternetStatus || 'Active'}.` },
            { time: finalTime, event: 'Start Duty', description: `Duty started at ${payload.address || payload.checkInWarehouse || 'Warehouse Point'}.`, gps: payload.checkInGPS || (payload.latitude && payload.longitude ? `${payload.latitude}, ${payload.longitude}` : '') }
          ]
        };

        filtered.push(newRecord);
        LocalStorageFallback.set('smartops_attendance', filtered);
        return newRecord;
      }
    },
    startBreak: async (payload: { driverId: string; type: string; remarks: string; gps: string }): Promise<AttendanceRecord> => {
      try {
        const res = await axiosInstance.post('/attendance/start-break', payload);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance);
        const todayStr = new Date().toISOString().split('T')[0];
        const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const updated = local.map(a => {
          if (a.driverId === payload.driverId && a.date === todayStr) {
            const breaks = a.breaks || [];
            breaks.push({
              type: payload.type,
              breakStart: timeStr,
              gps: payload.gps,
              remarks: payload.remarks,
              duration: 0
            });
            const timeline = a.timeline || [];
            timeline.push({
              time: timeStr,
              event: 'Lunch Break',
              description: `Halted for ${payload.type}. Remarks: ${payload.remarks || 'None'}`,
              gps: payload.gps
            });
            return {
              ...a,
              currentStatus: 'On Break' as any,
              breaks,
              timeline
            };
          }
          return a;
        });

        LocalStorageFallback.set('smartops_attendance', updated);
        return updated.find(a => a.driverId === payload.driverId && a.date === todayStr) as AttendanceRecord;
      }
    },
    endBreak: async (payload: { driverId: string; gps: string }): Promise<AttendanceRecord> => {
      try {
        const res = await axiosInstance.post('/attendance/end-break', payload);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance);
        const todayStr = new Date().toISOString().split('T')[0];
        const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const updated = local.map(a => {
          if (a.driverId === payload.driverId && a.date === todayStr) {
            const breaks = a.breaks || [];
            const activeBreak = breaks.find(b => !b.breakEnd);
            let diff = 0;
            if (activeBreak) {
              activeBreak.breakEnd = timeStr;
              
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

              diff = Math.max(0, endMin - startMin);
              activeBreak.duration = diff;
            }

            const timeline = a.timeline || [];
            timeline.push({
              time: timeStr,
              event: 'Resume Duty',
              description: `Break ended. Duty resumed. Duration: ${diff} mins.`,
              gps: payload.gps
            });

            return {
              ...a,
              currentStatus: 'On Duty' as any,
              breakDuration: (a.breakDuration || 0) + diff,
              breaks,
              timeline
            };
          }
          return a;
        });

        LocalStorageFallback.set('smartops_attendance', updated);
        return updated.find(a => a.driverId === payload.driverId && a.date === todayStr) as AttendanceRecord;
      }
    },
    endDuty: async (payload: { 
      driverId: string; 
      checkOutGPS?: string; 
      tripsCompleted: number; 
      distanceCovered: number; 
      fuelUsed: number;
      checkOutTime?: string;
      latitude?: number;
      longitude?: number;
      address?: string;
    }): Promise<AttendanceRecord> => {
      try {
        const res = await axiosInstance.post('/attendance/end-duty', payload);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance);
        const todayStr = new Date().toISOString().split('T')[0];
        const finalCheckOutTime = payload.checkOutTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const updated = local.map(a => {
          if (a.driverId === payload.driverId && a.date === todayStr) {
            const [sTime, sMod] = a.checkIn.split(' ');
            const [sH, sM] = sTime.split(':').map(Number);
            let startMin = sH * 60 + sM;
            if (sMod === 'PM' && sH !== 12) startMin += 720;
            if (sMod === 'AM' && sH === 12) startMin -= 720;

            const [eTime, eMod] = finalCheckOutTime.split(' ');
            const [eH, eM] = eTime.split(':').map(Number);
            let endMin = eH * 60 + eM;
            if (eMod === 'PM' && eH !== 12) endMin += 720;
            if (eMod === 'AM' && eH === 12) endMin -= 720;

            const totalMin = Math.max(0, endMin - startMin);
            const workingHours = Number((totalMin / 60).toFixed(2));
            const overtime = Math.max(0, workingHours - 8);

            const timeline = a.timeline || [];
            timeline.push({
              time: finalCheckOutTime,
              event: 'End Duty',
              description: `Shift completed. Distance covered: ${payload.distanceCovered}km. Total hours: ${workingHours}.`,
              gps: payload.checkOutGPS || (payload.latitude && payload.longitude ? `${payload.latitude}, ${payload.longitude}` : '')
            });

            let score = 100;
            if (a.attendanceStatus === 'Late') score -= 10;
            if (a.breakDuration && a.breakDuration > 60) score -= 5;

            return {
              ...a,
              checkOut: finalCheckOutTime,
              checkOutTime: finalCheckOutTime,
              checkOutGPS: payload.checkOutGPS || (payload.latitude && payload.longitude ? `${payload.latitude}, ${payload.longitude}` : ''),
              latitude: payload.latitude !== undefined ? payload.latitude : a.latitude,
              longitude: payload.longitude !== undefined ? payload.longitude : a.longitude,
              address: payload.address || a.address,
              workingHours,
              overtime,
              tripsCompleted: payload.tripsCompleted,
              distanceCovered: payload.distanceCovered,
              fuelUsed: payload.fuelUsed,
              performanceScore: score,
              currentStatus: 'Off Duty' as any,
              timeline
            };
          }
          return a;
        });

        LocalStorageFallback.set('smartops_attendance', updated);
        return updated.find(a => a.driverId === payload.driverId && a.date === todayStr) as AttendanceRecord;
      }
    },
    create: async (record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
      try {
        const res = await axiosInstance.post('/attendance', record);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance);
        const newRecord = { ...record, id: `a-${Date.now()}` };
        local.push(newRecord);
        LocalStorageFallback.set('smartops_attendance', local);
        return newRecord;
      }
    },
    update: async (id: string, record: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
      try {
        const res = await axiosInstance.put(`/attendance/${id}`, record);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance);
        const updated = local.map(a => a.id === id ? { ...a, ...record } : a);
        LocalStorageFallback.set('smartops_attendance', updated);
        return updated.find(a => a.id === id) as AttendanceRecord;
      }
    },
    delete: async (id: string): Promise<void> => {
      try {
        await axiosInstance.delete(`/attendance/${id}`);
      } catch (err) {
        const local = LocalStorageFallback.get<AttendanceRecord>('smartops_attendance', mockAttendance);
        const filtered = local.filter(a => a.id !== id);
        LocalStorageFallback.set('smartops_attendance', filtered);
      }
    }
  },

  // 4. SALARY CRUD
  salary: {
    getAll: async (): Promise<PayrollRecord[]> => {
      try {
        const res = await axiosInstance.get('/salary');
        return res.data.map((item: any) => ({ ...item, id: item._id || item.id }));
      } catch (err) {
        return LocalStorageFallback.get<PayrollRecord>('smartops_salary', mockPayroll);
      }
    },
    create: async (pay: Omit<PayrollRecord, 'id'>): Promise<PayrollRecord> => {
      try {
        const res = await axiosInstance.post('/salary', pay);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<PayrollRecord>('smartops_salary', mockPayroll);
        const newPay = { ...pay, id: `p-${Date.now()}` };
        local.push(newPay);
        LocalStorageFallback.set('smartops_salary', local);
        return newPay;
      }
    },
    update: async (id: string, pay: Partial<PayrollRecord>): Promise<PayrollRecord> => {
      try {
        const res = await axiosInstance.put(`/salary/${id}`, pay);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<PayrollRecord>('smartops_salary', mockPayroll);
        const updated = local.map(p => p.id === id ? { ...p, ...pay } : p);
        LocalStorageFallback.set('smartops_salary', updated);
        return updated.find(p => p.id === id) as PayrollRecord;
      }
    },
    delete: async (id: string): Promise<void> => {
      try {
        await axiosInstance.delete(`/salary/${id}`);
      } catch (err) {
        const local = LocalStorageFallback.get<PayrollRecord>('smartops_salary', mockPayroll);
        const filtered = local.filter(p => p.id !== id);
        LocalStorageFallback.set('smartops_salary', filtered);
      }
    }
  },

  // 5. FLEET VEHICLES CRUD
  fleet: {
    getAll: async (): Promise<Vehicle[]> => {
      try {
        const res = await axiosInstance.get('/fleet');
        return res.data.map((item: any) => ({ ...item, id: item._id || item.id }));
      } catch (err) {
        return LocalStorageFallback.get<Vehicle>('smartops_fleet', mockVehicles);
      }
    },
    create: async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
      try {
        const res = await axiosInstance.post('/fleet', vehicle);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<Vehicle>('smartops_fleet', mockVehicles);
        const newVehicle = { ...vehicle, id: `v-${Date.now()}` };
        local.push(newVehicle);
        LocalStorageFallback.set('smartops_fleet', local);
        return newVehicle;
      }
    },
    update: async (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
      try {
        const res = await axiosInstance.put(`/fleet/${id}`, vehicle);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<Vehicle>('smartops_fleet', mockVehicles);
        const updated = local.map(v => v.id === id ? { ...v, ...vehicle } : v);
        LocalStorageFallback.set('smartops_fleet', updated);
        return updated.find(v => v.id === id) as Vehicle;
      }
    },
    delete: async (id: string): Promise<void> => {
      try {
        await axiosInstance.delete(`/fleet/${id}`);
      } catch (err) {
        const local = LocalStorageFallback.get<Vehicle>('smartops_fleet', mockVehicles);
        const filtered = local.filter(v => v.id !== id);
        LocalStorageFallback.set('smartops_fleet', filtered);
      }
    }
  },

  // 6. TRIP MANAGEMENT
  trips: {
    getAll: async (): Promise<Trip[]> => {
      try {
        const res = await axiosInstance.get('/trips');
        return res.data.map((item: any) => ({ ...item, id: item._id || item.id }));
      } catch (err) {
        return LocalStorageFallback.get<Trip>('smartops_trips', mockTrips);
      }
    },
    getActive: async (): Promise<Trip | null> => {
      try {
        const res = await axiosInstance.get('/trips/active');
        return res.data ? { ...res.data, id: res.data._id || res.data.id } : null;
      } catch (err) {
        const local = LocalStorageFallback.get<Trip>('smartops_trips', mockTrips);
        const active = local.find(t => t.status !== 'Completed' && (t as any).status !== 'Cancelled');
        return active || local[0] || null;
      }
    },
    getById: async (id: string): Promise<Trip> => {
      try {
        const res = await axiosInstance.get(`/trips/${id}`);
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err) {
        const local = LocalStorageFallback.get<Trip>('smartops_trips', mockTrips);
        const trip = local.find(t => t.id === id);
        if (!trip) throw new Error('Trip not found');
        return trip;
      }
    },
    start: async (id: string): Promise<Trip> => {
      try {
        const res = await axiosInstance.put('/trips/start', { id });
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err) {
        return api.trips.updateStatus(id, 'In Transit');
      }
    },
    updateLocation: async (payload: { id: string; latitude?: number; longitude?: number; distanceRemaining?: number; eta?: string }): Promise<Trip> => {
      try {
        const res = await axiosInstance.put('/trips/update-location', payload);
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err) {
        const local = LocalStorageFallback.get<Trip>('smartops_trips', mockTrips);
        const updated = local.map(t => {
          if (t.id === payload.id) {
            return {
              ...t,
              ...(payload.distanceRemaining !== undefined ? { distanceRemaining: payload.distanceRemaining } : {}),
              ...(payload.eta ? { eta: payload.eta } : {})
            };
          }
          return t;
        });
        LocalStorageFallback.set('smartops_trips', updated);
        return updated.find(t => t.id === payload.id) as Trip;
      }
    },
    complete: async (id: string, details?: { signatureData?: string; photo?: string }): Promise<Trip> => {
      try {
        const res = await axiosInstance.put('/trips/complete', { id, ...details });
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err) {
        return api.trips.updateStatus(id, 'Completed', details);
      }
    },
    updateStatus: async (id: string, status: Trip['status'], details?: any): Promise<Trip> => {
      try {
        const res = await axiosInstance.put(`/trips/${id}`, { status, ...details });
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<Trip>('smartops_trips', mockTrips);
        const updated = local.map(t => {
          if (t.id === id) {
            const up: any = { ...t, status };
            if (details?.stopReason) up.stopReason = details.stopReason;
            if (details?.signatureData) up.signatureData = details.signatureData;
            if (details?.deliveryPhoto) {
              up.deliveryPhoto = details.deliveryPhoto;
            } else if (details?.photo) {
              up.deliveryPhoto = up.deliveryPhoto ? [...up.deliveryPhoto, details.photo] : [details.photo];
            }
            return up;
          }
          return t;
        });
        LocalStorageFallback.set('smartops_trips', updated);
        return updated.find(t => t.id === id) as Trip;
      }
    }
  },

  // 7. PROOF OF DELIVERY (POD) API
  pod: {
    getAll: async (params?: { status?: string; driver?: string; vehicle?: string; customer?: string; orderNumber?: string; date?: string }): Promise<PODRecord[]> => {
      try {
        const res = await axiosInstance.get('/pod', { params });
        return res.data.map((item: any) => ({ ...item, id: item._id || item.id }));
      } catch (err) {
        let local = LocalStorageFallback.get<PODRecord>('smartops_pods', mockPODs);
        if (params) {
          if (params.status) local = local.filter(p => p.status === params.status);
          if (params.driver) local = local.filter(p => p.driverName.toLowerCase().includes(params.driver!.toLowerCase()));
          if (params.vehicle) local = local.filter(p => p.vehicleNumber.toLowerCase().includes(params.vehicle!.toLowerCase()));
          if (params.customer) local = local.filter(p => p.customerName.toLowerCase().includes(params.customer!.toLowerCase()));
          if (params.orderNumber) local = local.filter(p => p.orderNumber.toLowerCase().includes(params.orderNumber!.toLowerCase()));
          if (params.date) local = local.filter(p => p.createdAt.startsWith(params.date!));
        }
        return local;
      }
    },
    getDriverPODs: async (): Promise<PODRecord[]> => {
      try {
        const res = await axiosInstance.get('/pod/driver');
        return res.data.map((item: any) => ({ ...item, id: item._id || item.id }));
      } catch (err) {
        return LocalStorageFallback.get<PODRecord>('smartops_pods', mockPODs);
      }
    },
    getById: async (id: string): Promise<PODRecord> => {
      try {
        const res = await axiosInstance.get(`/pod/${id}`);
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err) {
        const local = LocalStorageFallback.get<PODRecord>('smartops_pods', mockPODs);
        const item = local.find(p => p.id === id || p.podId === id);
        if (!item) throw new Error('POD record not found');
        return item;
      }
    },
    upload: async (payload: {
      orderNumber: string;
      vehicleNumber: string;
      customerName: string;
      customerAddress: string;
      imageUrl: string;
      signatureUrl?: string;
      remarks?: string;
      latitude?: number;
      longitude?: number;
    }): Promise<PODRecord> => {
      try {
        const res = await axiosInstance.post('/pod/upload', payload);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<PODRecord>('smartops_pods', mockPODs);
        
        // Prevent duplicate
        const duplicate = local.find(p => p.orderNumber === payload.orderNumber);
        if (duplicate) {
          throw new Error(`POD for Order ${payload.orderNumber} has already been uploaded.`);
        }

        const podId = `POD-2026-${String(local.length + 8801).padStart(4, '0')}`;
        
        const newRecord: PODRecord = {
          id: `pod-${Date.now()}`,
          podId,
          driverId: 'u-driver',
          driverName: 'Rajesh Kumar',
          vehicleNumber: payload.vehicleNumber,
          orderNumber: payload.orderNumber,
          customerName: payload.customerName,
          customerAddress: payload.customerAddress,
          imageUrl: payload.imageUrl,
          signatureUrl: payload.signatureUrl,
          remarks: payload.remarks,
          latitude: payload.latitude,
          longitude: payload.longitude,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        local.unshift(newRecord);
        LocalStorageFallback.set('smartops_pods', local);
        return newRecord;
      }
    },
    approve: async (id: string): Promise<PODRecord> => {
      try {
        const res = await axiosInstance.put(`/pod/approve/${id}`);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<PODRecord>('smartops_pods', mockPODs);
        const updated = local.map(p => p.id === id || p.podId === id ? { 
          ...p, 
          status: 'Approved' as const, 
          approvedBy: 'Harsh Vardhan', 
          approvedAt: new Date().toISOString(),
          rejectedReason: undefined
        } : p);
        LocalStorageFallback.set('smartops_pods', updated);
        return updated.find(p => p.id === id || p.podId === id) as PODRecord;
      }
    },
    reject: async (id: string, rejectedReason: string): Promise<PODRecord> => {
      try {
        const res = await axiosInstance.put(`/pod/reject/${id}`, { rejectedReason });
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<PODRecord>('smartops_pods', mockPODs);
        const updated = local.map(p => p.id === id || p.podId === id ? { 
          ...p, 
          status: 'Rejected' as const, 
          rejectedReason,
          approvedBy: undefined,
          approvedAt: undefined
        } : p);
        LocalStorageFallback.set('smartops_pods', updated);
        return updated.find(p => p.id === id || p.podId === id) as PODRecord;
      }
    },
    delete: async (id: string): Promise<void> => {
      try {
        await axiosInstance.delete(`/pod/${id}`);
      } catch (err) {
        const local = LocalStorageFallback.get<PODRecord>('smartops_pods', mockPODs);
        const filtered = local.filter(p => p.id !== id && p.podId !== id);
        LocalStorageFallback.set('smartops_pods', filtered);
      }
    }
  }
};

import { mockPODs } from './mockData';
