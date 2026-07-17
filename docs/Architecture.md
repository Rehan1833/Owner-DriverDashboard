# SmartOps Enterprise Architecture Blueprint

This document outlines the software engineering principles, folder structure, and scaling guidelines adopted for the SmartOps Logistics & Inventory Management Platform.

---

## 🏗️ Clean Architecture Overview

SmartOps follows a decoupled **Frontend/Backend Separation** model. Each codebase represents a distinct node, facilitating isolated development workflows, independent deployment pipelines, and vertical scalability.

```mermaid
graph TD
  subgraph Frontend Console
    V[View Layer: Pages & Components] -->|Uses| H[Hooks Layer: Business Logic]
    H -->|Calls| S[Services & API Clients]
    S -->|Queries| RT[React Query & Store States]
  end

  subgraph Backend API Gateway
    R[Router Layer] -->|Validates| Vld[Validator Middleware]
    Vld -->|Routes| C[Controller Actions]
    C -->|Invokes| Rep[Repository Query Layer]
    Rep -->|Queries| M[Mongoose Models]
  end

  Frontend Console -->|REST API & Websockets| Backend API Gateway
```

---

## 🛠️ Folder Conventions

### 1. Frontend Scope (`frontend/`)
- **`src/pages/`**: Render-only layout files grouped by actor role (`auth/`, `owner/`, `driver/`, `errors/`). Move complex business logic into custom hooks.
- **`src/components/`**: Domain components (`inventory/`, `fleet/`, `layout/`, etc.) and basic reusable UI tokens (`ui/`).
- **`src/services/`**: Exposes network configurations, client setups, and sound controllers.
- **`src/store/`**: Global react contexts and redux toolkit slices for session variables.
- **`src/styles/`**: Custom Tailwind colors, layout themes, and variables definitions.

### 2. Backend Scope (`backend/`)
- **`controllers/`**: Isolated route logic functions handling requests and returning REST responses.
- **`routes/`**: Route endpoints bindings with middleware integrations.
- **`models/`**: Mongoose schemas mapping strictly to MongoDB collections.
- **`sockets/`**: Realtime Socket.io emitters and telemetry update loops.

---

## 🚀 Scaling Guidelines for Future Modules

The platform is designed to seamlessly integrate modular extensions (e.g., **HRMS, CRM, Payroll, Vehicle Tracking, Finance, AI Analytics**) without major restructuring:
1. **Adding a New Domain Module**:
   - Create subfolders under `frontend/src/components/<module_name>` for component structures.
   - Register endpoints inside a new controller/route file: `backend/src/controllers/<module_name>Controller.ts`.
   - Setup a dedicated routing tree entry under `/owner` or `/driver` route scopes.
2. **SOLID & SOLID Conventions**:
   - Keep classes and controllers limited to a Single Responsibility (SRP).
   - Abstract common interfaces inside `types/index.ts` to enforce interface segregation (ISP).
