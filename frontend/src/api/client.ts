import axios from 'axios';
import { User, Vehicle, Trip, Task, InventoryItem, PayrollRecord, AttendanceRecord, PODRecord, DriverRecord, Company } from '../types';
import { mockVehicles, mockTrips, mockTasks, mockInventory, mockPayroll, mockAttendance } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios Instance — higher timeout for DB-backed operations
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000  // 15 seconds: accommodates MongoDB Atlas cold starts and slow connections
});

// ── REQUEST INTERCEPTOR: attach Bearer token ──────────────────────────────────
axiosInstance.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('smartops_jwt');
  // Only attach token if it is a real JWT (not empty, not the legacy mock string)
  if (token && token !== 'mock_jwt_token_payload' && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error: any) => Promise.reject(error));

// ── RESPONSE INTERCEPTOR: global 401 / session-expired handler ───────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired — clear session and redirect to login
      const currentToken = localStorage.getItem('smartops_jwt');
      // Only auto-redirect if there was actually a token (avoid redirect loops on login page)
      if (currentToken) {
        console.warn('[SmartOps Auth] Session expired (401). Clearing token and redirecting to login.');
        localStorage.removeItem('smartops_jwt');
        localStorage.removeItem('smartops_user');
        // Dispatch a custom event so React components can react (e.g., reset user state)
        window.dispatchEvent(new CustomEvent('smartops:session-expired'));
        // Redirect to login if not already there
        if (!window.location.pathname.startsWith('/login') && window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

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
        // Validate the token is a real JWT before storing
        const receivedToken: string = res.data.token || '';
        if (receivedToken && receivedToken !== 'mock_jwt_token_payload') {
          localStorage.setItem('smartops_jwt', receivedToken);
        }
        return res.data;
      } catch (err: any) {
        // If the backend returned an HTTP error response (400, 401, 404, 500, etc.),
        // always propagate it — NEVER fall back to mock. Only the catch block for
        // network-level failures (no response at all) may use offline mode.
        if (err.response) {
          throw err;
        }
        // Network-level failure only (no response = backend truly unreachable)
        console.warn('[SmartOps Auth] Backend unreachable. Offline mode activated.');
        const isOwner = role === 'Owner';
        const mockUser: User = {
          id: isOwner ? 'u-owner-rehan' : 'u-driver',
          fullName: isOwner ? 'Rehan Chaudhari' : email.split('@')[0],
          email: isOwner ? 'rehanchaudhari181133@gmail.com' : email,
          mobileNumber: '9999999999',
          role: role as any,
          companyName: isOwner ? 'SmartOps Manufacturing Ltd.' : undefined,
          driverId: role === 'Driver' ? `DRV-${Date.now().toString().slice(-4)}` : undefined,
          vehicleNumber: role === 'Driver' ? 'MH-12-QW-9874' : undefined,
          licenseNumber: role === 'Driver' ? 'DL-MH12-9988' : undefined,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(isOwner ? 'Rehan Chaudhari' : email)}&backgroundColor=2563EB`
        };
        // IMPORTANT: Do NOT store 'mock_jwt_token_payload' — store empty string so
        // authenticated endpoints get a clean 401 rather than a confusing 403.
        // The offline session still works for non-authenticated features.
        localStorage.removeItem('smartops_jwt');
        return { token: '', user: mockUser };
      }
    },
    register: async (payload: any): Promise<{ success?: boolean; message: string; otpCode?: string; token?: string; user?: User }> => {
      try {
        const res = await axiosInstance.post('/auth/register', payload);
        if (res.data.token) {
          localStorage.setItem('smartops_jwt', res.data.token);
        }
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
          companyId: payload.role === 'Owner' ? `CMP-OFFLINE` : undefined,
          companyName: payload.companyName,
          driverId: payload.driverId,
          vehicleNumber: payload.vehicleNumber,
          licenseNumber: payload.licenseNumber,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.fullName)}`
        };
        localStorage.setItem('smartops_jwt', 'mock_jwt_token_payload');
        return { message: 'Registration initiated.', token: 'mock_jwt_token_payload', user: mockUser };
      }
    },
    verifyOTP: async (payload: { email?: string; mobileNumber?: string; channel?: 'email' | 'mobile'; otpCode: string }): Promise<{ message: string; token?: string; user?: User }> => {
      try {
        const res = await axiosInstance.post('/auth/verify-otp', payload);
        if (res.data.token) {
          localStorage.setItem('smartops_jwt', res.data.token);
        }
        return res.data;
      } catch (err: any) {
        if (err.response) {
          throw err;
        }
        return { message: 'Account verified successfully.' };
      }
    },
    resendOTP: async (payload: { email?: string; mobileNumber?: string; channel?: 'email' | 'mobile' }): Promise<{ success?: boolean; message: string; channel?: string; cooldownSeconds?: number }> => {
      try {
        const res = await axiosInstance.post('/auth/send-otp', payload);
        return res.data;
      } catch (err: any) {
        if (err.response) {
          throw err;
        }
        return { message: 'New OTP sent.' };
      }
    },
    forgotPassword: async (email: string): Promise<{ message: string; otpCode?: string }> => {
      try {
        const res = await axiosInstance.post('/auth/forgot-password', { email });
        return res.data;
      } catch (err: any) {
        if (err.response) {
          throw err;
        }
        return { message: `Password reset OTP dispatched to ${email}.` };
      }
    },
    resetPassword: async (payload: { email: string; otpCode: string; newPassword: string }): Promise<{ message: string }> => {
      try {
        const res = await axiosInstance.post('/auth/reset-password', payload);
        return res.data;
      } catch (err: any) {
        if (err.response) {
          throw err;
        }
        return { message: 'Password has been updated successfully.' };
      }
    },
    googleAuth: async (_googleToken: string, _role: string): Promise<{ token: string; user: User }> => {
      throw new Error('Google authentication is temporarily disabled.');
      /*
      // TEMPORARILY DISABLED GOOGLE OAUTH API CALL
      const res = await axiosInstance.post('/auth/google', { idToken: _googleToken, googleToken: _googleToken, role: _role });
      if (res.data.token) {
        localStorage.setItem('smartops_jwt', res.data.token);
      }
      return res.data;
      */
    }
  },

  // 2. INVENTORY CRUD
  inventory: {
    getAll: async (): Promise<InventoryItem[]> => {
      try {
        const res = await axiosInstance.get('/inventory');
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        return list.map((item: any) => ({ ...item, id: item._id || item.id }));
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
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        return list.map((item: any) => ({ ...item, id: item._id || item.id }));
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
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        return list.map((item: any) => ({ ...item, id: item._id || item.id }));
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
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        return list.map((item: any) => ({ ...item, id: item._id || item.id }));
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
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        return list.map((item: any) => ({ ...item, id: item._id || item.id }));
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
    updateLocation: async (payload: { id: string; latitude?: number; longitude?: number; accuracy?: number; speed?: number; heading?: number; distanceRemaining?: number; eta?: string; timestamp?: string }): Promise<Trip> => {
      try {
        const res = await axiosInstance.post(`/trips/${payload.id}/location`, payload);
        const data = res.data?.data?.trip || res.data;
        return { ...data, id: data._id || data.id };
      } catch (err) {
        const local = LocalStorageFallback.get<Trip>('smartops_trips', mockTrips);
        const updated = local.map(t => {
          if (t.id === payload.id) {
            return {
              ...t,
              ...(payload.latitude && payload.longitude ? { currentLocation: `${payload.latitude}, ${payload.longitude}`, latitude: payload.latitude, longitude: payload.longitude } : {}),
              ...(payload.accuracy !== undefined ? { accuracy: payload.accuracy } : {}),
              ...(payload.speed !== undefined ? { speed: payload.speed } : {}),
              ...(payload.heading !== undefined ? { heading: payload.heading } : {}),
              ...(payload.distanceRemaining !== undefined ? { distanceRemaining: payload.distanceRemaining } : {}),
              ...(payload.eta ? { eta: payload.eta } : {}),
              lastGpsUpdate: new Date()
            };
          }
          return t;
        });
        LocalStorageFallback.set('smartops_trips', updated);
        return updated.find(t => t.id === payload.id) as Trip;
      }
    },
    getLocationHistory: async (tripId: string, filters?: { driverId?: string; startDate?: string; endDate?: string }): Promise<any[]> => {
      try {
        const res = await axiosInstance.get(`/trips/${tripId}/location-history`, { params: filters });
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
    },
    getLiveTracking: async (tripId: string): Promise<any> => {
      try {
        const res = await axiosInstance.get(`/trips/${tripId}/live-tracking`);
        return res.data;
      } catch (err) {
        const local = LocalStorageFallback.get<Trip>('smartops_trips', mockTrips);
        const trip = local.find(t => t.id === tripId) || local[0];
        return {
          tripId: trip?.id || tripId,
          tripNumber: trip?.tripNumber || '',
          driverName: trip?.driverName || '',
          driverId: trip?.driverId || '',
          vehicleNumber: trip?.vehicleNumber || '',
          status: trip?.status || 'In Transit',
          currentLocation: trip?.currentLocation || '',
          currentAddress: trip?.currentAddress || '',
          latitude: trip?.latitude || 0,
          longitude: trip?.longitude || 0,
          speed: 0,
          heading: 0,
          distanceRemaining: trip?.distanceRemaining || 0,
          eta: trip?.eta || 'N/A',
          pickupLocation: trip?.pickupLocation || '',
          pickupCoordinates: trip?.pickupCoordinates || { lat: 0, lng: 0 },
          dropLocation: trip?.dropLocation || '',
          dropCoordinates: trip?.dropCoordinates || { lat: 0, lng: 0 },
          locationHistory: [],
          googleNavUrl: ''
        };
      }
    },

    create: async (tripData: Partial<Trip>): Promise<Trip> => {
      try {
        const res = await axiosInstance.post('/trips', tripData);
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err: any) {
        if (err.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
        const local = LocalStorageFallback.get<Trip>('smartops_trips', mockTrips);
        const newTrip: Trip = {
          id: `trp-${Date.now()}`,
          tripNumber: tripData.tripNumber || `TRP-${Date.now().toString().slice(-6)}`,
          vehicleNumber: tripData.vehicleNumber || '',
          driverId: tripData.driverId || '',
          driverName: tripData.driverName || '',
          pickupLocation: tripData.pickupLocation || '',
          dropLocation: tripData.dropLocation || '',
          customerName: tripData.customerName || '',
          customerPhone: tripData.customerPhone || '',
          material: tripData.material || '',
          weight: tripData.weight || '',
          invoiceNumber: tripData.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
          priority: tripData.priority || 'Normal',
          cargo: tripData.cargo,
          stops: tripData.stops || [],
          scheduledStart: tripData.scheduledStart,
          expectedEnd: tripData.expectedEnd,
          notes: tripData.notes,
          status: 'Assigned',
          eta: '30 Mins',
          distanceRemaining: 15.0,
          timestamp: new Date().toISOString()
        };
        local.unshift(newTrip);
        LocalStorageFallback.set('smartops_trips', local);
        return newTrip;
      }
    },

    assign: async (id: string, payload: { driverId: string; driverName: string; vehicleNumber?: string }): Promise<Trip> => {
      try {
        const res = await axiosInstance.post(`/trips/${id}/assign`, payload);
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err) {
        return api.trips.updateStatus(id, 'Assigned', payload);
      }
    },
    accept: async (id: string): Promise<Trip> => {
      try {
        const res = await axiosInstance.post(`/trips/${id}/accept`);
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err) {
        return api.trips.updateStatus(id, 'Accepted');
      }
    },
    arriveStop: async (id: string, stopId: string, coords?: { latitude?: number; longitude?: number }): Promise<Trip> => {
      try {
        const res = await axiosInstance.post(`/trips/${id}/stops/${stopId}/arrive`, coords);
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err: any) {
        if (err.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
        return api.trips.updateStatus(id, 'At Stop');
      }
    },
    completeStop: async (id: string, stopId: string, details?: { podId?: string; stopReason?: string; notes?: string }): Promise<Trip> => {
      try {
        const res = await axiosInstance.post(`/trips/${id}/stops/${stopId}/complete`, details);
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err) {
        return api.trips.updateStatus(id, 'In Transit');
      }
    },
    reportDelay: async (id: string, reason: string, note?: string): Promise<Trip> => {
      try {
        const res = await axiosInstance.post(`/trips/${id}/delay`, { reason, note });
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err) {
        return api.trips.updateStatus(id, 'Delayed', { stopReason: reason });
      }
    },
    reportIncident: async (id: string, incidentType: string, description: string): Promise<Trip> => {
      try {
        const res = await axiosInstance.post(`/trips/${id}/incident`, { incidentType, description });
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err) {
        return api.trips.updateStatus(id, 'Incident Reported', { stopReason: `${incidentType}: ${description}` });
      }
    },
    cancel: async (id: string): Promise<Trip> => {
      try {
        const res = await axiosInstance.put(`/trips/${id}/cancel`);
        return { ...res.data, id: res.data._id || res.data.id };
      } catch (err) {
        return api.trips.updateStatus(id, 'Cancelled');
      }
    },
    complete: async (id: string, details?: { signatureData?: string; photo?: string }): Promise<Trip> => {
      try {
        const res = await axiosInstance.post(`/trips/${id}/end`, details);
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
        // Read the real logged-in driver from localStorage (set during login)
        const storedUser = (() => { try { return JSON.parse(localStorage.getItem('smartops_user') || '{}'); } catch { return {}; } })();
        const newRecord: PODRecord = {
          id: `pod-${Date.now()}`,
          podId,
          driverId: storedUser.id || storedUser.driverId || '',
          driverName: storedUser.fullName || '',
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
        const approver = (() => { try { return JSON.parse(localStorage.getItem('smartops_user') || '{}'); } catch { return {}; } })();
        const updated = local.map(p => p.id === id || p.podId === id ? { 
          ...p, 
          status: 'Approved' as const, 
          approvedBy: approver.fullName || 'Owner',
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
  },

  // 8. GOOGLE MAPS & GEOLOCATION PROXY API
  maps: {
    geocode: async (address: string): Promise<{ lat: number; lng: number }> => {
      try {
        const res = await axiosInstance.get('/maps/geocode', { params: { address } });
        return res.data;
      } catch (err) {
        return { lat: 18.5204, lng: 73.8567 };
      }
    },
    reverseGeocode: async (lat: number, lng: number): Promise<{ formattedAddress: string; city?: string; state?: string; country?: string }> => {
      try {
        const res = await axiosInstance.get('/maps/reverse-geocode', { params: { lat, lng } });
        return res.data;
      } catch (err) {
        return { formattedAddress: `Location: (${lat.toFixed(4)}, ${lng.toFixed(4)})` };
      }
    },
    getDistanceETA: async (origin: string, destination: string, speed?: number): Promise<{ distanceRemainingKm: number; distanceText: string; durationText: string; durationSeconds: number; etaString: string }> => {
      try {
        const res = await axiosInstance.get('/maps/distance-eta', { params: { origin, destination, speed } });
        return res.data;
      } catch (err) {
        return {
          distanceRemainingKm: 18.4,
          distanceText: '18.4 km',
          durationText: '25 mins',
          durationSeconds: 1500,
          etaString: '25 Mins'
        };
      }
    },
    getDirections: async (origin: string, destination: string, waypoints?: string[]): Promise<any> => {
      try {
        const res = await axiosInstance.get('/maps/directions', {
          params: { origin, destination, waypoints: waypoints ? waypoints.join('|') : undefined }
        });
        return res.data;
      } catch (err) {
        return { status: 'ZERO_RESULTS', routes: [] };
      }
    }
  },

  // 9. DRIVERS API — Owner-only, database-driven (NO localStorage fallback)
  drivers: {
    /**
     * Fetch all registered Driver accounts from MongoDB.
     * Throws on any error so the caller can render the proper error state.
     *
     * @param params.search  - partial match on name, email, mobile
     * @param params.status  - 'Active' | 'Inactive' | 'All'
     * @param params.page    - page number (default 1)
     * @param params.limit   - page size (default 20)
     */
    getAll: async (params?: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }): Promise<{ data: DriverRecord[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
      const res = await axiosInstance.get('/users/drivers', { params });
      return res.data;
    },

    /**
     * Soft-deactivate or reactivate a driver.
     * Sets isEmailVerified to true (active) or false (inactive) in MongoDB.
     */
    updateStatus: async (id: string, status: 'active' | 'inactive'): Promise<DriverRecord> => {
      const res = await axiosInstance.patch(`/users/drivers/${id}/status`, { status });
      return res.data.data as DriverRecord;
    },

    /**
     * Register a new driver via the existing auth endpoint.
     * Delegates to POST /api/auth/register with role=Driver.
     * On success the driver will immediately be visible in getAll().
     */
    register: async (payload: {
      fullName: string;
      email: string;
      mobileNumber?: string;
      password: string;
      driverId?: string;
      vehicleNumber?: string;
      licenseNumber?: string;
      companyId?: string;
      companyName?: string;
    }): Promise<{ success?: boolean; message: string; user?: User }> => {
      const res = await axiosInstance.post('/auth/register', {
        ...payload,
        role: 'Driver',
      });
      return res.data;
    },
  },

  // COMPANY API
  company: {
    /**
     * Public — checks if a company name is already taken.
     * Used for real-time validation on the Owner Registration form.
     */
    check: async (name: string): Promise<{ available: boolean; message: string }> => {
      try {
        const res = await axiosInstance.get('/company/check', { params: { name } });
        return res.data;
      } catch (err: any) {
        if (err.response) {
          throw err;
        }
        // Network offline — assume available so registration can proceed
        return { available: true, message: 'Offline — name check skipped.' };
      }
    },

    /**
     * Protected — returns the Company linked to the authenticated user.
     */
    getMyCompany: async (): Promise<Company | null> => {
      try {
        const res = await axiosInstance.get('/company/me');
        return res.data.company as Company;
      } catch (err) {
        return null;
      }
    },
  },
};


import { mockPODs } from './mockData';
