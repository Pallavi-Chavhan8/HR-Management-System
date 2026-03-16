# HR Management System

A full-stack Human Resource Management System built for **Shriram Solutions Pvt. Ltd.**, enabling streamlined management of employees, interns, trainees, departments, payroll, and certificates — all through a clean, role-based admin dashboard.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Default Admin Credentials](#default-admin-credentials)
- [Scripts](#scripts)
- [Screenshots](#screenshots)
- [License](#license)

---

## Features

### Dashboard
- Real-time statistics: total employees, interns, departments, and salary expense
- Overview cards with live data fetched from the backend

### Employee Management
- Add, view, edit, and delete employees
- Auto-generated Employee IDs (`EMP00001`, `EMP00002`, …)
- Fields: name, email, phone, date of birth, department, designation, salary, joining date, status
- Status tracking: **Active**, **Inactive**, **On Leave**
- Full-text search across name, email, designation, department

### Intern Management
- Add, view, edit, and delete interns
- Auto-generated Intern IDs (`INT00001`, `INT00002`, …)
- Track internship duration, course, start & end dates
- Status: **Active** / **Completed**

### Trainee Management
- Add, view, edit, and delete trainees
- Auto-generated Trainee IDs (`TRN00001`, `TRN00002`, …)
- Similar lifecycle tracking to interns

### Department Management
- Create and manage departments
- Department listing with edit and delete support

### Salary / Payroll
- Salary record creation per employee
- View and manage individual salary details
- Exportable payroll data

### Certificates
- One-click experience letter / internship certificate generation
- Dynamic certificate content per role (Employee, Intern, Trainee)
- PDF download powered by `jsPDF` + `html2canvas`

### Authentication & Security
- JWT-based authentication (access token stored securely)
- Protected routes — unauthenticated users are redirected to login
- Password hashing with `bcrypt`
- HTTP security headers via `helmet`
- CORS and rate-limiting protection

### Export
- Export employee, intern, trainee, and salary data to **CSV** or **Excel** (`.xlsx`)

---

## Tech Stack

| Layer       | Technology |
|-------------|-----------|
| Frontend    | React 18, Vite, Tailwind CSS, React Router v7 |
| UI Components | Radix UI, Lucide React, shadcn-style primitives |
| State / Auth | React Context API, Axios |
| PDF Export  | jsPDF, jsPDF-AutoTable, html2canvas |
| Spreadsheet | SheetJS (`xlsx`) |
| Backend     | Node.js, Express.js |
| Database    | MongoDB, Mongoose |
| Auth        | JSON Web Tokens (JWT), bcrypt |
| Security    | Helmet, CORS |
| Dev Tools   | Nodemon, ESLint |

---

## Project Structure

```
hr-management-system/
├── backend/
│   └── src/
│       ├── config/          # DB & env configuration
│       ├── constants/       # Role constants
│       ├── controllers/     # Route handler logic
│       ├── middleware/      # Auth, error, notFound middleware
│       ├── models/          # Mongoose schemas (Employee, Intern, Trainee, Dept…)
│       ├── routes/          # Express routers
│       ├── scripts/         # Seed & migration scripts
│       └── utils/           # ApiError, ApiResponse, asyncHandler
└── frontend/
    └── src/
        ├── components/      # Reusable UI (tables, forms, layout, cards)
        ├── context/         # AuthContext
        ├── pages/           # Feature pages (employees, interns, salary…)
        ├── routes/          # AppRoutes + route config
        ├── services/        # Axios API layer per feature
        └── utils/           # Export, PDF, search, validation helpers
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** — local instance or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI

---

### Backend Setup

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create the environment file (see Environment Variables below)
copy .env.example .env   # Windows
cp .env.example .env     # macOS / Linux

# 4. Seed the default admin account
npm run seed:admin

# 5. Start the development server
npm run dev
```

The API will be available at `http://localhost:5000`.

---

### Frontend Setup

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
COMPANY_NAME=Shriram Solutions Pvt. Ltd.
```

| Variable       | Description                                 | Default                        |
|----------------|---------------------------------------------|--------------------------------|
| `PORT`         | Port the backend server listens on          | `5000`                         |
| `MONGO_URI`    | MongoDB connection string                   | —                              |
| `JWT_SECRET`   | Secret key used to sign JWTs                | —                              |
| `JWT_EXPIRES_IN` | JWT expiry duration                       | `1d`                           |
| `CORS_ORIGIN`  | Allowed frontend origin                     | `http://localhost:5173`        |
| `COMPANY_NAME` | Displayed on generated certificates         | `Shriram Solutions Pvt. Ltd.`  |

---

## API Overview

All endpoints are prefixed with `/api/v1`.

| Resource      | Base Path                    | Methods                          |
|---------------|------------------------------|----------------------------------|
| Auth          | `/api/v1/auth`               | POST `/login`, POST `/register`  |
| Employees     | `/api/v1/employees`          | GET, POST, PUT, DELETE           |
| Interns       | `/api/v1/interns`            | GET, POST, PUT, DELETE           |
| Trainees      | `/api/v1/trainees`           | GET, POST, PUT, DELETE           |
| Departments   | `/api/v1/departments`        | GET, POST, PUT, DELETE           |
| Salary        | `/api/v1/salary`             | GET, POST, PUT, DELETE           |
| Certificates  | `/api/v1/certificates`       | GET (lookup by ID)               |
| Dashboard     | `/api/v1/dashboard`          | GET `/stats`                     |
| Health        | `/health`                    | GET                              |

> All protected routes require a `Bearer <token>` header.

---

## Default Admin Credentials

After running `npm run seed:admin` in the backend:

| Field    | Value               |
|----------|---------------------|
| Email    | `admin@hrms.com`    |
| Password | `Admin@123`         |

> **Change this password immediately in any production deployment.**

---

## Scripts

### Backend

| Command                          | Description                                      |
|----------------------------------|--------------------------------------------------|
| `npm run dev`                    | Start backend with Nodemon (hot-reload)          |
| `npm start`                      | Start backend in production mode                 |
| `npm run seed:admin`             | Seed the default admin account into MongoDB      |
| `npm run migrate:serial-ids`     | Migrate legacy records to auto-increment IDs     |
| `npm run migrate:serial-ids:dry` | Dry-run the migration (no DB writes)             |
| `npm run lint`                   | Run ESLint on all backend source files           |

### Frontend

| Command          | Description                             |
|------------------|-----------------------------------------|
| `npm run dev`    | Start Vite development server           |
| `npm run build`  | Build the app for production            |
| `npm run preview`| Preview the production build locally    |

---

## License

This project was developed as part of an internship at **Shriram Solutions Pvt. Ltd.** and is intended for internal use.

---

<p align="center">
  Made with ❤️ by <strong>Pallavi Chavhan</strong> &nbsp;|&nbsp; Shriram Solutions Internship 2025
</p>
