# SmartOps Database Specifications

The backend persistent layer utilizes MongoDB. Schemas are structured using Mongoose models in the `backend/src/models/` folder.

---

## 📋 Database Collection Models

### 1. User (`User.ts`)
- Mappings for admin managers and driver operators:
  - `fullName`: `String` (Required)
  - `email`: `String` (Required, Unique index)
  - `mobileNumber`: `String`
  - `role`: `String` (`'Owner' | 'Driver'`)
  - `passwordHash`: `String` (Required)
  - `companyName`: `String` (Owner profile fields)
  - `driverId`: `String` (Driver identifier prefix e.g., `DRV-9041`)
  - `vehicleNumber`: `String` (Assigned carrier)
  - `licenseNumber`: `String` (Compliance records)

### 2. Inventory (`Inventory.ts`)
- Warehouse catalog:
  - `itemName`: `String` (Required)
  - `category`: `String`
  - `sku`: `String` (Unique barcode tag)
  - `quantity`: `Number`
  - `minimumQuantity`: `Number` (Safety stock threshold)
  - `warehouse`: `String`
  - `purchasePrice`: `Number`
  - `sellingPrice`: `Number`
  - `supplier`: `String`

### 3. Vehicle (`Vehicle.ts`)
- Fleet management items:
  - `vehicleNumber`: `String` (Required, Unique index)
  - `vehicleType`: `String`
  - `driver`: `String` (Operator name)
  - `rcNumber`: `String`
  - `insurance`: `String` (Renewal dates)
  - `permit`: `String`
  - `fitness`: `String`
  - `fuelType`: `String`
  - `mileage`: `Number`
  - `currentLocation`: `String`
  - `status`: `String` (`'Moving' | 'Idle' | 'Maintenance'`)

### 4. Attendance (`Attendance.ts`)
- Duty checks telemetry:
  - `driverId`: `String` (Required)
  - `employeeName`: `String`
  - `checkIn` / `checkOut`: `String` (Timestamp formats)
  - `checkInGPS` / `checkOutGPS`: `String` (Latitude/Longitude strings)
  - `currentStatus`: `String` (`'On Duty' | 'On Break' | 'Off Duty' | 'Emergency'`)
  - `workingHours` / `breakDuration`: `Number`
  - `timeline`: `Array` (Chronological route nodes list containing `time`, `event`, `description`, `gps`)
