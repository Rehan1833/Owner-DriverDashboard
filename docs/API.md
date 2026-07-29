# SmartOps Backend API Documentation

The backend API handles authentication, inventory storage, fleet telemetries, payroll records, and driver tracking logs. All routes (excluding public auth paths) are protected by JWT Bearer authorization headers.

---

## 🔐 Authentication Endpoints

### 1. Register User
- **Endpoint**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "fullName": "Harsh Vardhan",
    "email": "harsh.v@smartops.com",
    "mobileNumber": "9876543210",
    "role": "Owner",
    "password": "password123",
    "companyName": "SmartOps Manufacturing Ltd."
  }
  ```
- **Response**: Returns a JWT token block and session profile details.

### 2. Login User
- **Endpoint**: `POST /api/auth/login`
- **Body**: `{"email": "harsh.v@smartops.com", "password": "password123"}`

---

## 📦 Inventory CRUD APIs

- **`GET /api/inventory`**: Retrieve all materials and stock lines.
- **`POST /api/inventory`**: Create a new inventory record.
- **`PUT /api/inventory/:id`**: Update stock counts or warehouse assignments.
- **`DELETE /api/inventory/:id`**: Remove an item from the catalog.

---

## 🚗 Attendance & Duty Tracking APIs

- **`GET /api/attendance`**: Fetch checking-in rosters.
- **`GET /api/attendance/live`**: Query active duty drivers.
- **`POST /api/attendance/start-duty`**: Register shift initialization.
- **`POST /api/attendance/start-break`**: Register break timer.
- **`POST /api/attendance/end-break`**: Terminate break timer.
- **`POST /api/attendance/end-duty`**: Clock out, calculate shift hours, and record trips/overtime/fuel.

---

## 📡 Real-time Socket.IO Telemetry Events

- **Channel event**: `telemetryUpdate`
- **Payload triggers**:
  - `start-duty`: Broadcasts check-in GPS variables when a driver logs in.
  - `start-break` / `end-break`: Broadcasts break location coordinate frames.
  - `end-duty`: Updates active dashboard metrics when a shift concludes.
  - `updateTrip`: Emits trip progress (distance remaining, ETA) coordinates.
