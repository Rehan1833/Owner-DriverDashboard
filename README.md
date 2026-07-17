# SmartOps Logistics & Inventory Management Platform

SmartOps is a production-ready, enterprise-grade logistics and warehouse inventory tracking SaaS application built with a decoupled monorepo workspace architecture.

---

## 🌟 Core Features

- **Executive Owner Console**: Provides 10 KPI indicators, central interactive chart switchers, geofenced driver status lists, telemetry widgets, and sorting/filtering tables.
- **Driver Operator Dashboard**: Optimized layout for mobile devices, enabling check-ins, break management, offline GPS mock logging, and Proof of Delivery (POD) photo/signature uploads.
- **Synthesized Notification Alerts**: Implements custom pure Web Audio API oscillator tones for real-time success, warning, error, and system updates.
- **Workspace Settings**: Supports sliding sound previews, credentials configurations, and JSON configuration backup packages.
- **Real-Time Telemetries**: Broadcasts live driver telemetry state coordinates via Socket.io channels.

---

## 📂 Architecture Structure

```
smartops-owner-dashboard/
├── frontend/             # React 19 Client Dashboard
│   ├── public/           # Static files
│   └── src/              # Page layouts, hooks, contexts, styling components
├── backend/              # Node.js + Express API Cluster
│   └── src/              # Controllers, routes, models, sockets, database seeds
├── docs/                 # Platform Design & API Specifications
└── docker-compose.yml    # Docker container orchestrations
```

---

## 🚀 Getting Started

### 1. Installation
Install workspace dependencies in both directories and the root concurrently:
```bash
npm install
```

### 2. Development Setup
Run the backend express server and the frontend client simultaneously in watch mode:
```bash
npm run dev
```
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API Gateway**: [http://localhost:5000](http://localhost:5000)

### 3. Production Build
Verify clean compilations and build distribution assets:
```bash
npm run build
```

---

## 📄 Detailed Documentation

For a comprehensive guide, please refer to:
- [System Architecture Blueprint](file:///c:/smartops-owner-dashboard/docs/Architecture.md)
- [Enterprise UI/UX Guidelines](file:///c:/smartops-owner-dashboard/docs/UI-Guidelines.md)
- [Backend REST & Websocket API Spec](file:///c:/smartops-owner-dashboard/docs/API.md)
- [Mongoose Model Schemas](file:///c:/smartops-owner-dashboard/docs/Database.md)
